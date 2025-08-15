import React, { useState } from 'react';
import type { GenerateIdeaParams, GenerateRhymesParams, GenerateSynonymsParams, GenerateWordAssociationsParams, RhythmSuggestion, GenerateRhythmParams, GenerateBlendedIdeaParams, Chord, GetInspirationalSparkParams } from '../types';
import { SparklesIcon, MusicNoteIcon, BookOpenIcon, ClipboardIcon, LightbulbIcon, LinkIcon, MetronomeIcon, StethoscopeIcon, QuillIcon, EyeIcon, ChatBubbleBottomCenterTextIcon } from './icons';
import { ChordRiver } from './ChordRiver';

interface SidebarProps {
    onGenerateIdea: (params: GenerateIdeaParams) => void;
    onGenerateBlendedIdea: (params: GenerateBlendedIdeaParams) => void;
    onFindRhymes: (params: GenerateRhymesParams) => void;
    onFindSynonyms: (params: GenerateSynonymsParams) => void;
    onGenerateWordAssociations: (params: GenerateWordAssociationsParams) => void;
    onGeneratePrompt: () => void;
    onGenerateInspirationalSpark: (params: GetInspirationalSparkParams) => void;
    onSuggestRhythms: (params: GenerateRhythmParams) => void;
    onSuggestStructures: () => void;
    onAnalyzeSong: () => void;
    onApplyStructure: (structure: string) => void;
    rhymes: string[];
    synonyms: string[];
    wordAssociations: string[];
    creativePrompt: string | null;
    inspirationalSpark: string | null;
    rhythmSuggestions: RhythmSuggestion[];
    structureSuggestions: string[];
    // Chord River props
    chordLibrary: Chord[];
    chordRiverProgression: Chord[];
    currentKey: string;
    onUpdateProgression: (progression: Chord[]) => void;
    onGenerateLibrary: (key: string) => void;
    onPlayProgression: () => void;
}

type ToolTab = 'ai' | 'music' | 'inspiration' | 'analysis';

const ToolSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-3">
        <h3 className="text-sm font-bold font-typewriter text-sepia-800 tracking-wide">
            {title}
        </h3>
        <div className="bg-cream-100/30 p-3 rounded-md border border-sepia-200">{children}</div>
    </div>
);

const ResultList: React.FC<{ items: string[] }> = ({ items }) => {
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    if (items.length === 0) return null;

    return (
        <div className="mt-2 bg-sepia-200/40 p-2 rounded-md max-h-40 overflow-y-auto border border-sepia-200">
            <ul className="space-y-1">
                {items.map((item, index) => (
                    <li key={index} className="text-sm text-sepia-800 flex justify-between items-center bg-cream-100/50 p-1.5 rounded hover:bg-cream-100">
                        <span>{item}</span>
                        <button onClick={() => handleCopy(item)} title="Copy" className="text-sepia-400 hover:text-orange-700 transition-colors flex-shrink-0 p-1">
                            <ClipboardIcon className="w-4 h-4" />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const StressedLyric: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split(' ').map((part, i) =>
        part === part.toUpperCase() && part.toLowerCase() !== part.toUpperCase() ?
        <strong key={i} className="text-orange-800 font-bold">{part.toLowerCase()}{' '}</strong> :
        <span key={i}>{part.toLowerCase()}{' '}</span>
    );
    return <p className="font-mono text-sm leading-relaxed text-sepia-800">{parts}</p>;
};

const RhythmList: React.FC<{ items: RhythmSuggestion[] }> = ({ items }) => {
    if (items.length === 0) return null;

    return (
        <div className="mt-2 bg-sepia-200/40 p-2 rounded-md max-h-60 overflow-y-auto border border-sepia-200">
            <ul className="space-y-2">
                {items.map((item, index) => (
                    <li key={index} className="text-sm text-sepia-800 bg-cream-100/50 p-3 rounded border border-sepia-200/80">
                         <div className="flex justify-between items-start">
                           <div>
                                <h4 className="font-bold font-typewriter text-teal-800">{item.name} <span className="text-xs font-normal text-sepia-800">({item.meter})</span></h4>
                                <StressedLyric text={item.formattedLine} />
                                <p className="font-mono text-sepia-400 text-xs my-1">{item.pattern}</p>
                                <p className="text-xs text-sepia-800 italic">{item.description}</p>
                           </div>
                            <button onClick={() => navigator.clipboard.writeText(item.formattedLine)} title="Copy" className="text-sepia-400 hover:text-orange-700 transition-colors ml-2 flex-shrink-0 p-1">
                                <ClipboardIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const TabButton: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; }> = ({ icon, label, isActive, onClick }) => {
    const baseClasses = "flex flex-col items-center justify-center gap-1 p-2 rounded-md transition-colors w-full";
    const activeClasses = "bg-orange-700 text-cream-100";
    const inactiveClasses = "text-sepia-800 hover:bg-sepia-200/50";
    return (
        <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            {icon}
            <span className="text-xs font-semibold">{label}</span>
        </button>
    )
};


export const Sidebar: React.FC<SidebarProps> = (props) => {
    const [activeTab, setActiveTab] = useState<ToolTab>('ai');

    const [topic, setTopic] = useState('');
    const [artists, setArtists] = useState('Elliott Smith, Brian Wilson');
    const [rhymeWord, setRhymeWord] = useState('');
    const [synonymWord, setSynonymWord] = useState('');
    const [associationWord, setAssociationWord] = useState('');
    const [rhythmLine, setRhythmLine] = useState('');
    
    const baseButtonClasses = "w-full bg-orange-700 hover:bg-orange-600 text-cream-100 font-semibold text-sm px-4 py-2 rounded-md transition-all duration-200 shadow-sm border-b-2 border-orange-900/50";
    const inputClasses = "w-full bg-cream-100 text-sepia-900 border border-sepia-300 rounded-md px-3 py-2 text-sm placeholder-sepia-400 focus:outline-none focus:ring-1 focus:ring-orange-700 focus:border-orange-700";
    const labelClasses = "text-xs text-sepia-800 mb-1 block font-semibold";

    const handleFormSubmit = <T,>(handler: (params: T) => void, params: T) => (e: React.FormEvent) => {
        e.preventDefault();
        handler(params);
    };

    const SparkButton: React.FC<{icon: React.ReactNode, label: string, onClick: () => void}> = ({ icon, label, onClick }) => (
        <button onClick={onClick} className="flex flex-col items-center gap-1.5 p-2 rounded-md bg-cream-100/50 hover:bg-cream-100 text-sepia-800 font-semibold text-xs transition-all border border-sepia-300 shadow-sm">
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="bg-cream-100/50 h-full flex flex-col">
            <div className="p-2 border-b border-sepia-200">
                <div className="grid grid-cols-4 gap-2">
                    <TabButton icon={<SparklesIcon className="w-5 h-5"/>} label="AI Assist" isActive={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
                    <TabButton icon={<MusicNoteIcon className="w-5 h-5"/>} label="Music" isActive={activeTab === 'music'} onClick={() => setActiveTab('music')} />
                    <TabButton icon={<LightbulbIcon className="w-5 h-5"/>} label="Inspiration" isActive={activeTab === 'inspiration'} onClick={() => setActiveTab('inspiration')} />
                    <TabButton icon={<StethoscopeIcon className="w-5 h-5"/>} label="Analysis" isActive={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} />
                </div>
            </div>
            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                {activeTab === 'ai' && (
                    <>
                        <ToolSection title="Rhyme Book">
                             <form onSubmit={handleFormSubmit(props.onFindRhymes, { word: rhymeWord })}>
                                <div className="flex gap-2">
                                    <input type="text" value={rhymeWord} onChange={(e) => setRhymeWord(e.target.value)} placeholder="e.g., rain" className={`flex-grow ${inputClasses}`} />
                                    <button type="submit" className={`${baseButtonClasses} w-auto`}>Find</button>
                                </div>
                            </form>
                            <ResultList items={props.rhymes} />
                        </ToolSection>
                        <ToolSection title="Thesaurus">
                             <form onSubmit={handleFormSubmit(props.onFindSynonyms, { word: synonymWord })}>
                                 <div className="flex gap-2">
                                    <input type="text" value={synonymWord} onChange={(e) => setSynonymWord(e.target.value)} placeholder="e.g., beautiful" className={`flex-grow ${inputClasses}`} />
                                    <button type="submit" className={`${baseButtonClasses} w-auto`}>Find</button>
                                </div>
                            </form>
                            <ResultList items={props.synonyms} />
                        </ToolSection>
                         <ToolSection title="Word Web">
                             <form onSubmit={handleFormSubmit(props.onGenerateWordAssociations, { word: associationWord })}>
                                 <div className="flex gap-2">
                                    <input type="text" value={associationWord} onChange={(e) => setAssociationWord(e.target.value)} placeholder="e.g., midnight" className={`flex-grow ${inputClasses}`} />
                                    <button type="submit" className={`${baseButtonClasses} w-auto`}>Go</button>
                                </div>
                            </form>
                            <ResultList items={props.wordAssociations} />
                        </ToolSection>
                        <ToolSection title="Rhythm & Meter">
                             <form onSubmit={handleFormSubmit(props.onSuggestRhythms, { line: rhythmLine })}>
                                <div className="flex gap-2">
                                    <input type="text" value={rhythmLine} onChange={(e) => setRhythmLine(e.target.value)} placeholder="e.g., I walk the lonely road" className={inputClasses} />
                                    <button type="submit" className={`${baseButtonClasses} w-auto`}>Suggest</button>
                                </div>
                            </form>
                            <RhythmList items={props.rhythmSuggestions} />
                        </ToolSection>
                    </>
                )}
                {activeTab === 'music' && (
                    <ToolSection title="Chord Progression">
                         <ChordRiver 
                            library={props.chordLibrary}
                            progression={props.chordRiverProgression}
                            currentKey={props.currentKey}
                            onUpdateProgression={props.onUpdateProgression}
                            onGenerateLibrary={props.onGenerateLibrary}
                            onPlay={props.onPlayProgression}
                        />
                    </ToolSection>
                )}
                {activeTab === 'inspiration' && (
                     <>
                        <ToolSection title="Generate Idea">
                            <form onSubmit={handleFormSubmit(props.onGenerateIdea, { topic })}>
                                <label htmlFor="idea-topic" className={labelClasses}>What's your song about?</label>
                                <div className="flex gap-2">
                                    <input id="idea-topic" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., city lights, lost love" className={`flex-grow ${inputClasses}`} />
                                    <button type="submit" className={`${baseButtonClasses} w-auto`}>Go</button>
                                </div>
                            </form>
                        </ToolSection>
                        <ToolSection title="Style Blender">
                            <form onSubmit={handleFormSubmit(props.onGenerateBlendedIdea, { artists })}>
                                <label htmlFor="style-blender-artists" className={labelClasses}>Blend the styles of...</label>
                                <div className="flex gap-2">
                                    <input id="style-blender-artists" type="text" value={artists} onChange={(e) => setArtists(e.target.value)} placeholder="e.g., Artist 1, Artist 2" className={`flex-grow ${inputClasses}`} />
                                    <button type="submit" className={`${baseButtonClasses} w-auto`}>Blend</button>
                                </div>
                            </form>
                        </ToolSection>
                         <ToolSection title="Writer's Block Buster">
                            <button onClick={() => props.onGeneratePrompt()} className={baseButtonClasses}>
                                Get a Creative Prompt
                            </button>
                            {props.creativePrompt && (
                                <div className="mt-2 bg-sepia-200/40 p-2 rounded-md border border-sepia-200">
                                    <div className="text-sm text-sepia-800 flex justify-between items-start bg-cream-100/50 p-2 rounded">
                                        <span className="pr-2">{props.creativePrompt}</span>
                                        <button onClick={() => navigator.clipboard.writeText(props.creativePrompt!)} title="Copy" className="text-sepia-400 hover:text-orange-700 transition-colors flex-shrink-0 p-1">
                                            <ClipboardIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </ToolSection>
                        <ToolSection title="Inspirational Sparks">
                             <p className="text-xs text-sepia-800 mb-2">Get a spark of creativity from the mind of a great artist, poet, or thinker.</p>
                             <div className="grid grid-cols-3 gap-2">
                                 <SparkButton icon={<QuillIcon className="w-5 h-5" />} label="Poet" onClick={() => props.onGenerateInspirationalSpark({sourceType: 'poet'})} />
                                 <SparkButton icon={<EyeIcon className="w-5 h-5" />} label="Artist" onClick={() => props.onGenerateInspirationalSpark({sourceType: 'artist'})} />
                                 <SparkButton icon={<ChatBubbleBottomCenterTextIcon className="w-5 h-5" />} label="Thinker" onClick={() => props.onGenerateInspirationalSpark({sourceType: 'philosopher'})} />
                             </div>
                             {props.inspirationalSpark && (
                                <div className="mt-2 bg-sepia-200/40 p-2 rounded-md border border-sepia-200">
                                    <div className="text-sm text-sepia-800 flex justify-between items-start bg-cream-100/50 p-2 rounded">
                                        <span className="pr-2 italic">"{props.inspirationalSpark}"</span>
                                        <button onClick={() => navigator.clipboard.writeText(props.inspirationalSpark!)} title="Copy" className="text-sepia-400 hover:text-orange-700 transition-colors flex-shrink-0 p-1">
                                            <ClipboardIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </ToolSection>
                    </>
                )}
                 {activeTab === 'analysis' && (
                     <>
                        <ToolSection title="Song Structure Ideas">
                            <button onClick={props.onSuggestStructures} className={baseButtonClasses}>Suggest Structures</button>
                            {props.structureSuggestions.length > 0 && (
                                <div className="mt-2 bg-sepia-200/40 p-2 rounded-md max-h-40 overflow-y-auto border border-sepia-200">
                                    <ul className="space-y-1">
                                        {props.structureSuggestions.map((item, index) => (
                                            <li key={index} className="text-xs text-sepia-800 flex justify-between items-center bg-cream-100/50 p-1.5 rounded">
                                                <span>{item.replace(/,/g, ' - ')}</span>
                                                <button onClick={() => props.onApplyStructure(item)} title="Apply Structure" className="text-orange-700 hover:text-orange-600 transition-colors text-xs font-bold ml-2">
                                                    APPLY
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </ToolSection>
                        <ToolSection title="Song Doctor AI">
                            <p className="text-xs text-sepia-800 mb-2">Get expert feedback on your complete song's lyrics, structure, and harmony.</p>
                            <button onClick={props.onAnalyzeSong} className={baseButtonClasses}>
                                Get Feedback
                            </button>
                        </ToolSection>
                     </>
                )}
            </div>
        </div>
    );
};