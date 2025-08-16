
import { GoogleGenAI, Type } from "@google/genai";
import type { GenerateIdeaParams, GenerateChordsParams, GenerateRhymesParams, GenerateSynonymsParams, GenerateWordAssociationsParams, GenerateBlendedIdeaParams, Chord, AnalyzeSongParams, SongSection, AudioAnalysisResult, GetInspirationalSparkParams, ModifyLyricParams, ProgressionStep, GenerateTitleParams, GenerateEmotionalPaletteParams, GenerateObjectObservationParams } from '../types';

let ai: GoogleGenAI | null = null;
const model = 'gemini-2.5-flash';

const getAiInstance = (): GoogleGenAI => {
    if (ai) {
        return ai;
    }
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        // This specific error message will be caught and displayed to the user.
        throw new Error("API key is missing. Please ensure the API_KEY environment variable is set correctly.");
    }
    ai = new GoogleGenAI({ apiKey });
    return ai;
};


const arrayOfStringSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.STRING
    }
};

const generateContentWithSchema = async (prompt: string, schema: any): Promise<any> => {
    if (typeof prompt !== 'string' || !prompt.trim()) {
        console.error("AI prompt was empty or invalid. Aborting request.");
        throw new Error("Cannot send an empty prompt to the AI.");
    }
    const aiInstance = getAiInstance();
    const response = await aiInstance.models.generateContent({
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
    if (typeof prompt !== 'string' || !prompt.trim()) {
        console.error("AI prompt was empty or invalid. Aborting request.");
        throw new Error("Cannot send an empty prompt to the AI.");
    }
    const aiInstance = getAiInstance();
    const response = await aiInstance.models.generateContent({
        model,
        contents: prompt,
        config: {
            temperature: 0.8,
        }
    });
    return response.text;
};

const formatSongForAnalysis = (structure: SongSection[], progression: ProgressionStep[]): string => {
    let songString = '';

    structure.forEach(section => {
        songString += `(${section.label})\n`;
        section.content.forEach(part => {
            songString += `${part.text}\n`;
        });
        songString += '\n';
    });

    if (progression.length > 0) {
        songString += `Chord Progression:\n${progression.map(p => `${p.chord.name} (${p.durationBeats} beats)`).join(' - ')}\n`;
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

    modifyLyric: async ({ line, context, modificationType }: ModifyLyricParams): Promise<string | string[]> => {
        let prompt = '';
        switch (modificationType) {
            case 'refine':
                prompt = `You are a poetic editor. Refine and improve the following lyric, keeping its core idea but enhancing the imagery, flow, and word choice. Make it more evocative.
Original line: "${line}"
Lyrical context: "${context}"
Refined line:`;
                return generateTextContent(prompt);
            
            case 'replace':
                prompt = `You are a creative lyricist. Write a completely new line to replace the original, maintaining the same theme and mood found in the context.
Original line to be replaced: "${line}"
Lyrical context: "${context}"
New, replacement line:`;
                return generateTextContent(prompt);

            case 'suggest_alternatives':
                prompt = `You are a songwriter's assistant. Provide 3 diverse alternatives for the following lyric. The alternatives should fit the provided context. Return a JSON array of 3 strings.
Original line: "${line}"
Lyrical context: "${context}"`;
                return generateContentWithSchema(prompt, arrayOfStringSchema);

            case 'random_line':
                prompt = `You are a source of creative inspiration. Generate a single, random, poetic line that is thematically related to the following context, but is not a direct replacement for any specific line.
Lyrical context: "${context}"
Inspirational line:`;
                return generateTextContent(prompt);
        }
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

    analyzeSong: async ({ structure, progression, analysisType }: AnalyzeSongParams): Promise<string> => {
        const songContent = formatSongForAnalysis(structure, progression);
        let prompt = `You are an expert song doctor and music critic. A songwriter has asked for feedback on their work-in-progress.\n\n**The Song:**\n---\n${songContent}\n---`;

        switch(analysisType) {
            case 'rhyme_analyzer':
                prompt += `\n\n**Your Analysis Task:**
Analyze the **rhyme scheme and word choice** of the lyrics.
- Identify the rhyme scheme for each section (e.g., AABB, ABAB).
- Point out any particularly effective or creative rhymes.
- Identify any rhymes that feel weak, forced, or cliché.
- Suggest 1-2 specific areas where a different rhyming choice could enhance the song's impact.
Format your response as a single block of text using markdown for structure.`;
                break;
            case 'repetition_analyzer':
                prompt += `\n\n**Your Analysis Task:**
Analyze the use of **repetition** in the lyrics.
- Identify key repeated words, phrases, or motifs.
- Evaluate whether the repetition is effective for emphasis and structure (e.g., in a chorus) or if it becomes monotonous.
- Point out any "crutch words" that are overused without adding significant meaning.
- Suggest 1-2 specific ways to vary the language or introduce new phrasing to improve the song.
Format your response as a single block of text using markdown for structure.`;
                break;
            case 'song_doctor':
            default:
                 prompt += `\n\n**Your Analysis Task:**
Please provide a structured analysis covering the following points. Keep your feedback encouraging but honest.
**1. Overall Impression & Emotional Arc:** What is the main feeling or story? Does the emotional journey feel compelling?
**2. Lyrical Analysis:** Is the theme clear? Are the images strong? Are there any standout lines or clichés?
**3. Structural Analysis:** Is the song structure effective? Does the song build dynamically?
**4. Harmonic Analysis (if chords are provided):** Does the chord progression support the lyrical mood?
**5. Actionable Suggestions:** Provide 2-3 specific, concrete suggestions for how the songwriter could improve this piece.
Format your entire response as a single block of text. Use markdown-style bolding for headers.`;
                break;
        }

        return generateTextContent(prompt);
    },

    analyzeAudioPart: async (audioBase64: string, mimeType: string): Promise<AudioAnalysisResult> => {
        const prompt = `You are a helpful and creative music expert. A songwriter has recorded a short audio clip.
Analyze this audio and provide creative suggestions to help them develop the idea.
1.  **Analyze the audio:** Describe its core musical characteristics (mood, tempo, contour).
2.  **Suggest lyrics:** Write a 4-line verse that matches the mood and rhythm.
3.  **Suggest chords:** Propose a simple 4-chord progression (e.g., "C - G - Am - F").
Return a JSON object with your analysis and suggestions.`;
        const aiInstance = getAiInstance();

        const audioAnalysisSchema = {
            type: Type.OBJECT,
            properties: {
                analysis: {
                    type: Type.OBJECT,
                    properties: {
                        mood: { type: Type.STRING, description: "The overall mood of the melody (e.g., 'melancholic', 'upbeat', 'haunting')." },
                        tempo: { type: Type.STRING, description: "The estimated tempo (e.g., 'slow ballad', 'mid-tempo groove', 'fast and energetic')." },
                        contour: { type: Type.STRING, description: "A brief description of the melodic shape (e.g., 'A simple, ascending line that resolves downwards')." }
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

        const response = await aiInstance.models.generateContent({
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
Prioritize less common rhymes like slant rhymes, near rhymes, and multisyllabic rhymes.
AVOID overly simple, common, and cliché perfect rhymes. The goal is to provide creative, unexpected options.`;
        return generateContentWithSchema(prompt, arrayOfStringSchema);
    },

    findSynonyms: async ({ word }: GenerateSynonymsParams): Promise<string[]> => {
        const prompt = `Find 10 interesting synonyms for the word "${word}". Provide a mix of common and more literary options.`;
        return generateContentWithSchema(prompt, arrayOfStringSchema);
    },

    getChordLibrary: async ({ key }: GenerateChordsParams): Promise<Chord[]> => {
        const prompt = `You are an expert music theorist. For the key of ${key} Major, provide a library of common chords.
        Include all 7 diatonic chords plus at least 3 common non-diatonic or borrowed chords.
        For each chord, identify its musical function. Use one of the following: 'tonic', 'subdominant', 'dominant', 'predominant', 'leading-tone', 'secondary-dominant', 'other'.
        Return an array of objects, each with a 'name' and a 'function'.`;

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
        const prompt = `Generate a unique and inspiring songwriting prompt to help break writer's block. It could be a "what if" scenario, a question, an interesting image to describe, or a short story starter. Keep it concise and open-ended.`;
        return generateTextContent(prompt);
    },

    getInspirationalSpark: async ({ sourceType }: GetInspirationalSparkParams): Promise<string> => {
        let prompt = '';
        switch(sourceType) {
            case 'poet':
                prompt = `Generate a single, evocative, and original line of poetry (6-12 words) in the style of a classic poet. Rich in imagery and metaphor. Do not include quotation marks.`;
                break;
            case 'philosopher':
                prompt = `Generate a single, short, thought-provoking philosophical question or aphorism (under 15 words) that challenges a common assumption. Do not include quotation marks.`;
                break;
            case 'artist':
                prompt = `Generate a single, vivid sentence describing a scene as if it were a painting (10-20 words). Focus on color, light, and mood. Do not include quotation marks.`;
                break;
        }
        return generateTextContent(prompt);
    },

    generateTitles: async ({ theme }: GenerateTitleParams): Promise<string[]> => {
        const prompt = `You are a creative title generator for a songwriter.
Based on the theme "${theme}", generate 5 evocative and original song titles.
The titles should be a mix of styles: some direct, some metaphorical, some intriguing.
Return a JSON array of 5 strings.`;
        return generateContentWithSchema(prompt, arrayOfStringSchema);
    },
    
    generateEmotionalPaletteScene: async ({ emotions }: GenerateEmotionalPaletteParams): Promise<string> => {
        const prompt = `You are an expert storyteller and screenwriter.
A songwriter wants a creative spark based on a complex emotional palette.
The selected emotions are: **${emotions.join(', ')}**.
Your task is to generate a short, vivid scene (2-3 sentences) that embodies this specific blend of emotions.
Describe a setting, a character, and an action or a thought. Make it concrete and sensory.
This scene will serve as the core inspiration for a song.`;
        return generateTextContent(prompt);
    },
    
    generateObjectObservation: async ({ object }: GenerateObjectObservationParams): Promise<string> => {
        const prompt = `You are a poet with a keen eye for detail and metaphor.
A songwriter has chosen an object for inspiration: **a ${object}**.
Your task is to write a short, poetic observation about this object (3-4 lines).
Consider its history, its purpose, its texture, the memories it might hold, or a metaphor it could represent.
The goal is to provide a unique and unexpected perspective on the mundane.`;
        return generateTextContent(prompt);
    },

    generateWordAssociations: async ({ word }: GenerateWordAssociationsParams): Promise<string[]> => {
        const prompt = `Generate a list of 10 creative and evocative words associated with the word "${word}". Think beyond direct synonyms. Include concepts, emotions, objects, and actions that are thematically or metaphorically related.`;
        return generateContentWithSchema(prompt, arrayOfStringSchema);
    },
};