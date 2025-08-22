
import React, { useState, useCallback, useEffect, useRef, useReducer, useMemo } from 'react';
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
import type { GenerateIdeaParams, GenerateRhymesParams, GenerateSynonymsParams, GenerateWordAssociationsParams, GenerateBlendedIdeaParams, Chord, SongSection, SectionType, ContentPart, Author, AudioAnalysisResult, SongData, GetInspirationalSparkParams, ModifyLyricParams, MelodyNote, ProgressionStep, GenerateTitleParams, AnalysisType, GenerateEmotionalPaletteParams, GenerateObjectObservationParams } from './types';
import { SongDataContext, ActionsContext, songReducer, getInitialSongData } from './state/songState';
import { blobToBase64, bytesToBase64 } from './utils/base64';
import { useDebounce } from './hooks/useDebounce';

// --- State Management (Reducer & Context) ---

// [extracted to state/songState]

export const SongDataContext = createContext<SongData | null>(null);
export const ActionsContext = createContext<any | null>(null);


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

const getDefaultSongData = (): SongData => ({
    title: 'A Wild Design',
    structure: parseLyricsToStructure(initialLyrics),
    progression: [],
    key: 'C',
    bpm: 120,
    timeSignature: '4/4',
    melody: [],
});


const processLoadedSongData = (data: Partial<SongData>): SongData => {
    // Recreate blobUrls from base64 data for audio playback
    const hydratedStructure = data.structure?.map(section => {
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
    }) || [];

    // Merge loaded data with defaults to ensure all fields are present
    return {
        ...getDefaultSongData(),
        ...data,
        structure: hydratedStructure,
    };
};

const getInitialSongData = (): SongData => {
    // 1. Check for shared data in URL hash
    const hash = window.location.hash;
    if (hash.startsWith('#data=')) {
        try {
            const base64Data = hash.substring(6);
            const jsonData = new TextDecoder().decode(base64ToBytes(base64Data));
            const parsedData = JSON.parse(jsonData) as Partial<SongData>;
            return processLoadedSongData(parsedData);
        } catch (e) {
            console.error("Failed to parse shared data, falling back.", e);
        }
    }

    // 2. Check for saved data in localStorage
    const savedData = localStorage.getItem('sonora-ai-song');
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData) as Partial<SongData>;
            return processLoadedSongData(parsedData);
        } catch (e) {
            console.error("Failed to parse saved data, falling back.", e);
        }
    }

    // 3. Fallback to initial default data
    return getDefaultSongData();
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

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}


const App: React.FC = () => {
    const [songData, dispatch] = useReducer(songReducer, getInitialSongData());
    const [activeSectionId, setActiveSectionId] = useState<string | null>(songData.structure.length > 0 ? songData.structure[0].id : null);
    
    // UI State
    const [isStructurePanelOpen, setIsStructurePanelOpen] = useState(true);
    const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(true);

    // AI/Loading State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rhymes, setRhymes] = useState<string[]>([]);
    const [synonyms, setSynonyms] = useState<string[]>([]);
    const [wordAssociations, setWordAssociations] = useState<string[]>([]);
    const [creativePrompt, setCreativePrompt] = useState<string | null>(null);
    const [inspirationalSpark, setInspirationalSpark] = useState<string | null>(null);
    const [structureSuggestions, setStructureSuggestions] = useState<string[]>([]);
    const [generatedIdea, setGeneratedIdea] = useState<string | null>(null);
    const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
    const [songAnalysis, setSongAnalysis] = useState<string | AudioAnalysisResult | null>(null);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [lyricSuggestions, setLyricSuggestions] = useState<{ partId: string, suggestions: string[] } | null>(null);
    const [chordLibrary, setChordLibrary] = useState<Chord[]>([]);
    
    // Playback State
    const [isPlaying, setIsPlaying] = useState(false);
    const [playheadPosition, setPlayheadPosition] = useState(0); // Position in beats
    const animationFrameRef = useRef<number | null>(null);
    const playbackStartTimeRef = useRef<number>(0);

    const activeSection = songData.structure.find(s => s.id === activeSectionId);
    
    // Debounce song data for auto-saving
    const debouncedSongData = useDebounce(songData, 500);
    
    // Auto-save to local storage
    useEffect(() => {
        try {
            const storableData: SongData = {
                ...debouncedSongData,
                structure: debouncedSongData.structure.map(section => {
                    if (!section.audio) return section;
                    const { blobUrl, ...storableAudio } = section.audio;
                    return { ...section, audio: storableAudio };
                }),
            };
            const jsonData = JSON.stringify(storableData);
            localStorage.setItem('sonora-ai-song', jsonData);
        } catch (e) {
            console.error("Could not save song to local storage", e);
        }
    }, [debouncedSongData]);


    const handleError = useCallback((err: unknown) => {
        let friendlyMessage = "An unknown error occurred. Please check the console for details.";
        if (err instanceof Error) {
            if (err.message.includes("API key is missing")) {
                friendlyMessage = "The provided API key is not valid. Please ensure the API_KEY environment variable is set correctly.";
            } else {
                 friendlyMessage = err.message;
            }
        }
        console.error(err);
        setError(`AI Error: ${friendlyMessage}`);
        audioService.stop();
        setIsPlaying(false);
    }, []);
    
    const withLoading = useCallback(<T extends any[]>(fn: (...args: T) => Promise<void>) => {
        return async (...args: T) => {
            setIsLoading(true);
            setError(null);
            try {
                await fn(...args);
            } catch (err) {
                handleError(err);
            } finally {
                setIsLoading(false);
            }
        };
    }, [handleError]);

    // --- Action Handlers ---

    const handleUpdateTitle = useCallback((newTitle: string) => {
        dispatch({ type: 'UPDATE_TITLE', payload: newTitle.trim() || 'Untitled Song' });
    }, []);

    const handleAddContentPart = useCallback((sectionId: string, author: Author, text: string) => {
        if (!text.trim()) return;
        const newPart: ContentPart = { id: `part-${Date.now()}`, author, text };
        dispatch({ type: 'ADD_CONTENT_PART', payload: { sectionId, part: newPart } });
    }, []);
    
    const handleUpdateContentPart = useCallback((sectionId: string, partId: string, newText: string) => {
        dispatch({ type: 'UPDATE_CONTENT_PART', payload: { sectionId, partId, newText } });
        if (lyricSuggestions?.partId === partId) {
            setLyricSuggestions(null);
        }
    }, [lyricSuggestions?.partId]);

    const handleDeleteContentPart = useCallback((sectionId: string, partId: string) => {
        dispatch({ type: 'DELETE_CONTENT_PART', payload: { sectionId, partId } });
    }, []);

    const handleAddSection = useCallback((type: SectionType) => {
        const existingOfType = songData.structure.filter(s => s.type === type).length;
        const newSection: SongSection = {
            id: `section-${Date.now()}`,
            type,
            label: `${type} ${existingOfType + 1}`,
            content: [],
        };
        dispatch({ type: 'ADD_SECTION', payload: newSection });
        setActiveSectionId(newSection.id);
    }, [songData.structure]);

    const handleDeleteSection = useCallback((sectionId: string) => {
        const newStructure = songData.structure.filter(s => s.id !== sectionId);
        if (activeSectionId === sectionId) {
            setActiveSectionId(newStructure.length > 0 ? newStructure[0].id : null);
        }
        dispatch({ type: 'DELETE_SECTION', payload: sectionId });
    }, [activeSectionId, songData.structure]);
    
    const handleUpdateSection = useCallback((sectionId: string, updates: { type: SectionType, label: string }) => {
        dispatch({ type: 'UPDATE_SECTION', payload: { sectionId, updates } });
    }, []);

    const handleReorderSections = useCallback((startIndex: number, endIndex: number) => {
        dispatch({ type: 'REORDER_SECTIONS', payload: { startIndex, endIndex } });
    }, []);
    
    const handleApplyStructure = useCallback(withLoading(async (structureString: string) => {
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
        dispatch({ type: 'APPLY_STRUCTURE', payload: newStructure });
        setActiveSectionId(newStructure.length > 0 ? newStructure[0].id : null);
    }), [withLoading]);

    const handleFindRhymes = useCallback(withLoading(async (params: GenerateRhymesParams) => {
        if (!params.word.trim()) return;
        const results = await geminiService.findRhymes(params);
        setRhymes(results);
        setGeneratedIdea(null);
    }), [withLoading]);
    
    const handleFindSynonyms = useCallback(withLoading(async (params: GenerateSynonymsParams) => {
        if (!params.word.trim()) return;
        const results = await geminiService.findSynonyms(params);
        setSynonyms(results);
        setGeneratedIdea(null);
    }), [withLoading]);

    const handleGenerateWordAssociations = useCallback(withLoading(async (params: GenerateWordAssociationsParams) => {
        if (!params.word.trim()) return;
        const results = await geminiService.generateWordAssociations(params);
        setWordAssociations(results);
        setGeneratedIdea(null);
    }), [withLoading]);

    const handleCowrite = useCallback(withLoading(async (sectionId: string, prompt: string) => {
        const section = songData.structure.find(s => s.id === sectionId);
        if (!section) return;
        if (!prompt.trim()) {
            setError("Please provide a prompt for the AI co-writer.");
            return;
        }
        const existingLyrics = section.content.map(p => p.text).join('\n\n');
        const newLines = await geminiService.cowriteSection(prompt, existingLyrics);
        handleAddContentPart(sectionId, 'ai', newLines);
    }), [withLoading, songData.structure, handleAddContentPart]);

    const handleModifyLyric = useCallback(withLoading(async (sectionId: string, partId: string, params: ModifyLyricParams) => {
        setLyricSuggestions(null);
        if (params.modificationType !== 'random_line' && !params.line.trim()) {
            setError("There is no lyric to modify. Please type something first.");
            return;
        }
        const result = await geminiService.modifyLyric(params);
        if (params.modificationType === 'suggest_alternatives' && Array.isArray(result)) {
            setLyricSuggestions({ partId, suggestions: result });
        } else if (typeof result === 'string') {
            handleUpdateContentPart(sectionId, partId, result);
        }
    }), [withLoading, handleUpdateContentPart]);

    const handleGenerateIdea = useCallback(withLoading(async (params: GenerateIdeaParams) => {
        if (!params.topic.trim()) {
            setError("Please enter a topic for the song idea.");
            return;
        }
        const idea = await geminiService.generateSongIdea(params);
        setGeneratedIdea(idea);
        setIsIdeaModalOpen(true);
    }), [withLoading]);

    const handleGenerateBlendedIdea = useCallback(withLoading(async (params: GenerateBlendedIdeaParams) => {
        if (!params.artists.trim()) {
            setError("Please enter at least one artist to blend styles.");
            return;
        }
        const idea = await geminiService.generateBlendedIdea(params);
        setGeneratedIdea(idea);
        setIsIdeaModalOpen(true);
    }), [withLoading]);
    
    const handleGenerateTitles = useCallback(withLoading(async (params: GenerateTitleParams) => {
        if (!params.theme.trim()) return;
        const titles = await geminiService.generateTitles(params);
        setGeneratedIdea(`Suggested Titles for "${params.theme}":\n\n- ${titles.join('\n- ')}`);
        setIsIdeaModalOpen(true);
    }), [withLoading]);
    
    const handleGenerateEmotionalPalette = useCallback(withLoading(async (params: GenerateEmotionalPaletteParams) => {
        if (params.emotions.length === 0) return;
        const scene = await geminiService.generateEmotionalPaletteScene(params);
        setGeneratedIdea(`Scene for "${params.emotions.join(', ')}":\n\n${scene}`);
        setIsIdeaModalOpen(true);
    }), [withLoading]);
    
    const handleGenerateObjectObservation = useCallback(withLoading(async (params: GenerateObjectObservationParams) => {
        if (!params.object.trim()) return;
        const observation = await geminiService.generateObjectObservation(params);
        setGeneratedIdea(`Observation of "${params.object}":\n\n${observation}`);
        setIsIdeaModalOpen(true);
    }), [withLoading]);

    const handleGeneratePrompt = useCallback(withLoading(async () => {
        const prompt = await geminiService.generateCreativePrompt();
        setCreativePrompt(prompt);
    }), [withLoading]);

    const handleGetInspirationalSpark = useCallback(withLoading(async (params: GetInspirationalSparkParams) => {
        const spark = await geminiService.getInspirationalSpark(params);
        setInspirationalSpark(spark);
    }), [withLoading]);

    const handleSuggestStructures = useCallback(withLoading(async () => {
        const structures = await geminiService.suggestSongStructures();
        setStructureSuggestions(structures);
    }), [withLoading]);
    
    const handleAnalyzeSong = useCallback(withLoading(async (analysisType: AnalysisType) => {
        const analysis = await geminiService.analyzeSong({ structure: songData.structure, progression: songData.progression, analysisType });
        setSongAnalysis(analysis);
        setIsAnalysisModalOpen(true);
    }), [withLoading, songData.structure, songData.progression]);
    
    const handleUpdateAudio = useCallback(async (sectionId: string, audioBlob: Blob) => {
        const base64 = await blobToBase64(audioBlob);
        const mimeType = audioBlob.type;
        const blobUrl = URL.createObjectURL(audioBlob);
        dispatch({ type: 'UPDATE_AUDIO', payload: { sectionId, audio: { base64, mimeType, blobUrl } } });
    }, []);

    const handleDeleteAudio = useCallback((sectionId: string) => {
        dispatch({ type: 'DELETE_AUDIO', payload: sectionId });
    }, []);

    const handleAnalyzeAudio = useCallback(withLoading(async (sectionId: string) => {
        const section = songData.structure.find(s => s.id === sectionId);
        if (!section || !section.audio) return;
        const result = await geminiService.analyzeAudioPart(section.audio.base64, section.audio.mimeType);
        setSongAnalysis(result);
        setIsAnalysisModalOpen(true);
    }), [withLoading, songData.structure]);

    const handleGenerateLibrary = useCallback(withLoading(async (key: string) => {
        const chords = await geminiService.getChordLibrary({ key });
        setChordLibrary(chords);
        dispatch({ type: 'UPDATE_KEY', payload: key });
    }), [withLoading]);

    useEffect(() => {
        if (chordLibrary.length === 0 && songData.key) {
            handleGenerateLibrary(songData.key);
        }
    }, [songData.key, chordLibrary.length, handleGenerateLibrary]);

    const handleUpdateProgression = useCallback((newProgression: ProgressionStep[]) => {
        dispatch({ type: 'UPDATE_PROGRESSION', payload: newProgression });
    }, []);
    
    const handleUpdateProgressionStep = useCallback((id: string, updates: { durationBeats: number }) => {
        dispatch({ type: 'UPDATE_PROGRESSION_STEP', payload: { id, updates } });
    }, []);

    const handleUpdateBpm = useCallback((newBpm: number) => {
        dispatch({ type: 'UPDATE_BPM', payload: newBpm });
    }, []);

    const handleUpdateTimeSignature = useCallback((newTimeSignature: string) => {
        dispatch({ type: 'UPDATE_TIME_SIGNATURE', payload: newTimeSignature });
    }, []);

    const handleUpdateMelody = useCallback((newMelody: MelodyNote[]) => {
        dispatch({ type: 'UPDATE_MELODY', payload: newMelody });
    }, []);

    const animationLoop = useCallback(() => {
        const currentTime = performance.now();
        const elapsedSeconds = (currentTime - playbackStartTimeRef.current) / 1000;
        const beatsPerSecond = songData.bpm / 60;
        const totalProgressionBeats = songData.progression.reduce((sum, step) => sum + step.durationBeats, 0) || 16;
        const currentBeat = (elapsedSeconds * beatsPerSecond) % totalProgressionBeats;
        setPlayheadPosition(currentBeat);
        animationFrameRef.current = requestAnimationFrame(animationLoop);
    }, [songData.bpm, songData.progression]);

    const handlePlay = useCallback(() => {
        audioService.play(songData);
        setIsPlaying(true);
        playbackStartTimeRef.current = performance.now();
        animationFrameRef.current = requestAnimationFrame(animationLoop);
    }, [songData, animationLoop]);

    const handleStop = useCallback(() => {
        audioService.stop();
        setIsPlaying(false);
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        setPlayheadPosition(0);
    }, []);

    const handleNewSong = useCallback(() => {
        if (window.confirm("Are you sure? This will create a blank song and erase your current work from this browser session.")) {
            localStorage.removeItem('sonora-ai-song');
            const newSong = {
                title: 'Untitled Song',
                structure: [],
                progression: [],
                key: 'C',
                bpm: 120,
                timeSignature: '4/4',
                melody: [],
            };
            dispatch({ type: 'SET_SONG_DATA', payload: newSong });
            setActiveSectionId(null);
            handleGenerateLibrary('C');
        }
    }, [handleGenerateLibrary]);
    
    const handleExport = useCallback(() => {
        const { title, structure, progression, key, bpm, timeSignature } = songData;
        let content = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${title}</title><style>body{font-family:serif;line-height:1.6;color:#3a3127;background:#f5f3f0;padding:2rem;}h1{color:#a33100;}h2{color:#115e59;border-bottom:1px solid #e5e2de;padding-bottom:0.5rem;}.metadata{background:#fffffb;border:1px solid #e5e2de;padding:1rem;margin-bottom:2rem;}.lyrics{white-space:pre-wrap;}</style></head><body><h1>${title}</h1><div class="metadata"><strong>Key:</strong> ${key} | <strong>BPM:</strong> ${bpm} | <strong>Time Signature:</strong> ${timeSignature}<br><strong>Progression:</strong> ${progression.map(p => `${p.chord.name} (${p.durationBeats} beats)`).join(' - ') || 'N/A'}</div>`;
        structure.forEach(section => {
            content += `<h2>${section.label}</h2>\n<div class="lyrics">\n${section.content.map(p => p.text).join('\n\n')}\n</div>\n`;
        });
        content += '</body></html>';
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\s/g, '_')}.html`;
        a.click();
        URL.revokeObjectURL(url);
    }, [songData]);

    const handleShare = useCallback(async (): Promise<boolean> => {
        try {
            const storableData: Partial<SongData> = { ...songData, structure: songData.structure.map(section => { if (!section.audio) return section; const { blobUrl, ...storableAudio } = section.audio; return { ...section, audio: storableAudio }; }) };
            const jsonData = JSON.stringify(storableData);
            const base64Data = bytesToBase64(new TextEncoder().encode(jsonData));
            const shareUrl = `${window.location.origin}${window.location.pathname}#data=${base64Data}`;
            await navigator.clipboard.writeText(shareUrl);
            return true;
        } catch (e) {
            console.error("Failed to copy share link:", e);
            setError("Could not copy the share link.");
            return false;
        }
    }, [songData]);

    const actions = useMemo(() => ({
        onUpdateTitle: handleUpdateTitle,
        onAddContentPart: handleAddContentPart,
        onUpdateContentPart: handleUpdateContentPart,
        onDeleteContentPart: handleDeleteContentPart,
        onCowrite: handleCowrite,
        onModifyLyric: handleModifyLyric,
        onAddSection: handleAddSection,
        onDeleteSection: handleDeleteSection,
        onUpdateSection: handleUpdateSection,
        onReorder: handleReorderSections,
        onReorderSections: handleReorderSections,
        onUpdateAudio: handleUpdateAudio,
        onDeleteAudio: handleDeleteAudio,
        onAnalyzeAudio: handleAnalyzeAudio,
        onUpdateProgression: handleUpdateProgression,
        onUpdateProgressionStep: handleUpdateProgressionStep,
        onUpdateMelody: handleUpdateMelody,
        onUpdateBpm: handleUpdateBpm,
        onUpdateTimeSignature: handleUpdateTimeSignature,
        onGenerateLibrary: handleGenerateLibrary,
        onApplyStructure: handleApplyStructure,
        onAnalyzeSong: handleAnalyzeSong,
        onSuggestStructures: handleSuggestStructures,
    }), [handleUpdateTitle, handleAddContentPart, handleUpdateContentPart, handleDeleteContentPart, handleCowrite, handleModifyLyric, handleAddSection, handleDeleteSection, handleUpdateSection, handleReorderSections, handleUpdateAudio, handleDeleteAudio, handleAnalyzeAudio, handleUpdateProgression, handleUpdateProgressionStep, handleUpdateMelody, handleUpdateBpm, handleUpdateTimeSignature, handleGenerateLibrary, handleApplyStructure, handleAnalyzeSong, handleSuggestStructures]);
    
    const gridCols = useMemo(() => {
        if (isStructurePanelOpen && isToolsPanelOpen) return 'grid-cols-[3fr_6fr_3fr]';
        if (isStructurePanelOpen) return 'grid-cols-[3fr_9fr_0fr]';
        if (isToolsPanelOpen) return 'grid-cols-[0fr_9fr_3fr]';
        return 'grid-cols-[0fr_12fr_0fr]';
    }, [isStructurePanelOpen, isToolsPanelOpen]);

    return (
        <SongDataContext.Provider value={songData}>
        <ActionsContext.Provider value={actions}>
            <div className="h-screen w-screen bg-cream flex flex-col font-sans">
                <Header 
                    onNewSong={handleNewSong}
                    onExport={handleExport}
                    onShare={handleShare}
                    onToggleStructure={() => setIsStructurePanelOpen(prev => !prev)}
                    onToggleTools={() => setIsToolsPanelOpen(prev => !prev)}
                />
                <main className={`flex-grow grid ${gridCols} gap-6 p-4 md:p-6 overflow-hidden transition-all duration-300 ease-in-out`}>
                    <aside className={`transition-all duration-300 ease-in-out overflow-hidden ${!isStructurePanelOpen && 'scale-x-0 -mr-6 opacity-0'}`}>
                        <div className="bg-cream-100/50 rounded-lg p-4 h-full overflow-y-auto">
                            <SongStructureEditor 
                               activeSectionId={activeSectionId}
                               onSectionSelect={setActiveSectionId}
                            />
                        </div>
                    </aside>
                    
                    <div className="transition-all duration-300 ease-in-out h-full">
                        <Editor
                            activeSection={activeSection}
                            lyricSuggestions={lyricSuggestions}
                        />
                    </div>
                    
                    <aside className={`transition-all duration-300 ease-in-out overflow-hidden ${!isToolsPanelOpen && 'scale-x-0 -ml-6 opacity-0'}`}>
                        <Sidebar
                            isPlaying={isPlaying}
                            playheadPosition={playheadPosition}
                            // Phase 1: Spark & Structure
                            onGenerateIdea={handleGenerateIdea}
                            onGenerateBlendedIdea={handleGenerateBlendedIdea}
                            onGenerateTitles={handleGenerateTitles}
                            onGenerateEmotionalPalette={handleGenerateEmotionalPalette}
                            onGenerateObjectObservation={handleGenerateObjectObservation}
                            onGeneratePrompt={handleGeneratePrompt}
                            onGenerateInspirationalSpark={handleGetInspirationalSpark}
                            creativePrompt={creativePrompt}
                            inspirationalSpark={inspirationalSpark}
                            structureSuggestions={structureSuggestions}
                            onSuggestStructures={handleSuggestStructures}
                            onApplyStructure={handleApplyStructure}
                            // Phase 2: Lyric Craft
                            onFindRhymes={handleFindRhymes}
                            onFindSynonyms={handleFindSynonyms}
                            onGenerateWordAssociations={handleGenerateWordAssociations}
                            rhymes={rhymes}
                            synonyms={synonyms}
                            wordAssociations={wordAssociations}
                            // Phase 3: Music & Harmony
                            onPlay={handlePlay}
                            onStop={handleStop}
                            chordLibrary={chordLibrary}
                            // Phase 4: Review & Refine
                            onAnalyzeSong={handleAnalyzeSong}
                        />
                    </aside>
                </main>

                {isIdeaModalOpen && generatedIdea && (
                    <GeneratedIdeaModal idea={generatedIdea} onClose={() => setIsIdeaModalOpen(false)} />
                )}
                {isAnalysisModalOpen && songAnalysis && (
                    <AnalysisModal analysis={songAnalysis} onClose={() => setIsAnalysisModalOpen(false)} />
                )}
                {isLoading && <LoadingOverlay />}
                {error && <ErrorDisplay message={error} onClose={() => setError(null)} />}
            </div>
        </ActionsContext.Provider>
        </SongDataContext.Provider>
    );
};

export default App;
