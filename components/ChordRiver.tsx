
import React, { useState, memo, useContext } from 'react';
import type { Chord, ProgressionStep } from '../types';
import { MUSICAL_KEYS, CHORD_FUNCTION_COLORS } from '../constants';
import { TrashIcon, PlusIcon, MinusIcon } from './icons';
import { SongDataContext, ActionsContext } from '../state/songState';

interface ChordRiverProps {
    library: Chord[];
}

const ChordBlock: React.FC<{ 
    step?: ProgressionStep; 
    chord: Chord;
    isDraggable?: boolean; 
    onDragStart?: (e: React.DragEvent, chord: Chord) => void; 
    onUpdateDuration?: (newDuration: number) => void;
}> = memo(({ step, chord, isDraggable = false, onDragStart, onUpdateDuration }) => {
    const colorClass = CHORD_FUNCTION_COLORS[chord.function] || CHORD_FUNCTION_COLORS['other'];
    
    return (
        <div
            draggable={isDraggable}
            onDragStart={isDraggable ? (e) => onDragStart?.(e, chord) : undefined}
            className={`px-2 py-1 rounded-md font-semibold text-sm shadow-sm border ${colorClass} ${isDraggable ? 'cursor-grab' : ''} transition-transform hover:scale-105 flex flex-col items-center gap-1`}
        >
            <span>{chord.name}</span>
            {step && onUpdateDuration && (
                 <div className="flex items-center gap-1.5 bg-black/10 rounded-full px-1">
                     <button onClick={() => onUpdateDuration(Math.max(1, step.durationBeats - 1))} className="p-0.5"><MinusIcon className="w-3 h-3"/></button>
                     <span className="text-xs font-mono w-4 text-center">{step.durationBeats}</span>
                     <button onClick={() => onUpdateDuration(step.durationBeats + 1)} className="p-0.5"><PlusIcon className="w-3 h-3"/></button>
                 </div>
            )}
        </div>
    );
});

const ChordRiverComponent: React.FC<ChordRiverProps> = ({ library }) => {
    const songData = useContext(SongDataContext);
    const actions = useContext(ActionsContext);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    if (!songData || !actions) return null;
    const { progression, key: currentKey } = songData;
    const { onUpdateProgression, onUpdateProgressionStep, onGenerateLibrary } = actions;

    const handleKeyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onGenerateLibrary(e.target.value);
    };
    
    // Drag from library
    const handleLibraryDragStart = (e: React.DragEvent, chord: Chord) => {
        e.dataTransfer.setData('application/json', JSON.stringify(chord));
        e.dataTransfer.setData('source', 'library');
    };
    
    // Drag within progression
    const handleProgressionDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.setData('source', 'progression');
    };

    const handleDrop = (e: React.DragEvent, dropIndex?: number) => {
        e.preventDefault();
        const source = e.dataTransfer.getData('source');

        if (source === 'library') {
            const chordData = e.dataTransfer.getData('application/json');
            if (chordData) {
                const newChord = JSON.parse(chordData) as Chord;
                const newStep: ProgressionStep = {
                    id: `step-${Date.now()}`,
                    chord: newChord,
                    durationBeats: 4,
                };
                const newProgression = [...progression];
                newProgression.splice(dropIndex ?? progression.length, 0, newStep);
                onUpdateProgression(newProgression);
            }
        } else if (source === 'progression' && draggedIndex !== null) {
            const finalDropIndex = dropIndex ?? progression.length;
            if (draggedIndex === finalDropIndex) return;

            const newProgression = [...progression];
            const [removed] = newProgression.splice(draggedIndex, 1);
            newProgression.splice(finalDropIndex, 0, removed);
            onUpdateProgression(newProgression);
        }
        setDraggedIndex(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleClear = () => {
        onUpdateProgression([]);
    };
    
    const handleRemoveStep = (id: string) => {
        onUpdateProgression(progression.filter(step => step.id !== id));
    };

    const selectClasses = "w-full bg-cream-100 text-sepia-900 border border-sepia-300 rounded-md px-3 py-2 text-sm placeholder-sepia-400 focus:outline-none focus:ring-1 focus:ring-orange-700 focus:border-orange-700";

    return (
        <div className="space-y-3">
            <div>
                <label className="text-xs text-sepia-800 block mb-1 font-semibold">Key</label>
                <select value={currentKey} onChange={handleKeyChange} className={selectClasses}>
                    {MUSICAL_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
            </div>
            
            <div 
                onDrop={(e) => handleDrop(e)} 
                onDragOver={handleDragOver}
                className={`min-h-[70px] bg-sepia-200/40 p-2 rounded-lg border border-sepia-300 transition-colors flex flex-wrap items-start gap-2`}
            >
                {progression.length === 0 ? (
                    <p className="w-full text-center text-sepia-800/60 text-xs py-4">Drag chords from the library here</p>
                ) : (
                    progression.map((step, index) => (
                        <div key={step.id} className="relative group" draggable onDragStart={(e) => handleProgressionDragStart(e, index)}>
                             <ChordBlock
                                step={step}
                                chord={step.chord}
                                onUpdateDuration={(newDuration) => onUpdateProgressionStep(step.id, { durationBeats: newDuration })}
                            />
                            <button onClick={() => handleRemoveStep(step.id)} className="absolute -top-1 -right-1 p-0.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <TrashIcon className="w-3 h-3"/>
                            </button>
                        </div>
                    ))
                )}
            </div>
            
            <div className="flex justify-between items-center">
                <h4 className="text-xs font-semibold text-sepia-800 uppercase tracking-wider font-typewriter">Chord Library</h4>
                 <button onClick={handleClear} disabled={progression.length === 0} className={`disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-xs text-sepia-800 hover:text-red-600`} title="Clear Progression">
                    <TrashIcon className="w-3 h-3" /> Clear
                </button>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {library.map((chord) => (
                    <ChordBlock key={chord.name} chord={chord} isDraggable onDragStart={handleLibraryDragStart} />
                ))}
            </div>
        </div>
    );
};

export const ChordRiver = memo(ChordRiverComponent);
