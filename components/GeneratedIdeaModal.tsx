import React from 'react';
import { ClipboardIcon } from './icons';

interface GeneratedIdeaModalProps {
    idea: string;
    onClose: () => void;
}

export const GeneratedIdeaModal: React.FC<GeneratedIdeaModalProps> = ({ idea, onClose }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(idea);
    };

    return (
        <div className="fixed inset-0 bg-sepia-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-cream-100 border border-sepia-300 rounded-lg shadow-2xl max-w-lg w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-typewriter text-orange-700">New Song Idea!</h2>
                    <button onClick={onClose} className="text-sepia-400 hover:text-sepia-800 text-3xl leading-none">&times;</button>
                </div>
                <div className="bg-sepia-200/40 border border-sepia-200 p-4 rounded-md whitespace-pre-wrap text-sepia-800 max-h-[50vh] overflow-y-auto">
                    {idea}
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 bg-cream-100/50 hover:bg-cream-100 text-sepia-800 font-semibold text-sm px-4 py-2 rounded-md transition-all border border-sepia-300 shadow-sm"
                    >
                        <ClipboardIcon className="w-4 h-4" />
                        Copy Idea
                    </button>
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