import React from 'react';
import type { SongData, Chord, MelodyNote, ProgressionStep, GenerateIdeaParams, GenerateBlendedIdeaParams, GenerateRhymesParams, GenerateSynonymsParams, GenerateWordAssociationsParams, GetInspirationalSparkParams, GenerateTitleParams, GenerateEmotionalPaletteParams, GenerateObjectObservationParams, AnalysisType } from '../types';
import { Accordion } from './Accordion';
import { MusicPanel } from './panels/MusicPanel';
import { AIAssistPanel } from './panels/AIAssistPanel';
import { InspirationPanel } from './panels/InspirationPanel';
import { AnalysisPanel } from './panels/AnalysisPanel';

interface SidebarProps {
    songData: SongData;
    isPlaying: boolean;
    playheadPosition: number;
    // AI Assist
    onFindRhymes: (params: GenerateRhymesParams) => void;
    onFindSynonyms: (params: GenerateSynonymsParams) => void;
    onGenerateWordAssociations: (params: GenerateWordAssociationsParams) => void;
    rhymes: string[];
    synonyms: string[];
    wordAssociations: string[];
    // Music
    chordLibrary: Chord[];
    onUpdateProgression: (progression: ProgressionStep[]) => void;
    onUpdateProgressionStep: (id: string, updates: { durationBeats: number }) => void;
    onGenerateLibrary: (key: string) => void;
    onPlay: () => void;
    onStop: () => void;
    onUpdateBpm: (bpm: number) => void;
    onUpdateTimeSignature: (ts: string) => void;
    onUpdateMelody: (melody: MelodyNote[]) => void;
    // Inspiration
    onGenerateIdea: (params: GenerateIdeaParams) => void;
    onGenerateBlendedIdea: (params: GenerateBlendedIdeaParams) => void;
    onGenerateTitles: (params: GenerateTitleParams) => void;
    onGenerateEmotionalPalette: (params: GenerateEmotionalPaletteParams) => void;
    onGenerateObjectObservation: (params: GenerateObjectObservationParams) => void;
    onGeneratePrompt: () => void;
    onGenerateInspirationalSpark: (params: GetInspirationalSparkParams) => void;
    creativePrompt: string | null;
    inspirationalSpark: string | null;
    // Analysis
    onAnalyzeSong: (analysisType: AnalysisType) => void;
    onSuggestStructures: () => void;
    structureSuggestions: string[];
    onApplyStructure: (structure: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
    return (
        <div className="bg-cream-100/50 h-full flex flex-col overflow-y-auto">
            <Accordion allowMultipleOpen={false} defaultOpenIndex={0}>
                <Accordion.Section title="Music">
                    <MusicPanel
                        songData={props.songData}
                        isPlaying={props.isPlaying}
                        playheadPosition={props.playheadPosition}
                        chordLibrary={props.chordLibrary}
                        onUpdateProgression={props.onUpdateProgression}
                        onUpdateProgressionStep={props.onUpdateProgressionStep}
                        onGenerateLibrary={props.onGenerateLibrary}
                        onPlay={props.onPlay}
                        onStop={props.onStop}
                        onUpdateBpm={props.onUpdateBpm}
                        onUpdateTimeSignature={props.onUpdateTimeSignature}
                        onUpdateMelody={props.onUpdateMelody}
                    />
                </Accordion.Section>
                <Accordion.Section title="AI Assist">
                    <AIAssistPanel 
                        onFindRhymes={props.onFindRhymes}
                        onFindSynonyms={props.onFindSynonyms}
                        onGenerateWordAssociations={props.onGenerateWordAssociations}
                        rhymes={props.rhymes}
                        synonyms={props.synonyms}
                        wordAssociations={props.wordAssociations}
                    />
                </Accordion.Section>
                <Accordion.Section title="Inspiration">
                    <InspirationPanel
                        onGenerateIdea={props.onGenerateIdea}
                        onGenerateBlendedIdea={props.onGenerateBlendedIdea}
                        onGenerateTitles={props.onGenerateTitles}
                        onGenerateEmotionalPalette={props.onGenerateEmotionalPalette}
                        onGenerateObjectObservation={props.onGenerateObjectObservation}
                        onGeneratePrompt={props.onGeneratePrompt}
                        onGenerateInspirationalSpark={props.onGenerateInspirationalSpark}
                        creativePrompt={props.creativePrompt}
                        inspirationalSpark={props.inspirationalSpark}
                    />
                </Accordion.Section>
                <Accordion.Section title="Analysis">
                    <AnalysisPanel 
                        songData={props.songData}
                        onAnalyzeSong={props.onAnalyzeSong}
                        onSuggestStructures={props.onSuggestStructures}
                        structureSuggestions={props.structureSuggestions}
                        onApplyStructure={props.onApplyStructure}
                    />
                </Accordion.Section>
            </Accordion>
        </div>
    );
};
