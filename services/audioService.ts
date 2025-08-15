// A simple service to play chords using the Web Audio API

const NOTE_FREQUENCIES: { [key: string]: number } = {
    'C': 261.63, 'C#': 277.18, 'Db': 277.18, 'D': 293.66, 'D#': 311.13, 'Eb': 311.13,
    'E': 329.63, 'F': 349.23, 'F#': 369.99, 'Gb': 369.99, 'G': 392.00, 'G#': 415.30, 'Ab': 415.30,
    'A': 440.00, 'A#': 466.16, 'Bb': 466.16, 'B': 493.88,
};

const CHORD_STRUCTURES: { [key: string]: number[] } = {
    'maj': [0, 4, 7],
    'min': [0, 3, 7],
    'dim': [0, 3, 6],
    'aug': [0, 4, 8],
    '7': [0, 4, 7, 10],
    'maj7': [0, 4, 7, 11],
    'min7': [0, 3, 7, 10],
};

class AudioService {
    private audioContext: AudioContext | null = null;
    private isInitialized = false;

    private initialize() {
        if (!this.isInitialized && typeof window !== 'undefined') {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.isInitialized = true;
        }
    }

    private getFrequency(note: string, octave: number = 4): number | null {
        const baseNote = note.replace(/[0-9]/, '');
        const baseFrequency = NOTE_FREQUENCIES[baseNote];
        if (!baseFrequency) return null;
        return baseFrequency * Math.pow(2, octave - 4);
    }

    private getNoteName(frequency: number): string {
        let closestNote = '';
        let minDifference = Infinity;

        for (const note in NOTE_FREQUENCIES) {
            const diff = Math.abs(frequency - NOTE_FREQUENCIES[note]);
            if (diff < minDifference) {
                minDifference = diff;
                closestNote = note;
            }
        }
        return closestNote;
    }

    private parseChord(chordName: string): number[] {
        let rootNoteName = chordName.charAt(0).toUpperCase();
        let quality = 'maj';
        let remaining = chordName.substring(1);

        if (remaining.startsWith('#') || remaining.startsWith('b')) {
            rootNoteName += remaining.charAt(0);
            remaining = remaining.substring(1);
        }
        
        if (remaining.startsWith('m')) {
            quality = 'min';
            remaining = remaining.substring(1);
        } else if (remaining.startsWith('dim')) {
            quality = 'dim';
            remaining = remaining.substring(3);
        } else if (remaining.startsWith('aug')) {
            quality = 'aug';
            remaining = remaining.substring(3);
        }
        
        if (remaining === '7') {
            quality = quality === 'min' ? 'min7' : '7';
        } else if (remaining.toLowerCase() === 'maj7') {
            quality = 'maj7';
        }
        
        const rootFreq = this.getFrequency(rootNoteName);
        const structure = CHORD_STRUCTURES[quality] || CHORD_STRUCTURES['maj'];
        
        if (!rootFreq) return [];

        return structure.map(interval => rootFreq * Math.pow(2, interval / 12));
    }


    playProgression(chords: string[]) {
        this.initialize();
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const chordDuration = 0.8;
        const releaseTime = 0.4;

        chords.forEach((chordName, i) => {
            const frequencies = this.parseChord(chordName);
            if (frequencies.length === 0) return;

            const startTime = now + i * chordDuration;

            frequencies.forEach(freq => {
                const osc = this.audioContext!.createOscillator();
                const gainNode = this.audioContext!.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, startTime);
                
                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
                gainNode.gain.linearRampToValueAtTime(0, startTime + chordDuration - releaseTime);

                osc.connect(gainNode);
                gainNode.connect(this.audioContext!.destination);

                osc.start(startTime);
                osc.stop(startTime + chordDuration);
            });
        });
    }

    stop() {
        if (this.audioContext && this.audioContext.state === 'running') {
            this.audioContext.close().then(() => {
                this.isInitialized = false;
                this.audioContext = null;
            });
        }
    }
}

export const audioService = new AudioService();
