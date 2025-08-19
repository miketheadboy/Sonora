
import React, { useState, useRef, MouseEvent, memo, useContext } from 'react';
import type { MelodyNote, ProgressionStep } from '../types';
import { MELODY_PITCHES } from '../constants';
import { SongDataContext, ActionsContext } from '../App';

interface PianoRollProps {
    playheadPosition: number;
    isPlaying: boolean;
}

const BEAT_WIDTH = 40; // width of one beat in pixels
const PITCH_HEIGHT = 24; // height of one pitch row in pixels
const PITCHES = MELODY_PITCHES;

const PianoRollComponent: React.FC<PianoRollProps> = ({ playheadPosition, isPlaying }) => {
    const songData = useContext(SongDataContext);
    const actions = useContext(ActionsContext);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingNote, setDrawingNote] = useState<MelodyNote | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    if (!songData || !actions) return null;
    const { melody, progression } = songData;
    const { onUpdateMelody } = actions;

    const totalBeats = progression.reduce((sum, step) => sum + step.durationBeats, 0) || 16;
    const gridWidth = totalBeats * BEAT_WIDTH;
    const gridHeight = PITCHES.length * PITCH_HEIGHT;

    const getNoteFromMouseEvent = (e: MouseEvent<HTMLDivElement>): Omit<MelodyNote, 'durationBeats'> => {
        const rect = gridRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const startBeat = Math.floor(x / BEAT_WIDTH * 4) / 4; // Quantize to 16th notes
        const pitchIndex = Math.floor(y / PITCH_HEIGHT);
        const pitch = PITCHES[pitchIndex];

        return { pitch, startBeat };
    };

    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        const { pitch, startBeat } = getNoteFromMouseEvent(e);

        // Check if clicking on an existing note to delete it
        const noteToDelete = melody.find(n => n.pitch === pitch && startBeat >= n.startBeat && startBeat < n.startBeat + n.durationBeats);
        if (noteToDelete) {
            onUpdateMelody(melody.filter(n => n !== noteToDelete));
            return;
        }

        setIsDrawing(true);
        setDrawingNote({ pitch, startBeat, durationBeats: 0.25 });
    };

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!isDrawing || !drawingNote) return;

        const { startBeat: currentBeat } = getNoteFromMouseEvent(e);
        const newDuration = Math.max(0.25, currentBeat - drawingNote.startBeat + 0.25);
        setDrawingNote({ ...drawingNote, durationBeats: newDuration });
    };

    const handleMouseUp = () => {
        if (isDrawing && drawingNote) {
            onUpdateMelody([...melody, drawingNote]);
        }
        setIsDrawing(false);
        setDrawingNote(null);
    };

    const handleMouseLeave = () => {
        if (isDrawing) {
            handleMouseUp();
        }
    };
    
    let currentBeat = 0;
    const chordBlocks = progression.map((step) => {
        const block = (
            <div
                key={step.id}
                className="h-full absolute opacity-20"
                style={{
                    left: `${currentBeat * BEAT_WIDTH}px`,
                    width: `${step.durationBeats * BEAT_WIDTH}px`,
                    backgroundColor: step.chord.function === 'tonic' ? '#c2410c' : step.chord.function === 'dominant' ? '#a33100' : '#115e59',
                }}
            />
        );
        currentBeat += step.durationBeats;
        return block;
    });

    const gridStyle = {
        width: gridWidth,
        height: gridHeight,
        backgroundImage: `
            repeating-linear-gradient(to right, rgba(229, 226, 222, 0.7) 0 1px, transparent 1px ${BEAT_WIDTH / 4}px),
            repeating-linear-gradient(to right, rgba(195, 191, 185, 0.7) 0 1px, transparent 1px ${BEAT_WIDTH}px),
            repeating-linear-gradient(to bottom, rgba(195, 191, 185, 0.5) 0 1px, transparent 1px ${PITCH_HEIGHT}px)
        `,
    };

    return (
        <div>
            <div className="flex gap-2">
                <div className="flex flex-col text-xs font-mono text-sepia-400 text-right flex-shrink-0 w-8">
                    {PITCHES.map(p => <div key={p} style={{ height: PITCH_HEIGHT }} className="flex items-center justify-end pr-1">{p.slice(0, -1)}</div>)}
                </div>
                <div className="flex-grow relative overflow-x-auto bg-sepia-200/40 p-1 rounded-md border border-sepia-300">
                    <div
                        ref={gridRef}
                        className="relative cursor-crosshair"
                        style={gridStyle}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                    >
                        {/* Background Chord Blocks */}
                        <div className="absolute inset-0">{chordBlocks}</div>
                        
                        {/* Rendered Melody Notes */}
                        {melody.map((note, i) => {
                            const y = PITCHES.indexOf(note.pitch) * PITCH_HEIGHT;
                            return (
                                <div
                                    key={i}
                                    className="absolute bg-orange-700 rounded-sm border border-orange-900/50"
                                    style={{
                                        top: `${y + 2}px`,
                                        left: `${note.startBeat * BEAT_WIDTH}px`,
                                        width: `${note.durationBeats * BEAT_WIDTH - 2}px`,
                                        height: `${PITCH_HEIGHT - 4}px`,
                                    }}
                                />
                            )
                        })}
                        {/* Note being drawn */}
                        {drawingNote && (
                             <div
                                className="absolute bg-orange-700/70 rounded-sm border border-dashed border-orange-900"
                                style={{
                                    top: `${PITCHES.indexOf(drawingNote.pitch) * PITCH_HEIGHT + 2}px`,
                                    left: `${drawingNote.startBeat * BEAT_WIDTH}px`,
                                    width: `${drawingNote.durationBeats * BEAT_WIDTH - 2}px`,
                                    height: `${PITCH_HEIGHT - 4}px`,
                                }}
                            />
                        )}
                        
                        {/* Playhead */}
                        {isPlaying && (
                            <div 
                                className="absolute top-0 bottom-0 bg-orange-700/50 z-10 w-0.5" 
                                style={{ transform: `translateX(${playheadPosition * BEAT_WIDTH}px)` }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const PianoRoll = memo(PianoRollComponent);
