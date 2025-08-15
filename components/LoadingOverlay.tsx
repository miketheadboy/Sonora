import React from 'react';
import { SparklesIcon } from './icons';

export const LoadingOverlay: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-cream-100/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-4">
                <SparklesIcon className="w-12 h-12 text-orange-700 animate-pulse" />
                <p className="text-2xl font-semibold font-typewriter text-sepia-800 animate-pulse tracking-wide">AI Co-Writer is thinking...</p>
            </div>
        </div>
    );
};