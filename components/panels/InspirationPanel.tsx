import React, { useState } from 'react';
import type { GenerateIdeaParams, GenerateBlendedIdeaParams, GenerateTitleParams, GetInspirationalSparkParams, GenerateEmotionalPaletteParams, GenerateObjectObservationParams } from '../../types';
import { QuillIcon, EyeIcon, ChatBubbleBottomCenterTextIcon, ClipboardIcon } from '../icons';
import { EMOTIONAL_PALETTE_OPTIONS } from '../../constants';

interface InspirationPanelProps {
    onGenerateIdea: (params: GenerateIdeaParams) => void;
    onGenerateBlendedIdea: (params: GenerateBlendedIdeaParams) => void;
    onGenerateTitles: (params: GenerateTitleParams) => void;
    onGenerateEmotionalPalette: (params: GenerateEmotionalPaletteParams) => void;
    onGenerateObjectObservation: (params: GenerateObjectObservationParams) => void;
    onGeneratePrompt: () => void;
    onGenerateInspirationalSpark: (params: GetInspirationalSparkParams) => void;
    creativePrompt: string | null;
    inspirationalSpark: string | null;
}

const baseButtonClasses = "w-full bg-orange-700 hover:bg-orange-600 text-cream-100 font-semibold text-sm px-4 py-2 rounded-md transition-all duration-200 shadow-sm border-b-2 border-orange-900/50";
const inputClasses = "w-full bg-cream-100 text-sepia-900 border border-sepia-300 rounded-md px-3 py-2 text-sm placeholder-sepia-400 focus:outline-none focus:ring-1 focus:ring-orange-700 focus:border-orange-700";
const labelClasses = "text-xs text-sepia-800 mb-1 block font-semibold";

const ToolOutput: React.FC<{text: string | null}> = ({ text }) => {
    if (!text) return null;
    return (
        <div className="mt-2 bg-sepia-200/40 p-2 rounded-md border border-sepia-200">
            <div className="text-sm text-sepia-800 flex justify-between items-start bg-cream-100/50 p-2 rounded">
                <span className="pr-2 italic">"{text}"</span>
                <button onClick={() => navigator.clipboard.writeText(text)} title="Copy" className="text-sepia-400 hover:text-orange-700 transition-colors flex-shrink-0 p-1">
                    <ClipboardIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}


export const InspirationPanel: React.FC<InspirationPanelProps> = (props) => {
    const [topic, setTopic] = useState('');
    const [artists, setArtists] = useState('Elliott Smith, Brian Wilson');
    const [titleTheme, setTitleTheme] = useState('');
    const [object, setObject] = useState('a photograph');
    const [selectedEmotions, setSelectedEmotions] = useState<string[]>(['Nostalgic', 'Hopeful']);

    const handleEmotionToggle = (emotion: string) => {
        setSelectedEmotions(prev => 
            prev.includes(emotion) 
            ? prev.filter(e => e !== emotion)
            : [...prev, emotion]
        );
    };

    const SparkButton: React.FC<{icon: React.ReactNode, label: string, onClick: () => void}> = ({ icon, label, onClick }) => (
        <button onClick={onClick} className="flex flex-col items-center gap-1.5 p-2 rounded-md bg-cream-100/50 hover:bg-cream-100 text-sepia-800 font-semibold text-xs transition-all border border-sepia-300 shadow-sm">
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="space-y-4">
            <div>
                <h4 className={labelClasses}>Generate Full Idea</h4>
                 <div className="flex gap-2">
                    <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., city lights" className={`flex-grow ${inputClasses}`} />
                    <button onClick={() => props.onGenerateIdea({ topic })} className={`${baseButtonClasses} w-auto`}>Go</button>
                </div>
            </div>
             <div>
                <h4 className={labelClasses}>Blend Artist Styles</h4>
                 <div className="flex gap-2">
                    <input type="text" value={artists} onChange={(e) => setArtists(e.target.value)} placeholder="e.g., Artist 1, Artist 2" className={`flex-grow ${inputClasses}`} />
                    <button onClick={() => props.onGenerateBlendedIdea({ artists })} className={`${baseButtonClasses} w-auto`}>Blend</button>
                </div>
            </div>
            <div>
                <h4 className={labelClasses}>Generate Titles</h4>
                 <div className="flex gap-2">
                    <input type="text" value={titleTheme} onChange={(e) => setTitleTheme(e.target.value)} placeholder="Theme (e.g., solitude)" className={`flex-grow ${inputClasses}`} />
                    <button onClick={() => props.onGenerateTitles({ theme: titleTheme })} className={`${baseButtonClasses} w-auto`}>Get Titles</button>
                </div>
            </div>
            <div>
                 <h4 className={labelClasses}>Emotional Palette</h4>
                 <div className="flex flex-wrap gap-1 mb-2">
                     {EMOTIONAL_PALETTE_OPTIONS.map(emotion => (
                         <button 
                            key={emotion} 
                            onClick={() => handleEmotionToggle(emotion)}
                            className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${selectedEmotions.includes(emotion) ? 'bg-teal-700 text-cream-100 border-teal-800' : 'bg-cream-100 text-sepia-800 border-sepia-300'}`}
                         >
                            {emotion}
                         </button>
                     ))}
                 </div>
                 <button onClick={() => props.onGenerateEmotionalPalette({ emotions: selectedEmotions })} disabled={selectedEmotions.length === 0} className={`${baseButtonClasses} disabled:opacity-50`}>
                    Create Scene
                </button>
            </div>
             <div>
                <h4 className={labelClasses}>Object Observer</h4>
                 <div className="flex gap-2">
                    <input type="text" value={object} onChange={(e) => setObject(e.target.value)} placeholder="e.g., a broken teacup" className={`flex-grow ${inputClasses}`} />
                    <button onClick={() => props.onGenerateObjectObservation({ object })} className={`${baseButtonClasses} w-auto`}>Observe</button>
                </div>
            </div>
            <div>
                <h4 className={labelClasses}>Writer's Block Buster</h4>
                 <button onClick={() => props.onGeneratePrompt()} className={baseButtonClasses}>
                    Get a Creative Prompt
                </button>
                <ToolOutput text={props.creativePrompt} />
            </div>
            <div>
                <h4 className={labelClasses}>Inspirational Sparks</h4>
                <div className="grid grid-cols-3 gap-2">
                     <SparkButton icon={<QuillIcon className="w-5 h-5" />} label="Poet" onClick={() => props.onGenerateInspirationalSpark({sourceType: 'poet'})} />
                     <SparkButton icon={<EyeIcon className="w-5 h-5" />} label="Artist" onClick={() => props.onGenerateInspirationalSpark({sourceType: 'artist'})} />
                     <SparkButton icon={<ChatBubbleBottomCenterTextIcon className="w-5 h-5" />} label="Thinker" onClick={() => props.onGenerateInspirationalSpark({sourceType: 'philosopher'})} />
                 </div>
                 <ToolOutput text={props.inspirationalSpark} />
            </div>
        </div>
    )
};
