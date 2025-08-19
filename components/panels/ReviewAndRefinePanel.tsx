
import React from 'react';
import type { AnalysisType } from '../../types';

interface ReviewAndRefinePanelProps {
    onAnalyzeSong: (analysisType: AnalysisType) => void;
}

export const ReviewAndRefinePanel: React.FC<ReviewAndRefinePanelProps> = (props) => {
    const baseButtonClasses = "w-full bg-orange-700 hover:bg-orange-600 text-cream-100 font-semibold text-sm px-4 py-2 rounded-md transition-all duration-200 shadow-sm border-b-2 border-orange-900/50";

    return (
        <div className="space-y-4">
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
