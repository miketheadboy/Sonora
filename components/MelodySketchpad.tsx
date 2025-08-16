
import React from 'react';
import type { MelodyNote } from '../types';
import { MELODY_PITCHES } from '../constants';

interface MelodySketchpadProps {
    melody: MelodyNote[];
    onMelodyChange: (melody: MelodyNote[]) => void;
    playheadPosition: number;
    isPlaying: boolean;
}

const TOTAL_BEATS = 16; // 4 bars of 4/4
const STEPS_PER_BEAT = 4;
const TOTAL_STEPS = TOTAL_BEATS * STEPS_PER_BEAT;
const PITCHES = MELODY_PITCHES;

export const MelodySketchpad: React.FC<MelodySketchpadProps> = ({ melody, onMelodyChange, playheadPosition, isPlaying }) => {

    const handleCellClick = (pitch: string, startBeat: number) => {
        const existingNoteIndex = melody.findIndex(note => note.pitch === pitch && Math.abs(note.startBeat - startBeat) < 0.01);

        if (existingNoteIndex !== -1) {
            // Remove note
            onMelodyChange(melody.filter((_, index) => index !== existingNoteIndex));
        } else {
            // Add note
            const newNote: MelodyNote = {
                pitch,
                startBeat,
                durationBeats: 1 / STEPS_PER_BEAT
            };
            onMelodyChange([...melody, newNote]);
        }
    };
    
    const playheadStyle = {
        transform: `translateX(${playheadPosition * STEPS_PER_BEAT * 100}%)`,
        transition: isPlaying ? 'transform 0.05s linear' : 'none',
    };

    return (
         <div>
            <h4 className="text-xs font-semibold text-sepia-800 uppercase tracking-wider font-typewriter mb-2">Melody Sketchpad</h4>
            <div className="flex gap-2">
                 <div className="flex flex-col justify-around text-xs font-mono text-sepia-400 text-right">
                    {PITCHES.map(p => <div key={p} className="h-6 flex items-center flex-shrink-0">{p}</div>)}
                </div>
                <div className="flex-grow relative overflow-x-auto overflow-y-hidden bg-sepia-200/40 p-2 rounded-md border border-sepia-300">
                    <div className="relative w-[800px] md:w-[1200px]">
                        {/* Playhead */}
                        {isPlaying && (
                            <div 
                                className="absolute top-0 bottom-0 bg-orange-700/40 z-10" 
                                style={{ width: `${100 / TOTAL_STEPS}%`, ...playheadStyle }}
                            />
                        )}
                        
                        <div className="grid relative" style={{ gridTemplateColumns: `repeat(${TOTAL_STEPS}, minmax(0, 1fr))` }}>
                            {PITCHES.map((pitch) => (
                                <React.Fragment key={pitch}>
                                    {Array.from({ length: TOTAL_STEPS }).map((_, stepIndex) => {
                                        const startBeat = stepIndex / STEPS_PER_BEAT;
                                        const isNoteOn = melody.some(note => note.pitch === pitch && Math.abs(note.startBeat - startBeat) < 0.01);
                                        const isBeat = stepIndex % STEPS_PER_BEAT === 0;
                                        const isBlackKey = pitch.includes('#');

                                        const baseClasses = "relative w-full h-6 border-r border-b transition-colors";
                                        const bgClasses = isBlackKey 
                                            ? 'bg-sepia-300/40 hover:bg-sepia-400/40' 
                                            : 'bg-cream-100/30 hover:bg-cream-100/80';
                                        const borderClasses = isBeat 
                                            ? 'border-sepia-400/50' 
                                            : 'border-sepia-300/50';
                                        
                                        return (
                                            <div
                                                key={`${pitch}-${stepIndex}`}
                                                className={`${baseClasses} ${bgClasses} ${borderClasses}`}
                                                onClick={() => handleCellClick(pitch, startBeat)}
                                            >
                                                {isNoteOn && <div className="absolute inset-0.5 bg-orange-700 rounded-sm" />}
                                            </div>
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
