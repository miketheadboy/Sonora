export interface GenerateIdeaParams {
    topic: string;
}

export interface GenerateBlendedIdeaParams {
    artists: string;
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

export interface ChordProgression {
    part: string;
    progression: string;
    chords: string;
    description: string;
}

export interface GenerateRhythmParams {
    line: string;
}

export interface RhythmSuggestion {
    meter: string;
    name: string;
    pattern: string;
    formattedLine: string;
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
    id: string;
    type: SectionType;
    label: string;
    content: ContentPart[];
    audio?: {
        blobUrl?: string; // Optional because it's only available at runtime
        base64: string;
        mimeType: string;
    };
}

export interface AnalyzeSongParams {
    structure: SongSection[];
    progression: Chord[];
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

export interface SongData {
    structure: SongSection[];
    progression: Chord[];
    key: string;
}

export type InspirationSource = 'poet' | 'artist' | 'philosopher';

export interface GetInspirationalSparkParams {
    sourceType: InspirationSource;
}