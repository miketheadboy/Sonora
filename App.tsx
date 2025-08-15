import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Editor } from './components/Editor';
import { Sidebar } from './components/Sidebar';
import { GeneratedIdeaModal } from './components/GeneratedIdeaModal';
import { AnalysisModal } from './components/AnalysisModal';
import { LoadingOverlay } from './components/LoadingOverlay';
import { ErrorDisplay } from './components/ErrorDisplay';
import { SongStructureEditor } from './components/SongStructureEditor';
import { geminiService } from './services/geminiService';
import { audioService } from './services/audioService';
import type { GenerateIdeaParams, GenerateRhymesParams, GenerateSynonymsParams, GenerateWordAssociationsParams, RhythmSuggestion, GenerateRhythmParams, GenerateBlendedIdeaParams, Chord, SongSection, SectionType, ContentPart, Author, AudioAnalysisResult, SongData, GetInspirationalSparkParams } from './types';

const initialLyrics = `(Verse 1)
White walls and carbon paper lines
A city grid of my own design
Each angle true, each surface clean
A minimalist and flawless scene
I live my life in black and white
Beneath a single, perfect light

(Chorus)
But there's an emerald in the grey
A jungle growing in the entryway
A flash of coral, sharp and bright
A tropical fever in the night
You are the vine that breaks the stone
The hothouse heart I can't disown
Tearing all my blueprints apart
A wild design upon my heart
`;

// --- Robust Base64 Encoding for UTF-8 ---
const base64ToBytes = (base64: string) => {
    const binString = atob(base64);
    return Uint8Array.from(binString, (m) => m.codePointAt(0) as number);
}
const bytesToBase64 = (bytes: Uint8Array) => {
    const binString = Array.from(bytes, (x) => String.fromCodePoint(x)).join("");
    return btoa(binString);
}

// --- Helper Functions ---
const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
};

const parseLyricsToStructure = (lyrics: string): SongSection[] => {
    const sections: SongSection[] = [];
    const regex = /\(([^)]+)\)\s*([\sS]*?)(?=\s*\([^)]+\)|$)/g;
    let match;
    while ((match = regex.exec(lyrics)) !== null) {
        const fullTitle = match[1].trim();
        const content = match[2].trim();
        const typeMatch = fullTitle.match(/^(Verse|Chorus|Bridge|Intro|Outro|Pre-Chorus|Solo)/i);
        const type = (typeMatch ? typeMatch[0].charAt(0).toUpperCase() + typeMatch[0].slice(1).toLowerCase() : 'Verse') as SectionType;

        sections.push({
            id: `section-${Date.now()}-${sections.length}`,
            type: type,
            label: fullTitle,
            content: [{
                id: `part-${Date.now()}-${sections.length}`,
                author: 'user',
                text: content,
            }],
        });
    }
    if (sections.length === 0 && lyrics.trim()) {
        sections.push({
            id: `section-${Date.now()}-0`,
            type: 'Verse',
            label: 'Verse 1',
            content: [{
                id: `part-${Date.now()}-0`,
                author: 'user',
                text: lyrics.trim(),
            }],
        });
    }
    return sections;
};

const processLoadedSongData = (data: SongData): SongData => {
    // Recreate blobUrls from base64 data for audio playback
    const hydratedStructure = data.structure.map(section => {
        if (section.audio?.base64 && section.audio?.mimeType) {
            const blob = base64ToBlob(section.audio.base64, section.audio.mimeType);
            return {
                ...section,
                audio: {
                    ...section.audio,
                    blobUrl: URL.createObjectURL(blob),
                }
            };
        }
        return section;
    });
    return { ...data, structure: hydratedStructure };
};

const getInitialSongData = (): SongData => {
    // 1. Check for shared data in URL hash
    const hash = window.location.hash;
    if (hash.startsWith('#data=')) {
        try {
            const base64Data = hash.substring(6);
            const jsonData = new TextDecoder().decode(base64ToBytes(base64Data));
            const parsedData = JSON.parse(jsonData);
            if (Array.isArray(parsedData.structure) && Array.isArray(parsedData.progression) && typeof parsedData.key === 'string') {
                return processLoadedSongData(parsedData);
            }
        } catch (e) {
            console.error("Failed to parse shared data, falling back.", e);
        }
    }

    // 2. Check for saved data in localStorage
    const savedData = localStorage.getItem('sonora-ai-song');
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            if (Array.isArray(parsedData.structure) && Array.isArray(parsedData.progression) && typeof parsedData.key === 'string') {
                return processLoadedSongData(parsedData);
            }
        } catch (e) {
            console.error("Failed to parse saved data, falling back.", e);
        }
    }

    // 3. Fallback to initial default data
    return {
        structure: parseLyricsToStructure(initialLyrics),
        progression: [],
        key: 'C'
    };
};


const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const App: React.FC = () => {
    const [songData, setSongData] = useState<SongData>(getInitialSongData);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(songData.structure.length > 0 ? songData.structure[0].id : null);
    const [isStructurePanelOpen, setIsStructurePanelOpen] = useState(true);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [rhymes, setRhymes] = useState<string[]>([]);
    const [synonyms, setSynonyms] = useState<string[]>([]);
    const [wordAssociations, setWordAssociations] = useState<string[]>([]);
    const [creativePrompt, setCreativePrompt] = useState<string | null>(null);
    const [inspirationalSpark, setInspirationalSpark] = useState<string | null>(null);
    const [rhythmSuggestions, setRhythmSuggestions] = useState<RhythmSuggestion[]>([]);
    const [structureSuggestions, setStructureSuggestions] = useState<string[]>([]);
    const [generatedIdea, setGeneratedIdea] = useState<string | null>(null);
    const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
    const [songAnalysis, setSongAnalysis] = useState<string | AudioAnalysisResult | null>(null);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    
    const [chordLibrary, setChordLibrary] = useState<Chord[]>([]);

    const activeSection = songData.structure.find(s => s.id === activeSectionId);
    
    // Auto-save to local storage
    useEffect(() => {
        try {
            // Create a storable version of songData, removing blobUrls which cannot be stored
            const storableData: SongData = {
                ...songData,
                structure: songData.structure.map(section => {
                    if (!section.audio) return section;
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { blobUrl, ...storableAudio } = section.audio;
                    return { ...section, audio: storableAudio };
                }),
            };
            const jsonData = JSON.stringify(storableData);
            localStorage.setItem('sonora-ai-song', jsonData);
        } catch (e) {
            console.error("Could not save song to local storage", e);
        }
    }, [songData]);


    const handleError = (err: unknown) => {
        let friendlyMessage = "An unknown error occurred. Please check the console for details.";
        if (err instanceof Error) {
            // The GenAI library often wraps API errors in a message that is a JSON string.
            try {
                const errorObj = JSON.parse(err.message);
                if (errorObj.error && errorObj.error.message) {
                    friendlyMessage = errorObj.error.message;
                } else {
                    friendlyMessage = err.message;
                }
            } catch (e) {
                // If it's not JSON, it's a regular error message.
                friendlyMessage = err.message;
            }
        }
        
        // Specifically guide the user if it's an API key issue.
        if (friendlyMessage.includes("API key not valid")) {
            friendlyMessage = "The provided API key is not valid. Please ensure the API_KEY environment variable is set correctly.";
        }
    
        console.error(err);
        setError(`AI Error: ${friendlyMessage}`);
        audioService.stop();
    };
    
    // --- Structure & Content Handlers ---
    const handleAddContentPart = (sectionId: string, author: Author, text: string) => {
        if (!text.trim()) return;
        const newPart: ContentPart = {
            id: `part-${Date.now()}`,
            author,
            text,
        };
        setSongData(prev => ({
            ...prev,
            structure: prev.structure.map(s => s.id === sectionId ? { ...s, content: [...s.content, newPart] } : s)
        }));
    };
    
    const handleDeleteContentPart = (sectionId: string, partId: string) => {
        setSongData(prev => ({
            ...prev,
            structure: prev.structure.map(s => s.id === sectionId ? { ...s, content: s.content.filter(p => p.id !== partId) } : s)
        }));
    };

    const handleAddSection = (type: SectionType) => {
        const existingOfType = songData.structure.filter(s => s.type === type).length;
        const newSection: SongSection = {
            id: `section-${Date.now()}`,
            type,
            label: `${type} ${existingOfType + 1}`,
            content: [],
        };
        setSongData(prev => ({...prev, structure: [...prev.structure, newSection]}));
        setActiveSectionId(newSection.id);
    };

    const handleDeleteSection = (sectionId: string) => {
        setSongData(prev => {
            const newStructure = prev.structure.filter(s => s.id !== sectionId);
            if (activeSectionId === sectionId) {
                setActiveSectionId(newStructure.length > 0 ? newStructure[0].id : null);
            }
            return {...prev, structure: newStructure};
        });
    };
    
    const handleUpdateSection = (sectionId: string, updates: { type: SectionType, label: string }) => {
        setSongData(prev => ({
            ...prev,
            structure: prev.structure.map(s => 
                s.id === sectionId 
                ? { ...s, type: updates.type, label: updates.label } 
                : s
            )
        }));
    };

    const handleReorderSections = (startIndex: number, endIndex: number) => {
        setSongData(prev => {
            const result = Array.from(prev.structure);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
            return {...prev, structure: result};
        });
    };
    
    const handleApplyStructure = (structureString: string) => {
        const sectionTypes = structureString.split(',').map(s => s.trim() as SectionType);
        const typeCounts: { [key: string]: number } = {};

        const newStructure: SongSection[] = sectionTypes.map((type, index) => {
            typeCounts[type] = (typeCounts[type] || 0) + 1;
            return {
                id: `section-${Date.now()}-${index}`,
                type,
                label: `${type} ${typeCounts[type]}`,
                content: [{ id: `part-${Date.now()}-${index}`, author: 'user', text: `[${type} lyrics go here...]`}],
            };
        });
        setSongData(prev => ({...prev, structure: newStructure}));
        setActiveSectionId(newStructure.length > 0 ? newStructure[0].id : null);
    };

    // --- Audio Handlers ---
    const handleUpdateAudio = async (sectionId: string, audioBlob: Blob) => {
        const base64 = await blobToBase64(audioBlob);
        const blobUrl = URL.createObjectURL(audioBlob);
        setSongData(prev => ({
            ...prev,
            structure: prev.structure.map(s => 
                s.id === sectionId 
                ? { ...s, audio: { blobUrl, base64, mimeType: audioBlob.type } } 
                : s
            )
        }));
    };

    const handleDeleteAudio = (sectionId: string) => {
        setSongData(prev => ({
            ...prev,
            structure: prev.structure.map(s => {
                if (s.id === sectionId && s.audio) {
                    URL.revokeObjectURL(s.audio.blobUrl);
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { audio, ...rest } = s;
                    return rest;
                }
                return s;
            })
        }));
    };
    
    const handleAnalyzeAudio = useCallback(async (sectionId: string) => {
        const section = songData.structure.find(s => s.id === sectionId);
        if (!section || !section.audio) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const result = await geminiService.analyzeAudioPart(section.audio.base64, section.audio.mimeType);
            setSongAnalysis(result);
            setIsAnalysisModalOpen(true);
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    }, [songData.structure]);

    // --- Gemini Service Handlers ---
    const handleCowrite = useCallback(async (sectionId: string, prompt: string) => {
        const section = songData.structure.find(s => s.id === sectionId);
        if (!section) return;
        setIsLoading(true);
        setError(null);
        try {
            const currentContent = section.content.map(p => `${p.author}: ${p.text}`).join('\n');
            const result = await geminiService.cowriteSection(prompt, currentContent);
            handleAddContentPart(sectionId, 'ai', result);
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    }, [songData.structure]);

    const handleGenerateIdea = useCallback(async (params: GenerateIdeaParams) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await geminiService.generateSongIdea(params);
            setGeneratedIdea(result);
            setIsIdeaModalOpen(true);
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleGenerateBlendedIdea = useCallback(async (params: GenerateBlendedIdeaParams) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await geminiService.generateBlendedIdea(params);
            setGeneratedIdea(result);
            setIsIdeaModalOpen(true);
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleFindRhymes = useCallback(async (params: GenerateRhymesParams) => {
        setIsLoading(true);
        setError(null);
        setRhymes([]);
        try {
            const result = await geminiService.findRhymes(params);
            setRhymes(result);
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleFindSynonyms = useCallback(async (params: GenerateSynonymsParams) => {
        setIsLoading(true);
        setError(null);
        setSynonyms([]);
        try {
            const result = await geminiService.findSynonyms(params);
            setSynonyms(result);
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleGenerateWordAssociations = useCallback(async (params: GenerateWordAssociationsParams) => {
        setIsLoading(true);
        setError(null);
        setWordAssociations([]);
        try {
            const result = await geminiService.generateWordAssociations(params);
            setWordAssociations(result);
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleGeneratePrompt = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setInspirationalSpark(null);
        try {
            const result = await geminiService.generateCreativePrompt();
            setCreativePrompt(result);
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const handleGetInspirationalSpark = useCallback(async (params: GetInspirationalSparkParams) => {
        setIsLoading(true);
        setError(null);
        setCreativePrompt(null);
        try {
            const result = await geminiService.getInspirationalSpark(params);
            setInspirationalSpark(result);
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSuggestRhythms = useCallback(async (params: GenerateRhythmParams) => {
        setIsLoading(true);
        setError(null);
        setRhythmSuggestions([]);
        try {
            const result = await geminiService.suggestRhythmPhrasings(params);
            setRhythmSuggestions(result);
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const handleSuggestStructures = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await geminiService.suggestSongStructures();
            setStructureSuggestions(result);
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleAnalyzeSong = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await geminiService.analyzeSong({
                structure: songData.structure,
                progression: songData.progression,
            });
            setSongAnalysis(result);
            setIsAnalysisModalOpen(true);
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    }, [songData]);

    // --- Chord River Handlers ---
    const handleUpdateProgression = useCallback((progression: Chord[]) => {
        setSongData(prev => ({...prev, progression}));
    }, []);

    const handleGenerateLibrary = useCallback(async (key: string) => {
        setIsLoading(true);
        setError(null);
        setSongData(prev => ({...prev, key}));
        try {
            const result = await geminiService.getChordLibrary({ key });
            setChordLibrary(result);
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handlePlayProgression = useCallback(() => {
        audioService.playProgression(songData.progression.map(c => c.name));
    }, [songData.progression]);

    // --- Project Handlers ---
    const handleNewSong = () => {
        if (window.confirm("Are you sure you want to start a new song? Your current work will be cleared.")) {
            localStorage.removeItem('sonora-ai-song');
            const newSong: SongData = {
                structure: [{
                    id: `section-${Date.now()}`,
                    type: 'Verse',
                    label: 'Verse 1',
                    content: [],
                }],
                progression: [],
                key: 'C'
            };
            setSongData(newSong);
            setActiveSectionId(newSong.structure[0].id);
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
    };
    
    const handleExport = () => {
        let fileContent = 'Sonora AI Song Export\n\n';
        songData.structure.forEach(section => {
            fileContent += `(${section.label})\n`;
            section.content.forEach(part => {
                fileContent += `${part.text}\n`;
            });
            fileContent += '\n';
        });

        if (songData.progression.length > 0) {
            fileContent += `---\n`;
            fileContent += `Chord Progression (Key of ${songData.key}):\n`;
            fileContent += songData.progression.map(c => c.name).join(' - ') + '\n';
        }

        const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'sonora-ai-song.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleShare = async () => {
        try {
            // Create a storable version without blobUrls for sharing
            const shareableData: SongData = {
                ...songData,
                structure: songData.structure.map(section => {
                    if (!section.audio) return section;
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { blobUrl, ...storableAudio } = section.audio;
                    return { ...section, audio: storableAudio };
                }),
            };
            const jsonData = JSON.stringify(shareableData);
            const base64Data = bytesToBase64(new TextEncoder().encode(jsonData));
            const url = `${window.location.origin}${window.location.pathname}#data=${base64Data}`;
            await navigator.clipboard.writeText(url);
            return true; // Indicate success
        } catch (e) {
            console.error("Failed to create share link", e);
            setError("Could not copy share link. Your song might be too large for a URL.");
            return false; // Indicate failure
        }
    };

    // Initial chord library load
    useEffect(() => {
        if (songData.key) {
           handleGenerateLibrary(songData.key);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [songData.key]);


    return (
        <div className="min-h-screen flex flex-col font-sans">
            {isLoading && <LoadingOverlay />}
            {error && <ErrorDisplay message={error} onClose={() => setError(null)} />}
            {isIdeaModalOpen && generatedIdea && <GeneratedIdeaModal idea={generatedIdea} onClose={() => setIsIdeaModalOpen(false)} />}
            {isAnalysisModalOpen && songAnalysis && <AnalysisModal analysis={songAnalysis} onClose={() => setIsAnalysisModalOpen(false)} />}
            
            <Header 
                onNewSong={handleNewSong}
                onExport={handleExport}
                onShare={handleShare}
                onToggleStructure={() => setIsStructurePanelOpen(prev => !prev)}
            />

            <main className="flex-grow flex w-full">
                {isStructurePanelOpen && (
                    <aside className="w-64 flex-shrink-0 p-4 border-r border-sepia-200 bg-cream-100/30 h-[calc(100vh-65px)] overflow-y-auto">
                         <SongStructureEditor 
                            sections={songData.structure}
                            activeSectionId={activeSectionId}
                            onSectionSelect={setActiveSectionId}
                            onReorder={handleReorderSections}
                            onDelete={handleDeleteSection}
                            onUpdateSection={handleUpdateSection}
                            onAddSection={handleAddSection}
                        />
                    </aside>
                )}
                
                <div className="flex-grow p-6 h-[calc(100vh-65px)] overflow-y-auto">
                     <Editor 
                        activeSection={activeSection}
                        onAddContentPart={handleAddContentPart}
                        onDeleteContentPart={handleDeleteContentPart}
                        onCowrite={handleCowrite}
                        onUpdateAudio={handleUpdateAudio}
                        onDeleteAudio={handleDeleteAudio}
                        onAnalyzeAudio={handleAnalyzeAudio}
                    />
                </div>

                <aside className="w-96 flex-shrink-0 border-l border-sepia-200 h-[calc(100vh-65px)]">
                    <Sidebar
                        onGenerateIdea={handleGenerateIdea}
                        onGenerateBlendedIdea={handleGenerateBlendedIdea}
                        onFindRhymes={handleFindRhymes}
                        onFindSynonyms={handleFindSynonyms}
                        onGenerateWordAssociations={handleGenerateWordAssociations}
                        onGeneratePrompt={handleGeneratePrompt}
                        onGenerateInspirationalSpark={handleGetInspirationalSpark}
                        onSuggestRhythms={handleSuggestRhythms}
                        onSuggestStructures={handleSuggestStructures}
                        onAnalyzeSong={handleAnalyzeSong}
                        onApplyStructure={handleApplyStructure}
                        rhymes={rhymes}
                        synonyms={synonyms}
                        wordAssociations={wordAssociations}
                        creativePrompt={creativePrompt}
                        inspirationalSpark={inspirationalSpark}
                        rhythmSuggestions={rhythmSuggestions}
                        structureSuggestions={structureSuggestions}
                        chordLibrary={chordLibrary}
                        chordRiverProgression={songData.progression}
                        currentKey={songData.key}
                        onUpdateProgression={handleUpdateProgression}
                        onGenerateLibrary={handleGenerateLibrary}
                        onPlayProgression={handlePlayProgression}
                    />
                </aside>
            </main>
        </div>
    );
};

export default App;