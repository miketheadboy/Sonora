import type { SongData, MelodyNote, ProgressionStep } from '../types';

const NOTE_FREQUENCIES: { [key: string]: number } = {
    'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
};

const CHORD_INTERVALS: { [key: string]: number[] } = {
    'maj': [0, 4, 7], 'min': [0, 3, 7], 'dim': [0, 3, 6], 'aug': [0, 4, 8],
    '7': [0, 4, 7, 10], 'maj7': [0, 4, 7, 11], 'min7': [0, 3, 7, 10],
};

const ALL_NOTES = Object.keys(NOTE_FREQUENCIES);

class AudioService {
    private audioContext: AudioContext | null = null;
    private isPlaying = false;
    private schedulerTimer: number | null = null;
    private nextNoteTime = 0.0;
    private currentBeat = 0;
    
    // Song data
    private bpm = 120;
    private progression: ProgressionStep[] = [];
    private melody: MelodyNote[] = [];
    private totalProgressionBeats = 16;

    // Timing
    private scheduleAheadTime = 0.1; // seconds
    private lookahead = 25.0; // ms

    private initialize() {
        if (!this.audioContext && typeof window !== 'undefined') {
            try {
                this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (e) {
                console.error("Web Audio API is not supported in this browser");
            }
        }
    }
    
    private getChordFrequencies(chordName: string): number[] {
        const rootMatch = chordName.match(/^[A-G][#b]?/);
        if (!rootMatch) return [];
        let root = rootMatch[0];
        let quality = chordName.substring(root.length);
        
        if (root.includes('b')) {
            const noteIndex = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'].indexOf(root);
            root = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][(noteIndex + 11) % 12];
        }
        
        const rootIndex = ALL_NOTES.findIndex(n => n.startsWith(root) && n.endsWith('3')); // Use 3rd octave for chords
        if (rootIndex === -1) return [];

        if (quality.startsWith('m')) quality = quality.includes('7') ? 'min7' : 'min';
        else if (quality.startsWith('dim')) quality = 'dim';
        else if (quality.startsWith('aug')) quality = 'aug';
        else if (quality.includes('maj7')) quality = 'maj7';
        else if (quality.includes('7')) quality = '7';
        else quality = 'maj';

        const intervals = CHORD_INTERVALS[quality] || CHORD_INTERVALS['maj'];

        return intervals.map(interval => {
            const noteIndex = rootIndex + interval;
            return noteIndex < ALL_NOTES.length ? NOTE_FREQUENCIES[ALL_NOTES[noteIndex]] : 0;
        }).filter(freq => freq > 0);
    }
    
    private scheduleNote(freq: number, startTime: number, duration: number, isMelody: boolean) {
        if (!this.audioContext) return;

        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // --- Sound Design ---
        osc.type = 'sawtooth'; 
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(isMelody ? 2000 : 800, this.audioContext.currentTime);
        filter.Q.value = 0.5;

        osc.frequency.setValueAtTime(freq, startTime);

        // ADSR Envelope
        const attackTime = 0.01;
        const decayTime = 0.2;
        const sustainLevel = 0.3;
        const releaseTime = 0.2;
        const peakGain = isMelody ? 0.15 : 0.08;

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(peakGain, startTime + attackTime);
        gainNode.gain.exponentialRampToValueAtTime(sustainLevel * peakGain, startTime + attackTime + decayTime);
        gainNode.gain.setValueAtTime(sustainLevel * peakGain, startTime + duration - releaseTime);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    private scheduler() {
        if (!this.audioContext || !this.isPlaying) return;

        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            const secondsPerBeat = 60.0 / this.bpm;
            
            // Find which chord is playing at the current beat
            let beatInProgression = 0;
            let currentChordStep: ProgressionStep | undefined;
            for(const step of this.progression) {
                if (this.currentBeat >= beatInProgression && this.currentBeat < beatInProgression + step.durationBeats) {
                    currentChordStep = step;
                    break;
                }
                beatInProgression += step.durationBeats;
            }

            // Schedule chord note if it starts on this beat
            if (currentChordStep && Math.abs(this.currentBeat - beatInProgression) < 0.01) {
                const chordFreqs = this.getChordFrequencies(currentChordStep.chord.name);
                chordFreqs.forEach(freq => {
                    this.scheduleNote(freq, this.nextNoteTime, currentChordStep.durationBeats * secondsPerBeat, false);
                });
            }

            // Schedule melody notes that start on this beat
            this.melody.forEach(note => {
                 if (Math.abs(note.startBeat - this.currentBeat) < 0.01) {
                    const freq = NOTE_FREQUENCIES[note.pitch];
                    if (freq) {
                        this.scheduleNote(freq, this.nextNoteTime, note.durationBeats * secondsPerBeat, true);
                    }
                }
            });

            // Advance scheduler by one beat
            this.nextNoteTime += secondsPerBeat;
            this.currentBeat = (this.currentBeat + 1) % this.totalProgressionBeats;
        }

        this.schedulerTimer = window.setTimeout(this.scheduler.bind(this), this.lookahead);
    }

    play(songData: SongData) {
        this.initialize();
        if (!this.audioContext) return;

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        if (this.isPlaying) {
            this.stop();
        }

        this.isPlaying = true;

        // Update song data
        this.bpm = songData.bpm;
        this.progression = songData.progression;
        this.melody = songData.melody;
        this.totalProgressionBeats = songData.progression.reduce((sum, step) => sum + step.durationBeats, 0);
        if (this.totalProgressionBeats === 0) {
            this.totalProgressionBeats = 16; // Default to 4 bars if no progression
        }
        
        this.currentBeat = 0;
        this.nextNoteTime = this.audioContext.currentTime;
        this.scheduler();
    }

    stop() {
        this.isPlaying = false;
        if (this.schedulerTimer !== null) {
            window.clearTimeout(this.schedulerTimer);
            this.schedulerTimer = null;
        }
    }
}

export const audioService = new AudioService();