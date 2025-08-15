import React, { useState } from 'react';
import type { Chord } from '../types';
import { MUSICAL_KEYS, CHORD_FUNCTION_COLORS } from '../constants';
import { PlayIcon, TrashIcon } from './icons';

interface ChordRiverProps {
    library: Chord[];
    progression: Chord[];
    currentKey: string;
    onUpdateProgression: (progression: Chord[]) => void;
    onGenerateLibrary: (key: string) => void;
    onPlay: () => void;
}

const ChordBlock: React.FC<{ chord: Chord; isDraggable?: boolean; onDragStart?: (e: React.DragEvent, chord: Chord) => void; }> = ({ chord, isDraggable = false, onDragStart }) => {
    const colorClass = CHORD_FUNCTION_COLORS[chord.function] || CHORD_FUNCTION_COLORS['other'];
    
    return (
        <div
            draggable={isDraggable}
            onDragStart={isDraggable ? (e) => onDragStart?.(e, chord) : undefined}
            className={`px-3 py-1.5 rounded-md font-semibold text-sm text-center shadow-sm border ${colorClass} ${isDraggable ? 'cursor-grab' : ''} transition-transform hover:scale-105`}
        >
            {chord.name}
        </div>
    );
};

export const ChordRiver: React.FC<ChordRiverProps> = ({ library, progression, currentKey, onUpdateProgression, onGenerateLibrary, onPlay }) => {
    const [dragOver, setDragOver] = useState(false);

    const handleKeyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onGenerateLibrary(e.target.value);
        onUpdateProgression([]); // Clear progression when key changes
    };

    const handleDragStart = (e: React.DragEvent, chord: Chord) => {
        e.dataTransfer.setData('application/json', JSON.stringify(chord));
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const chordData = e.dataTransfer.getData('application/json');
        if (chordData) {
            const chord = JSON.parse(chordData) as Chord;
            onUpdateProgression([...progression, chord]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };
    
    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleClear = () => {
        onUpdateProgression([]);
    };

    const selectClasses = "w-full bg-cream-100 text-sepia-900 border border-sepia-300 rounded-md px-3 py-2 text-sm placeholder-sepia-400 focus:outline-none focus:ring-1 focus:ring-orange-700 focus:border-orange-700";
    const baseButtonClasses = "bg-orange-700 hover:bg-orange-600 text-cream-100 font-semibold text-sm px-3 py-1.5 rounded-md transition-all shadow-sm border-b-2 border-orange-900/50";
    const secondaryButtonClasses = "bg-cream-100/50 hover:bg-cream-100 text-sepia-800 font-semibold text-sm px-3 py-1.5 rounded-md transition-all border border-sepia-300 shadow-sm";

    return (
        <div className="space-y-3">
            <div>
                <label className="text-xs text-sepia-800 block mb-1">Key</label>
                <select value={currentKey} onChange={handleKeyChange} className={selectClasses}>
                    {MUSICAL_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
            </div>
            
            <div 
                onDrop={handleDrop} 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`min-h-[70px] bg-sepia-200/40 p-2 rounded-lg border-2 border-dashed ${dragOver ? 'border-orange-400 bg-orange-100/20' : 'border-sepia-300'} transition-colors flex items-center flex-wrap gap-2`}
            >
                {progression.length === 0 ? (
                    <p className="w-full text-center text-sepia-800/60 text-xs">Drag chords from the library below</p>
                ) : (
                    progression.map((chord, index) => <ChordBlock key={index} chord={chord} />)
                )}
            </div>
            
            <div className="flex justify-between items-center">
                <h4 className="text-xs font-semibold text-sepia-800 uppercase tracking-wider font-typewriter">Chord Library</h4>
                <div className="flex gap-2">
                    <button onClick={handleClear} disabled={progression.length === 0} className={`${secondaryButtonClasses} disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5`} title="Clear Progression">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                     <button onClick={onPlay} disabled={progression.length === 0} className={`${baseButtonClasses} disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5`} title="Play Progression">
                        <PlayIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {library.map((chord) => (
                    <ChordBlock key={chord.name} chord={chord} isDraggable onDragStart={handleDragStart} />
                ))}
            </div>
        </div>
    );
};