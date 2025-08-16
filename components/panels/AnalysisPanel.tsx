import React from 'react';
import type { SongData } from '../../types';

interface AnalysisPanelProps {
    songData: SongData;
    onAnalyzeSong: (analysisType: 'song_doctor' | 'rhyme_analyzer' | 'repetition_analyzer') => void;
    onSuggestStructures: () => void;
    structureSuggestions: string[];
    onApplyStructure: (structure: string) => void;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = (props) => {
    const baseButtonClasses = "w-full bg-orange-700 hover:bg-orange-600 text-cream-100 font-semibold text-sm px-4 py-2 rounded-md transition-all duration-200 shadow-sm border-b-2 border-orange-900/50";

    return (
        <div className="space-y-4">
             <div>
                <h4 className="text-xs text-sepia-800 mb-1 block font-semibold">Song Structure Ideas</h4>
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
            </div>
             <div>
                <h4 className="text-xs text-sepia-800 mb-1 block font-semibold">Song Doctor AI</h4>
                 <p className="text-xs text-sepia-800 mb-2">Get expert feedback on your song's lyrics, structure, and harmony.</p>
                <div className="grid grid-cols-1 gap-2">
                     <button onClick={() => props.onAnalyzeSong('song_doctor')} className={baseButtonClasses}>
                        Overall Feedback
                    </button>
                    <button onClick={() => props.onAnalyzeSong('rhyme_analyzer')} className={baseButtonClasses}>
                        Analyze Rhymes
                    </button>
                     <button onClick={() => props.onAnalyzeSong('repetition_analyzer')} className={baseButtonClasses}>
                        Analyze Repetition
                    </button>
                </div>
            </div>
        </div>
    );
};
