
import React, { useContext } from 'react';
import { TIME_SIGNATURES } from '../constants';
import { PlayCircleIcon, StopCircleIcon } from './icons';
import { SongDataContext, ActionsContext } from '../App';

interface TransportControlsProps {
    isPlaying: boolean;
    onPlay: () => void;
    onStop: () => void;
}

export const TransportControls: React.FC<TransportControlsProps> = ({ isPlaying, onPlay, onStop }) => {
    const songData = useContext(SongDataContext);
    const actions = useContext(ActionsContext);

    if (!songData || !actions) return null;
    const { bpm, timeSignature } = songData;
    const { onUpdateBpm, onUpdateTimeSignature } = actions;

    const selectClasses = "bg-cream-100 text-sepia-900 border border-sepia-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-orange-700 focus:border-orange-700";
    const labelClasses = "text-xs text-sepia-800 block mb-1 font-semibold text-center";

    return (
        <div className="bg-sepia-200/50 border-b border-sepia-200 p-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                {isPlaying ? (
                    <button onClick={onStop} className="text-orange-700 hover:text-orange-600 transition-colors" title="Stop">
                        <StopCircleIcon className="w-10 h-10" />
                    </button>
                ) : (
                    <button onClick={onPlay} className="text-teal-700 hover:text-teal-600 transition-colors" title="Play">
                        <PlayCircleIcon className="w-10 h-10" />
                    </button>
                )}
            </div>

            <div className="flex-grow flex items-center justify-end gap-4">
                 <div>
                    <label htmlFor="bpm-slider" className={labelClasses}>
                        BPM: <span className="font-bold font-mono">{bpm}</span>
                    </label>
                    <input
                        type="range"
                        id="bpm-slider"
                        min="40"
                        max="220"
                        value={bpm}
                        onChange={(e) => onUpdateBpm(Number(e.target.value))}
                        className="w-24 h-2 bg-sepia-300 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
                 <div>
                     <label htmlFor="time-sig-select" className={labelClasses}>
                        Time Sig
                    </label>
                    <select id="time-sig-select" value={timeSignature} onChange={(e) => onUpdateTimeSignature(e.target.value)} className={selectClasses}>
                        {TIME_SIGNATURES.map(ts => <option key={ts} value={ts}>{ts}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
};
