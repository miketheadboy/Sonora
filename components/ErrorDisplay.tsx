
import React from 'react';

interface ErrorDisplayProps {
    message: string;
    onClose: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onClose }) => {
    return (
        <div className="fixed bottom-4 right-4 bg-orange-700/95 text-cream-100 p-4 rounded-lg shadow-lg max-w-sm z-50 border border-orange-900/20">
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-bold font-typewriter">Error</p>
                    <p className="text-sm">{message}</p>
                </div>
                <button onClick={onClose} className="ml-4 text-3xl font-light leading-none">&times;</button>
            </div>
        </div>
    );
};