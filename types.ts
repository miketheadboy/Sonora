
export interface GenerateIdeaParams {
    topic: string;
}

export interface GenerateBlendedIdeaParams {
    artists: string;
}

export interface GenerateTitleParams {
    theme: string;
}

export interface GenerateEmotionalPaletteParams {
    emotions: string[];
}

export interface GenerateObjectObservationParams {
    object: string;
}

export interface GenerateRhymesParams {
    word: string;
}

export interface GenerateSynonymsParams {
    word: string;
}

export interface GenerateWordAssociationsParams {
    word: string;
}

export interface GenerateChordsParams {
    key: string;
}

export type ChordFunction = 'tonic' | 'subdominant' | 'dominant' | 'predominant' | 'leading-tone' | 'other' | 'secondary-dominant';

export interface Chord {
    name: string;
    function: ChordFunction;
}

export interface ProgressionStep {
    id: string;
    chord: Chord;
    durationBeats: number;
}

export interface ChordProgression {
    part: string;
    progression: string;
    chords: string;
    description: string;
}

export type SectionType = 'Verse' | 'Chorus' | 'Bridge' | 'Intro' | 'Outro' | 'Pre-Chorus' | 'Solo';

export type Author = 'user' | 'ai';

export interface ContentPart {
    id: string;
    author: Author;
    text: string;
}

export interface SongSection {
    id:string;
    type: SectionType;
    label: string;
    content: ContentPart[];
    audio?: {
        blobUrl?: string; // Optional because it's only available at runtime
        base64: string;
        mimeType: string;
    };
}

export type AnalysisType = 'song_doctor' | 'rhyme_analyzer' | 'repetition_analyzer';

export interface AnalyzeSongParams {
    structure: SongSection[];
    progression: ProgressionStep[];
    analysisType: AnalysisType;
}

export interface AudioAnalysisResult {
    analysis: {
        mood: string;
        tempo: string;
        contour: string;
    };
    lyricSuggestion: string;
    chordSuggestion: string;
}

export interface MelodyNote {
    pitch: string; // e.g., 'C5'
    startBeat: number; // e.g., 0, 0.5, 1
    durationBeats: number; // e.g., 0.5, 1
}

export interface SongData {
    title: string;
    structure: SongSection[];
    progression: ProgressionStep[];
    key: string;
    bpm: number;
    timeSignature: string; // "4/4", "3/4"
    melody: MelodyNote[];
}


export type InspirationSource = 'poet' | 'artist' | 'philosopher';

export interface GetInspirationalSparkParams {
    sourceType: InspirationSource;
}

export type LyricModificationType = 'refine' | 'replace' | 'suggest_alternatives' | 'random_line';

export interface ModifyLyricParams {
    line: string;
    context: string;
    modificationType: LyricModificationType;
}

export type RhythmPattern = number[];
