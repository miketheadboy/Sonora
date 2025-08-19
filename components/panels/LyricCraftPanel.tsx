
import React, { useState } from 'react';
import type { GenerateRhymesParams, GenerateSynonymsParams, GenerateWordAssociationsParams } from '../../types';
import { ResultList } from '../shared/ResultList';
import { ToolInputForm } from '../shared/ToolInputForm';

interface LyricCraftPanelProps {
    onFindRhymes: (params: GenerateRhymesParams) => void;
    onFindSynonyms: (params: GenerateSynonymsParams) => void;
    onGenerateWordAssociations: (params: GenerateWordAssociationsParams) => void;
    rhymes: string[];
    synonyms: string[];
    wordAssociations: string[];
}

export const LyricCraftPanel: React.FC<LyricCraftPanelProps> = (props) => {
    const [rhymeWord, setRhymeWord] = useState('');
    const [synonymWord, setSynonymWord] =useState('');
    const [associationWord, setAssociationWord] = useState('');

    return (
        <div className="space-y-4">
            <div>
                <ToolInputForm
                    value={rhymeWord}
                    onChange={setRhymeWord}
                    onSubmit={() => props.onFindRhymes({ word: rhymeWord })}
                    placeholder="e.g., rain"
                    buttonText="Find Rhymes"
                />
                <ResultList items={props.rhymes} />
            </div>
             <div>
                <ToolInputForm
                    value={synonymWord}
                    onChange={setSynonymWord}
                    onSubmit={() => props.onFindSynonyms({ word: synonymWord })}
                    placeholder="e.g., beautiful"
                    buttonText="Find Synonyms"
                />
                <ResultList items={props.synonyms} />
            </div>
            <div>
                <ToolInputForm
                    value={associationWord}
                    onChange={setAssociationWord}
                    onSubmit={() => props.onGenerateWordAssociations({ word: associationWord })}
                    placeholder="e.g., midnight"
                    buttonText="Find Associations"
                />
                <ResultList items={props.wordAssociations} />
            </div>
        </div>
    );
};
