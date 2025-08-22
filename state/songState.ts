import React, { createContext } from 'react';
import type { SongData, SongSection, SectionType, ContentPart, MelodyNote, ProgressionStep } from '../types';
import { base64ToBlob, base64ToBytes } from '../utils/base64';

export type SongAction =
    | { type: 'SET_SONG_DATA'; payload: SongData }
    | { type: 'UPDATE_TITLE'; payload: string }
    | { type: 'ADD_CONTENT_PART'; payload: { sectionId: string; part: ContentPart } }
    | { type: 'UPDATE_CONTENT_PART'; payload: { sectionId: string; partId: string; newText: string } }
    | { type: 'DELETE_CONTENT_PART'; payload: { sectionId: string; partId: string } }
    | { type: 'ADD_SECTION'; payload: SongSection }
    | { type: 'DELETE_SECTION'; payload: string }
    | { type: 'UPDATE_SECTION'; payload: { sectionId: string; updates: { type: SectionType; label: string } } }
    | { type: 'REORDER_SECTIONS'; payload: { startIndex: number; endIndex: number } }
    | { type: 'APPLY_STRUCTURE'; payload: SongSection[] }
    | { type: 'UPDATE_PROGRESSION'; payload: ProgressionStep[] }
    | { type: 'UPDATE_PROGRESSION_STEP'; payload: { id: string; updates: { durationBeats: number } } }
    | { type: 'UPDATE_KEY'; payload: string }
    | { type: 'UPDATE_BPM'; payload: number }
    | { type: 'UPDATE_TIME_SIGNATURE'; payload: string }
    | { type: 'UPDATE_MELODY'; payload: MelodyNote[] }
    | { type: 'UPDATE_AUDIO'; payload: { sectionId: string; audio: { base64: string; mimeType: string; blobUrl: string } } }
    | { type: 'DELETE_AUDIO'; payload: string };

export const songReducer = (state: SongData, action: SongAction): SongData => {
    switch (action.type) {
        case 'SET_SONG_DATA':
            return action.payload;
        case 'UPDATE_TITLE':
            return { ...state, title: action.payload };
        case 'ADD_CONTENT_PART':
            return {
                ...state,
                structure: state.structure.map(s =>
                    s.id === action.payload.sectionId
                        ? { ...s, content: [...s.content, action.payload.part] }
                        : s
                ),
            };
        case 'UPDATE_CONTENT_PART':
            return {
                ...state,
                structure: state.structure.map(s =>
                    s.id === action.payload.sectionId
                        ? { ...s, content: s.content.map(p => p.id === action.payload.partId ? { ...p, text: action.payload.newText } : p) }
                        : s
                ),
            };
        case 'DELETE_CONTENT_PART':
            return {
                ...state,
                structure: state.structure.map(s =>
                    s.id === action.payload.sectionId
                        ? { ...s, content: s.content.filter(p => p.id !== action.payload.partId) }
                        : s
                ),
            };
        case 'ADD_SECTION':
            return { ...state, structure: [...state.structure, action.payload] };
        case 'DELETE_SECTION': {
            const newStructure = state.structure.filter(s => s.id !== action.payload);
            return { ...state, structure: newStructure };
        }
        case 'UPDATE_SECTION':
            return {
                ...state,
                structure: state.structure.map(s =>
                    s.id === action.payload.sectionId
                        ? { ...s, type: action.payload.updates.type, label: action.payload.updates.label }
                        : s
                ),
            };
        case 'REORDER_SECTIONS': {
            const result = Array.from(state.structure);
            const [removed] = result.splice(action.payload.startIndex, 1);
            result.splice(action.payload.endIndex, 0, removed);
            return { ...state, structure: result };
        }
        case 'APPLY_STRUCTURE':
            return { ...state, structure: action.payload };
        case 'UPDATE_PROGRESSION':
            return { ...state, progression: action.payload };
        case 'UPDATE_PROGRESSION_STEP':
            return {
                ...state,
                progression: state.progression.map(step => step.id === action.payload.id ? { ...step, ...action.payload.updates } : step)
            };
        case 'UPDATE_KEY':
            return { ...state, key: action.payload, progression: [] };
        case 'UPDATE_BPM':
            return { ...state, bpm: action.payload };
        case 'UPDATE_TIME_SIGNATURE':
            return { ...state, timeSignature: action.payload };
        case 'UPDATE_MELODY':
            return { ...state, melody: action.payload };
        case 'UPDATE_AUDIO':
            return {
                ...state,
                structure: state.structure.map(s =>
                    s.id === action.payload.sectionId ? { ...s, audio: action.payload.audio } : s
                ),
            };
        case 'DELETE_AUDIO': {
            return {
                ...state,
                structure: state.structure.map(s => {
                    if (s.id === action.payload) {
                        const { audio, ...rest } = s as any;
                        if (audio?.blobUrl) URL.revokeObjectURL(audio.blobUrl);
                        return rest as SongSection;
                    }
                    return s;
                }),
            };
        }
        default:
            return state;
    }
};

export const SongDataContext = createContext<SongData | null>(null);
export const ActionsContext = createContext<any | null>(null);

const initialLyrics = `(Verse 1)
White walls and carbon paper lines
A city grid of my own design
Each angle true, each surface clean
A minimalist and flawless scene
I live my life in black and white
Beneath a single, perfect light

(Chorus)
But there's an emerald in the grey
A jungle growing in the entryway
A flash of coral, sharp and bright
A tropical fever in the night
You are the vine that breaks the stone
The hothouse heart I can't disown
Tearing all my blueprints apart
A wild design upon my heart
`;

const parseLyricsToStructure = (lyrics: string): SongSection[] => {
    const sections: SongSection[] = [];
    const regex = /\(([^)]+)\)\s*([\sS]*?)(?=\s*\([^)]+\)|$)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(lyrics)) !== null) {
        const fullTitle = match[1].trim();
        const content = match[2].trim();
        const typeMatch = fullTitle.match(/^(Verse|Chorus|Bridge|Intro|Outro|Pre-Chorus|Solo)/i);
        const type = (typeMatch ? typeMatch[0].charAt(0).toUpperCase() + typeMatch[0].slice(1).toLowerCase() : 'Verse') as SectionType;

        sections.push({
            id: `section-${Date.now()}-${sections.length}`,
            type: type,
            label: fullTitle,
            content: [{
                id: `part-${Date.now()}-${sections.length}`,
                author: 'user',
                text: content,
            }],
        });
    }
    if (sections.length === 0 && lyrics.trim()) {
        sections.push({
            id: `section-${Date.now()}-0`,
            type: 'Verse',
            label: 'Verse 1',
            content: [{
                id: `part-${Date.now()}-0`,
                author: 'user',
                text: lyrics.trim(),
            }],
        });
    }
    return sections;
};

const getDefaultSongData = (): SongData => ({
    title: 'A Wild Design',
    structure: parseLyricsToStructure(initialLyrics),
    progression: [],
    key: 'C',
    bpm: 120,
    timeSignature: '4/4',
    melody: [],
});

const processLoadedSongData = (data: Partial<SongData>): SongData => {
    const hydratedStructure = data.structure?.map(section => {
        if (section.audio?.base64 && section.audio?.mimeType) {
            const blob = base64ToBlob(section.audio.base64, section.audio.mimeType);
            return {
                ...section,
                audio: {
                    ...section.audio,
                    blobUrl: URL.createObjectURL(blob),
                }
            } as SongSection;
        }
        return section;
    }) || [];

    return {
        ...getDefaultSongData(),
        ...data,
        structure: hydratedStructure,
    } as SongData;
};

export const getInitialSongData = (): SongData => {
    const hash = window.location.hash;
    if (hash.startsWith('#data=')) {
        try {
            const base64Data = hash.substring(6);
            const jsonData = new TextDecoder().decode(base64ToBytes(base64Data));
            const parsedData = JSON.parse(jsonData) as Partial<SongData>;
            return processLoadedSongData(parsedData);
        } catch (e) {
            console.error("Failed to parse shared data, falling back.", e);
        }
    }

    const savedData = localStorage.getItem('sonora-ai-song');
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData) as Partial<SongData>;
            return processLoadedSongData(parsedData);
        } catch (e) {
            console.error("Failed to parse saved data, falling back.", e);
        }
    }

    return getDefaultSongData();
};