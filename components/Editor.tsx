import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { SongSection, ContentPart, Author } from '../types';
import { SparklesIcon, TrashIcon, UserIcon, RobotIcon, MicrophoneIcon, StopIcon } from './icons';

interface EditorProps {
    activeSection: SongSection | undefined;
    onAddContentPart: (sectionId: string, author: Author, text: string) => void;
    onDeleteContentPart: (sectionId: string, partId: string) => void;
    onCowrite: (sectionId: string, prompt: string) => void;
    onUpdateAudio: (sectionId: string, audioBlob: Blob) => void;
    onDeleteAudio: (sectionId: string) => void;
    onAnalyzeAudio: (sectionId: string) => void;
}

const ContentPartBlock: React.FC<{ part: ContentPart; onDelete: () => void; }> = ({ part, onDelete }) => {
    const isUser = part.author === 'user';
    
    const containerClasses = isUser 
        ? 'bg-cream-100/50 border-sepia-200' 
        : 'bg-teal-50/40 border-teal-200/50';
    
    const icon = isUser 
        ? <UserIcon className="w-5 h-5 text-sepia-800" /> 
        : <RobotIcon className="w-5 h-5 text-teal-700" />;
        
    const authorName = isUser ? 'You' : 'AI Co-Writer';
    const authorColor = isUser ? 'text-sepia-800' : 'text-teal-800';

    return (
        <div className={`group relative p-4 rounded-md border ${containerClasses}`}>
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">{icon}</div>
                <div className="flex-grow">
                    <p className={`font-semibold font-typewriter text-sm ${authorColor} mb-1`}>{authorName}</p>
                    <p className="text-sepia-900 whitespace-pre-wrap leading-relaxed text-base">{part.text}</p>
                </div>
            </div>
             <button onClick={onDelete} className="absolute top-2 right-2 p-1 rounded-full text-sepia-400 hover:bg-red-500/10 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100">
                <TrashIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

const AICoWriter: React.FC<{ onGenerate: (prompt: string) => void }> = ({ onGenerate }) => {
    const [prompt, setPrompt] = useState('');
    const [showInput, setShowInput] = useState(false);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            onGenerate(prompt);
            setPrompt('');
            setShowInput(false);
        }
    };

    return (
        <div>
            <button
                onClick={() => setShowInput(!showInput)}
                className="flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors"
            >
                <SparklesIcon className="w-4 h-4" />
                Co-write with AI
            </button>
            {showInput && (
                <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., 'add a line about the moon'"
                        className="flex-grow w-full bg-cream-100 text-sepia-900 border border-sepia-300 rounded-md px-3 py-1.5 text-sm placeholder-sepia-400 focus:outline-none focus:ring-2 focus:ring-orange-700 focus:border-orange-700"
                        autoFocus
                    />
                    <button type="submit" className="bg-teal-700 hover:bg-teal-600 text-cream-100 font-semibold text-sm px-4 py-1.5 rounded-md transition-all shadow-sm border-b-2 border-teal-900/50">
                        Generate
                    </button>
                </form>
            )}
        </div>
    );
};

const MelodySketchpad: React.FC<{
    section: SongSection;
    onUpdateAudio: (sectionId: string, audioBlob: Blob) => void;
    onDeleteAudio: (sectionId: string) => void;
    onAnalyzeAudio: (sectionId: string) => void;
}> = ({ section, onUpdateAudio, onDeleteAudio, onAnalyzeAudio }) => {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleStartRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                onUpdateAudio(section.id, audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error starting recording:", err);
            alert("Could not start recording. Please ensure you have given microphone permissions.");
        }
    }, [section.id, onUpdateAudio]);

    const handleStopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, []);
    
    const secondaryButtonClasses = "bg-cream-100/50 hover:bg-cream-100 text-sepia-800 font-semibold text-sm px-3 py-1.5 rounded-md transition-all border border-sepia-300 shadow-sm";


    return (
        <div className="border-t border-sepia-200 p-3 bg-sepia-200/20">
            <h4 className="text-xs font-typewriter font-semibold text-sepia-800 uppercase tracking-wider mb-2">Melody Sketchpad</h4>
            {section.audio ? (
                <div className="flex items-center gap-2">
                    <audio src={section.audio.blobUrl} controls className="w-full h-8" />
                    <button onClick={() => onAnalyzeAudio(section.id)} className="text-teal-700 hover:text-teal-800 font-semibold text-sm whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-teal-300/50 bg-teal-50/50 hover:bg-teal-100/50 transition-all">
                        <SparklesIcon className="w-4 h-4" /> Analyze
                    </button>
                    <button onClick={() => onDeleteAudio(section.id)} title="Delete recording" className="p-2 rounded-md hover:bg-red-100 text-sepia-800 hover:text-red-600 transition-colors">
                        <TrashIcon className="w-4 h-4"/>
                    </button>
                </div>
            ) : (
                 <div className="flex items-center gap-2">
                    {isRecording ? (
                        <button onClick={handleStopRecording} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-4 py-2 rounded-md transition-all duration-200 flex items-center justify-center gap-2 shadow-sm border-b-2 border-red-800/50">
                            <StopIcon className="w-5 h-5" /> Stop Recording
                        </button>
                    ) : (
                        <button onClick={handleStartRecording} className={`w-full ${secondaryButtonClasses} justify-center flex items-center gap-1.5`}>
                            <MicrophoneIcon className="w-5 h-5 text-sepia-800" /> Record Melody Idea
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};


export const Editor: React.FC<EditorProps> = ({ activeSection, onAddContentPart, onDeleteContentPart, onCowrite, onUpdateAudio, onDeleteAudio, onAnalyzeAudio }) => {
    const [userText, setUserText] = useState('');
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeSection?.content]);

    const handleAddUserLines = () => {
        if (activeSection && userText.trim()) {
            onAddContentPart(activeSection.id, 'user', userText);
            setUserText('');
        }
    };
    
    return (
        <div className="bg-cream-100/50 rounded-lg shadow-sm h-full flex flex-col border border-sepia-200">
            <div className="p-3 border-b border-sepia-200 flex justify-between items-center">
                <h2 className="text-base font-typewriter text-sepia-800 tracking-wide">
                    Editing: <span className="font-bold text-orange-700">{activeSection ? activeSection.label : 'No Section'}</span>
                </h2>
                {activeSection && <AICoWriter onGenerate={(prompt) => onCowrite(activeSection.id, prompt)} />}
            </div>
            
            <div className="flex-grow p-4 space-y-3 overflow-y-auto" style={{ minHeight: '40vh' }}>
                {activeSection && activeSection.content.map(part => (
                    <ContentPartBlock 
                        key={part.id} 
                        part={part} 
                        onDelete={() => onDeleteContentPart(activeSection.id, part.id)}
                    />
                ))}
                {!activeSection && (
                     <div className="w-full h-full text-sepia-800 flex items-center justify-center">
                        <p>Select a section to begin.</p>
                    </div>
                )}
                 {activeSection && activeSection.content.length === 0 && (
                     <div className="w-full text-center text-sepia-400 text-sm py-4">
                        This section is empty. Add your lines below or use the AI co-writer.
                    </div>
                 )}
                <div ref={endOfMessagesRef} />
            </div>

            {activeSection && (
                <>
                    <MelodySketchpad 
                        section={activeSection} 
                        onUpdateAudio={onUpdateAudio} 
                        onDeleteAudio={onDeleteAudio}
                        onAnalyzeAudio={onAnalyzeAudio}
                    />
                    <div className="p-3 border-t border-sepia-200 bg-sepia-200/20">
                        <textarea
                            value={userText}
                            onChange={(e) => setUserText(e.target.value)}
                            placeholder="Type your lyrics here..."
                            className="w-full bg-cream-100 text-sepia-900 p-3 rounded-md border border-sepia-300 focus:outline-none focus:ring-2 focus:ring-orange-700 focus:border-orange-700 resize-none text-base"
                            rows={3}
                        />
                        <div className="flex justify-end mt-2">
                            <button 
                                onClick={handleAddUserLines}
                                className="bg-sepia-800 hover:bg-sepia-900 text-cream-100 font-semibold text-sm px-4 py-2 rounded-md transition-all duration-200 shadow-sm border-b-2 border-black/30"
                            >
                                Add My Lines
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};