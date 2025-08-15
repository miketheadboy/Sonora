import React from 'react';
import type { AudioAnalysisResult } from '../types';

interface AnalysisModalProps {
    analysis: string | AudioAnalysisResult;
    onClose: () => void;
}

// Type guard to check if the analysis prop is a structured audio result
const isAudioAnalysis = (analysis: string | AudioAnalysisResult): analysis is AudioAnalysisResult => {
    return typeof analysis === 'object' && analysis !== null && 'analysis' in analysis;
};


const formatSongAnalysisText = (text: string) => {
    // This regex splits by the **Header:** pattern, keeping the delimiter
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="text-sepia-900 font-typewriter block mt-3 mb-1 text-base">{part.slice(2, -2)}</strong>;
        }
         // Render bullet points correctly
        return part.split(/(\n\s*-\s.*)/g).map((line, lineIndex) => {
             if (line.trim().startsWith('-')) {
                 return <p key={`${index}-${lineIndex}`} className="pl-4 text-sepia-800">{line.trim()}</p>
             }
             return <span key={`${index}-${lineIndex}`}>{line}</span>
        });
    });
};

const AudioAnalysisContent: React.FC<{ result: AudioAnalysisResult }> = ({ result }) => (
    <div>
        <strong className="text-sepia-900 font-typewriter block mt-3 mb-1 text-base">Analysis</strong>
        <ul className="list-disc pl-5 text-sepia-800 space-y-1">
            <li><strong>Mood:</strong> {result.analysis.mood}</li>
            <li><strong>Tempo:</strong> {result.analysis.tempo}</li>
            <li><strong>Melodic Contour:</strong> {result.analysis.contour}</li>
        </ul>

        <strong className="text-sepia-900 font-typewriter block mt-3 mb-1 text-base">Lyrical Suggestion</strong>
        <p className="text-sepia-800 whitespace-pre-wrap">{result.lyricSuggestion}</p>

        <strong className="text-sepia-900 font-typewriter block mt-3 mb-1 text-base">Chord Progression Suggestion</strong>
        <p className="text-sepia-800">{result.chordSuggestion}</p>
    </div>
);


export const AnalysisModal: React.FC<AnalysisModalProps> = ({ analysis, onClose }) => {
    return (
        <div className="fixed inset-0 bg-sepia-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-cream-100 border border-sepia-300 rounded-lg shadow-2xl max-w-2xl w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-typewriter text-orange-700">AI Analysis</h2>
                    <button onClick={onClose} className="text-sepia-400 hover:text-sepia-800 text-3xl leading-none">&times;</button>
                </div>
                <div className="bg-sepia-200/40 border border-sepia-200 p-4 rounded-md text-sm leading-relaxed max-h-[60vh] overflow-y-auto">
                   {isAudioAnalysis(analysis) 
                        ? <AudioAnalysisContent result={analysis} /> 
                        : formatSongAnalysisText(analysis)
                   }
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="bg-orange-700 hover:bg-orange-600 text-cream-100 font-semibold text-sm px-4 py-2 rounded-md transition-all shadow-sm border-b-2 border-orange-900/50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};