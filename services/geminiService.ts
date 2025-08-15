import { GoogleGenAI, Type } from "@google/genai";
import type { GenerateIdeaParams, GenerateChordsParams, GenerateRhymesParams, GenerateSynonymsParams, GenerateWordAssociationsParams, RhythmSuggestion, GenerateRhythmParams, GenerateBlendedIdeaParams, Chord, AnalyzeSongParams, SongSection, AudioAnalysisResult, GetInspirationalSparkParams } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

const arrayOfStringSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.STRING
    }
};

const generateContentWithSchema = async (prompt: string, schema: any): Promise<any> => {
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0.7,
        },
    });
    const jsonText = response.text.trim();
    try {
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse JSON response:", jsonText);
        throw new Error("Received an invalid JSON response from the AI.");
    }
};

const generateTextContent = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            temperature: 0.8,
        }
    });
    return response.text;
};

const formatSongForAnalysis = (structure: SongSection[], progression: Chord[]): string => {
    let songString = '';

    structure.forEach(section => {
        songString += `(${section.label})\n`;
        section.content.forEach(part => {
            // We only need the text, not the author for the analysis prompt
            songString += `${part.text}\n`;
        });
        songString += '\n';
    });

    if (progression.length > 0) {
        songString += `Chord Progression:\n${progression.map(c => c.name).join(' - ')}\n`;
    }

    return songString.trim();
};

export const geminiService = {
    cowriteSection: async (prompt: string, existingLyrics: string): Promise<string> => {
        const fullPrompt = `You are an acclaimed lyricist, known for your poetic and evocative writing. You are co-writing a song.
The user wants you to contribute to their lyrics.
Your task is to write 2-4 lines that are thematically consistent but also introduce fresh imagery, metaphor, or a unique perspective.
Strive for lyrical depth and originality. Avoid clichés and predictable phrasing.
DO NOT repeat any of the existing lyrics.

**Existing Lyrics Context:**
---
${existingLyrics}
---

**User's Prompt:** "${prompt}"

Your poetic contribution:`;
        return generateTextContent(fullPrompt);
    },
    
    generateSongIdea: async ({ topic }: GenerateIdeaParams): Promise<string> => {
        const prompt = `Generate a creative song idea based on the theme: "${topic}". 
        Provide a catchy title, a short one-sentence concept, and the first two lines for a verse.
        Format your response as:
        Title: [Your Title]
        Concept: [Your Concept]
        Verse 1:
        [Line 1]
        [Line 2]`;
        return generateTextContent(prompt);
    },

    generateBlendedIdea: async ({ artists }: GenerateBlendedIdeaParams): Promise<string> => {
        const prompt = `You are an expert musicologist and creative songwriter. A user wants a song idea that creatively blends the styles of the following artists: "${artists}".

First, provide a brief "Style Analysis" of how these artists could be combined. Mention lyrical themes, musical moods, and harmonic ideas.

Then, based on your analysis, generate a completely new and original song concept. Provide:
1. A catchy and evocative **Title**.
2. A one-sentence **Concept** that captures the essence of the song.
3. A **Verse 1** and a **Chorus** written in the synthesized style.

Format your entire response as a single block of text, using these exact labels:
Style Analysis: [Your analysis here]

Title: [Your Title]
Concept: [Your Concept]

(Verse 1)
[Line 1]
[Line 2]
[Line 3]
[Line 4]

(Chorus)
[Line 1]
[Line 2]
[Line 3]
[Line 4]`;
        return generateTextContent(prompt);
    },

    analyzeSong: async ({ structure, progression }: AnalyzeSongParams): Promise<string> => {
        const songContent = formatSongForAnalysis(structure, progression);
        const prompt = `You are an expert song doctor and music critic. A songwriter has asked for feedback on their work-in-progress.
Analyze the provided song based on its lyrics, structure, and chord progression. Provide constructive, actionable feedback.

**The Song:**
---
${songContent}
---

**Your Analysis Task:**
Please provide a structured analysis covering the following points. Keep your feedback encouraging but honest.

**1. Overall Impression & Emotional Arc:**
- What is the main feeling or story of the song?
- Does the emotional journey feel compelling from start to finish?

**2. Lyrical Analysis:**
- **Theme:** Is the central theme clear and consistent?
- **Imagery & Metaphor:** Are the images strong? Are there any standout lines or clichés to avoid?
- **Rhyme Scheme:** Is the rhyme scheme effective? Is there a good balance between predictability and surprise?

**3. Structural Analysis:**
- Is the song structure (e.g., Verse-Chorus) effective for the song's message?
- Does the song build dynamically? Does each section serve its purpose?

**4. Harmonic Analysis (if chords are provided):**
- Does the chord progression support the lyrical mood?
- Are there opportunities to add more harmonic interest?

**5. Actionable Suggestions:**
- Provide 2-3 specific, concrete suggestions for how the songwriter could improve this piece. For example, "Consider changing the rhyme in the second verse to be less direct," or "The bridge could use a new chord to create more tension before the final chorus."

Format your entire response as a single block of text. Use markdown-style bolding for headers (e.g., **Lyrical Analysis**).`;
        return generateTextContent(prompt);
    },

    analyzeAudioPart: async (audioBase64: string, mimeType: string): Promise<AudioAnalysisResult> => {
        const prompt = `You are a helpful and creative music expert. A songwriter has recorded a short audio clip, likely a sung melody or a simple instrumental idea.

Your task is to analyze this audio and provide creative suggestions to help them develop the idea.

1.  **Analyze the audio:** Listen to the clip and describe its core musical characteristics.
2.  **Suggest lyrics:** Write a 4-line verse that matches the mood, feeling, and implied rhythm of the audio.
3.  **Suggest chords:** Propose a simple 4-chord progression (e.g., "C - G - Am - F") that would musically support the melody you heard.

Return a JSON object with your analysis and suggestions.`;

        const audioAnalysisSchema = {
            type: Type.OBJECT,
            properties: {
                analysis: {
                    type: Type.OBJECT,
                    properties: {
                        mood: { type: Type.STRING, description: "The overall mood of the melody (e.g., 'melancholic', 'upbeat', 'haunting')." },
                        tempo: { type: Type.STRING, description: "The estimated tempo (e.g., 'slow ballad', 'mid-tempo groove', 'fast and energetic')." },
                        contour: { type: Type.STRING, description: "A brief description of the melodic shape (e.g., 'A simple, ascending line that resolves downwards', 'A repeating rhythmic phrase on a single note')." }
                    },
                     required: ["mood", "tempo", "contour"],
                },
                lyricSuggestion: {
                    type: Type.STRING,
                    description: "A 4-line verse that fits the mood and rhythm of the audio. Use \\n for newlines."
                },
                chordSuggestion: {
                    type: Type.STRING,
                    description: "A 4-chord progression (e.g., 'C - G - Am - F') that could harmonize the melody."
                }
            },
            required: ["analysis", "lyricSuggestion", "chordSuggestion"],
        };
        
        const audioPart = {
            inlineData: {
                mimeType,
                data: audioBase64,
            },
        };

        const response = await ai.models.generateContent({
            model,
            contents: { parts: [ {text: prompt}, audioPart ] },
            config: {
                responseMimeType: "application/json",
                responseSchema: audioAnalysisSchema,
            },
        });
        const jsonText = response.text.trim();
        try {
            return JSON.parse(jsonText);
        } catch (e) {
            console.error("Failed to parse JSON response:", jsonText);
            throw new Error("Received an invalid JSON response from the AI.");
        }
    },

    findRhymes: async ({ word }: GenerateRhymesParams): Promise<string[]> => {
        const prompt = `You are a master poet. Generate a list of 15 sophisticated and interesting rhymes for the word "${word}".
Prioritize less common rhymes like:
- Slant rhymes (e.g., shape/keep)
- Near rhymes (e.g., orange/storage)
- Multisyllabic rhymes (e.g., mysterious/victorious)

AVOID overly simple, common, and cliché perfect rhymes (for "fire", avoid "desire", "higher").
The goal is to provide creative, unexpected options.`;
        return generateContentWithSchema(prompt, arrayOfStringSchema);
    },

    findSynonyms: async ({ word }: GenerateSynonymsParams): Promise<string[]> => {
        const prompt = `Find 10 interesting synonyms for the word "${word}". Provide a mix of common and more literary options.`;
        return generateContentWithSchema(prompt, arrayOfStringSchema);
    },

    getChordLibrary: async ({ key }: GenerateChordsParams): Promise<Chord[]> => {
        const prompt = `You are an expert music theorist. For the key of ${key} Major, provide a library of common chords.
        
        Include the following:
        1. All 7 diatonic chords (triads or sevenths are fine, e.g., C, Dm, G7).
        2. At least 3 common non-diatonic or borrowed chords (e.g., secondary dominants like V/V, or chords from the parallel minor like iv or bVI).

        For each chord, identify its musical function. Use one of the following function names: 'tonic', 'subdominant', 'dominant', 'predominant', 'leading-tone', 'secondary-dominant', 'other'.
        
        Return an array of objects, with each object having a 'name' and a 'function'.`;

        const schema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the chord (e.g., 'Cmaj7', 'G7', 'Fm')." },
                    function: { 
                        type: Type.STRING,
                        enum: ['tonic', 'subdominant', 'dominant', 'predominant', 'leading-tone', 'secondary-dominant', 'other'],
                        description: "The musical function of the chord in the key of " + key,
                    },
                },
                required: ["name", "function"],
            }
        };
        
        return generateContentWithSchema(prompt, schema);
    },
    
    suggestSongStructures: async (): Promise<string[]> => {
        const prompt = `Generate a list of 5 common and effective song structures. 
        Use the labels: 'Intro', 'Verse', 'Pre-Chorus', 'Chorus', 'Bridge', 'Solo', 'Outro'.
        Return the list as a JSON array of strings. Each string should be a comma-separated list of the section labels in order.
        Example: "Verse,Chorus,Verse,Chorus,Bridge,Chorus"`;
        return generateContentWithSchema(prompt, arrayOfStringSchema);
    },

    generateCreativePrompt: async (): Promise<string> => {
        const prompt = `Generate a unique and inspiring songwriting prompt to help break writer's block. 
        It could be a "what if" scenario, a question, an interesting image to describe, a character to write about, or a short story starter. 
        Keep it concise and open-ended. For example: "Write a song from the perspective of a forgotten photograph in an old antique shop." or "What if you could hear the thoughts of inanimate objects for one day?".`;
        return generateTextContent(prompt);
    },

    getInspirationalSpark: async ({ sourceType }: GetInspirationalSparkParams): Promise<string> => {
        let prompt = '';
        switch(sourceType) {
            case 'poet':
                prompt = `Generate a single, evocative, and original line of poetry (6-12 words) in the style of a classic poet like Dickinson or Rilke. It should be rich in imagery and metaphor, suitable for sparking a song idea. Do not include quotation marks.`;
                break;
            case 'philosopher':
                prompt = `Generate a single, short, thought-provoking philosophical question or aphorism (under 15 words) in the style of a stoic or existentialist thinker. It should challenge a common assumption. Do not include quotation marks.`;
                break;
            case 'artist':
                prompt = `Generate a single, vivid sentence describing a scene as if it were a painting (10-20 words). Focus on color, light, and mood, in the style of an impressionist or romantic painter. Do not include quotation marks.`;
                break;
        }
        return generateTextContent(prompt);
    },

    generateWordAssociations: async ({ word }: GenerateWordAssociationsParams): Promise<string[]> => {
        const prompt = `Generate a list of 10 creative and evocative words associated with the word "${word}". Think beyond direct synonyms. Include concepts, emotions, objects, and actions that are thematically or metaphorically related.`;
        return generateContentWithSchema(prompt, arrayOfStringSchema);
    },

    suggestRhythmPhrasings: async ({ line }: GenerateRhythmParams): Promise<RhythmSuggestion[]> => {
        const prompt = `You are an expert songwriter and poet. Analyze the following lyric and suggest 3 distinct rhythmic interpretations for it: "${line}"

        For each interpretation, provide:
        1.  **meter**: A common time signature (e.g., "4/4", "3/4").
        2.  **name**: The name of the dominant poetic meter (e.g., "Iambic Pentameter", "Anapestic Trimeter", "Dactylic Tetrameter", "Syncopated Pop").
        3.  **pattern**: A simple representation of the rhythm using "da" for unstressed and "DUM" for stressed syllables (e.g., "da-DUM da-DUM da-DUM").
        4.  **formattedLine**: The original line with the stressed syllables written in ALL CAPS to make them stand out (e.g., "the CI-ty SLEEPS be-LOW my WIN-dow PANE"). Do not add any other formatting.
        5.  **description**: A brief explanation of the feeling or style this rhythm creates (e.g., "Creates a classic, conversational feel.", "Energetic and driving, perfect for an upbeat chorus.").`;

        const schema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    meter: { type: Type.STRING, description: "A common time signature (e.g., '4/4', '3/4')." },
                    name: { type: Type.STRING, description: "The name of the dominant poetic meter." },
                    pattern: { type: Type.STRING, description: "A simple representation of the rhythm using 'da' and 'DUM'." },
                    formattedLine: { type: Type.STRING, description: "The lyric with stressed syllables in ALL CAPS." },
                    description: { type: Type.STRING, description: "A brief explanation of the feeling this rhythm creates." }
                },
                required: ["meter", "name", "pattern", "formattedLine", "description"]
            }
        };

        return generateContentWithSchema(prompt, schema);
    },
};