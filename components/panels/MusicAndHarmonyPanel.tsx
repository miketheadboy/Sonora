
import React from 'react';
import type { Chord } from '../../types';
import { TransportControls } from '../TransportControls';
import { ChordRiver } from '../ChordRiver';
import { PianoRoll } from '../PianoRoll';

interface MusicAndHarmonyPanelProps {
    isPlaying: boolean;
    playheadPosition: number;
    chordLibrary: Chord[];
    onPlay: () => void;
    onStop: () => void;
}

export const MusicAndHarmonyPanel: React.FC<MusicAndHarmonyPanelProps> = (props) => {
    return (
        <div className="space-y-4">
             <TransportControls 
                isPlaying={props.isPlaying}
                onPlay={props.onPlay}
                onStop={props.onStop}
            />
            <ChordRiver 
                library={props.chordLibrary}
            />
            <PianoRoll 
                playheadPosition={props.playheadPosition}
                isPlaying={props.isPlaying}
            />
        </div>
    );
}
