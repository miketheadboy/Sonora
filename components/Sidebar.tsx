
import React, { memo } from 'react';
import type { GenerateIdeaParams, GenerateBlendedIdeaParams, GenerateRhymesParams, GenerateSynonymsParams, GenerateWordAssociationsParams, GetInspirationalSparkParams, GenerateTitleParams, GenerateEmotionalPaletteParams, GenerateObjectObservationParams, AnalysisType } from '../types';
import { Accordion } from './Accordion';
import { SparkAndStructurePanel } from './panels/SparkAndStructurePanel';
import { LyricCraftPanel } from './panels/LyricCraftPanel';
import { MusicAndHarmonyPanel } from './panels/MusicAndHarmonyPanel';
import { ReviewAndRefinePanel } from './panels/ReviewAndRefinePanel';

interface SidebarProps {
    isPlaying: boolean;
    playheadPosition: number;
    // Phase 1
    onGenerateIdea: (params: GenerateIdeaParams) => void;
    onGenerateBlendedIdea: (params: GenerateBlendedIdeaParams) => void;
    onGenerateTitles: (params: GenerateTitleParams) => void;
    onGenerateEmotionalPalette: (params: GenerateEmotionalPaletteParams) => void;
    onGenerateObjectObservation: (params: GenerateObjectObservationParams) => void;
    onGeneratePrompt: () => void;
    onGenerateInspirationalSpark: (params: GetInspirationalSparkParams) => void;
    creativePrompt: string | null;
    inspirationalSpark: string | null;
    structureSuggestions: string[];
    onSuggestStructures: () => void;
    onApplyStructure: (structure: string) => void;
    // Phase 2
    onFindRhymes: (params: GenerateRhymesParams) => void;
    onFindSynonyms: (params: GenerateSynonymsParams) => void;
    onGenerateWordAssociations: (params: GenerateWordAssociationsParams) => void;
    rhymes: string[];
    synonyms: string[];
    wordAssociations: string[];
    // Phase 3
    onPlay: () => void;
    onStop: () => void;
    chordLibrary: any[];
    // Phase 4
    onAnalyzeSong: (analysisType: AnalysisType) => void;
}

const SidebarComponent: React.FC<SidebarProps> = (props) => {
    return (
        <div className="bg-cream-100/50 h-full flex flex-col overflow-y-auto">
            <Accordion allowMultipleOpen={false} defaultOpenIndex={0}>
                <Accordion.Section title="Phase 1: Spark & Structure">
                    <SparkAndStructurePanel
                        onGenerateIdea={props.onGenerateIdea}
                        onGenerateBlendedIdea={props.onGenerateBlendedIdea}
                        onGenerateTitles={props.onGenerateTitles}
                        onGenerateEmotionalPalette={props.onGenerateEmotionalPalette}
                        onGenerateObjectObservation={props.onGenerateObjectObservation}
                        onGeneratePrompt={props.onGeneratePrompt}
                        onGenerateInspirationalSpark={props.onGenerateInspirationalSpark}
                        creativePrompt={props.creativePrompt}
                        inspirationalSpark={props.inspirationalSpark}
                        structureSuggestions={props.structureSuggestions}
                        onSuggestStructures={props.onSuggestStructures}
                        onApplyStructure={props.onApplyStructure}
                    />
                </Accordion.Section>
                <Accordion.Section title="Phase 2: Lyric Craft">
                    <LyricCraftPanel 
                        onFindRhymes={props.onFindRhymes}
                        onFindSynonyms={props.onFindSynonyms}
                        onGenerateWordAssociations={props.onGenerateWordAssociations}
                        rhymes={props.rhymes}
                        synonyms={props.synonyms}
                        wordAssociations={props.wordAssociations}
                    />
                </Accordion.Section>
                <Accordion.Section title="Phase 3: Music & Harmony">
                    <MusicAndHarmonyPanel
                        isPlaying={props.isPlaying}
                        playheadPosition={props.playheadPosition}
                        chordLibrary={props.chordLibrary}
                        onPlay={props.onPlay}
                        onStop={props.onStop}
                    />
                </Accordion.Section>
                <Accordion.Section title="Phase 4: Review & Refine">
                    <ReviewAndRefinePanel 
                        onAnalyzeSong={props.onAnalyzeSong}
                    />
                </Accordion.Section>
            </Accordion>
        </div>
    );
};

export const Sidebar = memo(SidebarComponent);
