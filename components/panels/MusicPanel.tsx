import React from 'react';
import type { Chord, MelodyNote, ProgressionStep, SongData } from '../../types';
import { TransportControls } from '../TransportControls';
import { ChordRiver } from '../ChordRiver';
import { PianoRoll } from '../PianoRoll';

interface MusicPanelProps {
    songData: SongData;
    isPlaying: boolean;
    playheadPosition: number;
    chordLibrary: Chord[];
    onUpdateProgression: (progression: ProgressionStep[]) => void;
    onUpdateProgressionStep: (id: string, updates: { durationBeats: number }) => void;
    onGenerateLibrary: (key: string) => void;
    onPlay: () => void;
    onStop: () => void;
    onUpdateBpm: (bpm: number) => void;
    onUpdateTimeSignature: (ts: string) => void;
    onUpdateMelody: (melody: MelodyNote[]) => void;
}

export const MusicPanel: React.FC<MusicPanelProps> = (props) => {
    return (
        <div className="space-y-4">
             <TransportControls 
                bpm={props.songData.bpm}
                timeSignature={props.songData.timeSignature}
                isPlaying={props.isPlaying}
                onBpmChange={props.onUpdateBpm}
                onTimeSignatureChange={props.onUpdateTimeSignature}
                onPlay={props.onPlay}
                onStop={props.onStop}
            />
            <ChordRiver 
                library={props.chordLibrary}
                progression={props.songData.progression}
                currentKey={props.songData.key}
                onUpdateProgression={props.onUpdateProgression}
                onUpdateProgressionStep={props.onUpdateProgressionStep}
                onGenerateLibrary={props.onGenerateLibrary}
            />
            <PianoRoll 
                melody={props.songData.melody}
                progression={props.songData.progression}
                onMelodyChange={props.onUpdateMelody}
                playheadPosition={props.playheadPosition}
                isPlaying={props.isPlaying}
            />
        </div>
    );
}
