import React from 'react';
import type { RhythmPattern } from '../types';

interface RhythmSequencerProps {
    pattern: RhythmPattern;
    onPatternChange: (pattern: RhythmPattern) => void;
}

export const RhythmSequencer: React.FC<RhythmSequencerProps> = ({ pattern, onPatternChange }) => {

    const handleStepClick = (index: number) => {
        const newPattern = [...pattern];
        newPattern[index] = newPattern[index] === 1 ? 0 : 1;
        onPatternChange(newPattern);
    };

    return (
        <div>
            <h4 className="text-xs font-semibold text-sepia-800 uppercase tracking-wider font-typewriter mb-2">Chord Rhythm</h4>
            <div className="grid grid-cols-8 gap-1 p-2 bg-sepia-200/40 rounded-md border border-sepia-300">
                {pattern.map((step, index) => {
                    const isBeat = index % 4 === 0;
                    const isActive = step === 1;

                    const baseClasses = "w-full h-8 rounded transition-colors cursor-pointer border";
                    const activeClasses = "bg-teal-500 border-teal-700";
                    const inactiveClasses = isBeat 
                        ? "bg-sepia-300/60 border-sepia-400/50 hover:bg-sepia-300"
                        : "bg-sepia-200/60 border-sepia-300/50 hover:bg-sepia-300/80";

                    return (
                        <button
                            key={index}
                            onClick={() => handleStepClick(index)}
                            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                            aria-label={`Step ${index + 1}`}
                        />
                    );
                })}
            </div>
        </div>
    );
};
