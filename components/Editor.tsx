
import React, { useState, useRef, useEffect, useCallback, memo, useContext } from 'react';
import type { SongSection, ContentPart, Author, LyricModificationType } from '../types';
import { SparklesIcon, TrashIcon, UserIcon, RobotIcon, MicrophoneIcon, StopIcon, WandIcon, ArrowPathIcon, QueueListIcon, CubeTransparentIcon } from './icons';
import { ActionsContext } from '../state/songState';

interface EditorProps {
    activeSection: SongSection | undefined;
    lyricSuggestions: { partId: string, suggestions: string[] } | null;
}

const SuggestionPicker: React.FC<{
    suggestions: string[];
    onSelect: (suggestion: string) => void;
}> = ({ suggestions, onSelect }) => (
    <div className="bg-cream-100 border border-teal-300 p-2 rounded-md my-2 space-y-1 shadow-lg">
        <p className="text-xs font-semibold text-teal-800 mb-1">Suggestions:</p>
        {suggestions.map((s, i) => (
            <button key={i} onClick={() => onSelect(s)} className="w-full text-left text-sm text-sepia-800 p-1.5 rounded bg-teal-50/50 hover:bg-teal-100 transition-colors">
                "{s}"
            </button>
        ))}
    </div>
);


const ContentPartBlock: React.FC<{ 
    part: ContentPart; 
    sectionId: string;
    sectionContext: string;
    isEditing: boolean;
    editedText: string;
    lyricSuggestions: { partId: string, suggestions: string[] } | null;
    onSetEditedText: (text: string) => void;
    onStartEditing: () => void;
    onCancelEditing: () => void;
}> = ({ 
    part, 
    sectionId,
    sectionContext,
    isEditing, 
    editedText,
    lyricSuggestions,
    onSetEditedText,
    onStartEditing,
    onCancelEditing,
}) => {
    const actions = useContext(ActionsContext);
    if (!actions) return null;
    const { onDeleteContentPart, onModifyLyric, onUpdateContentPart } = actions;

    const isUser = part.author === 'user';
    
    const containerClasses = isUser 
        ? 'bg-cream-100/50 border-sepia-200' 
        : 'bg-teal-50/40 border-teal-200/50';
    
    const icon = isUser 
        ? <UserIcon className="w-5 h-5 text-sepia-800" /> 
        : <RobotIcon className="w-5 h-5 text-teal-700" />;
        
    const authorName = isUser ? 'You' : 'AI Co-Writer';
    const authorColor = isUser ? 'text-sepia-800' : 'text-teal-800';
    
    const onSaveChanges = () => {
        if (editedText.trim()) {
            onUpdateContentPart(sectionId, part.id, editedText);
        }
        onCancelEditing();
    };

    const onDelete = () => {
        onDeleteContentPart(sectionId, part.id);
    };

    const onModify = (modificationType: LyricModificationType) => {
        const lineToModify = modificationType === 'random_line' ? '' : editedText;
        onModifyLyric(sectionId, part.id, {
            line: lineToModify,
            context: sectionContext,
            modificationType
        });
    };
    
    const onApplySuggestion = (suggestion: string) => {
        onUpdateContentPart(sectionId, part.id, suggestion);
        onCancelEditing();
    };

    if (isEditing && isUser) {
        const AIToolButton = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
            <button onClick={onClick} title={label} className="flex items-center gap-1 p-1.5 rounded-md text-teal-700 hover:bg-teal-100 hover:text-teal-800 transition-colors">
                {icon}
                <span className="text-xs font-semibold">{label}</span>
            </button>
        );

        return (
            <div className={`group relative p-4 rounded-md border-2 border-orange-700 ${containerClasses}`}>
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-0.5">{icon}</div>
                    <div className="flex-grow">
                         <p className={`font-semibold font-typewriter text-sm ${authorColor} mb-1`}>{authorName} (Editing)</p>
                         <textarea
                            value={editedText}
                            onChange={(e) => onSetEditedText(e.target.value)}
                            className="w-full bg-cream-100/50 text-sepia-900 p-2 rounded-md border border-sepia-300 focus:outline-none focus:ring-1 focus:ring-orange-700 resize-y text-base"
                            rows={Math.max(3, editedText.split('\n').length)}
                            autoFocus
                         />
                         {lyricSuggestions && lyricSuggestions.partId === part.id && (
                             <SuggestionPicker suggestions={lyricSuggestions.suggestions} onSelect={onApplySuggestion} />
                         )}
                         <div className="mt-2 flex items-center justify-between">
                             <div className="flex items-center gap-1 border border-teal-200 bg-teal-50/30 rounded-lg p-0.5">
                                 <AIToolButton icon={<WandIcon className="w-4 h-4" />} label="Refine" onClick={() => onModify('refine')} />
                                 <AIToolButton icon={<ArrowPathIcon className="w-4 h-4" />} label="Replace" onClick={() => onModify('replace')} />
                                 <AIToolButton icon={<QueueListIcon className="w-4 h-4" />} label="Suggest" onClick={() => onModify('suggest_alternatives')} />
                                 <AIToolButton icon={<CubeTransparentIcon className="w-4 h-4" />} label="Inspire" onClick={() => onModify('random_line')} />
                             </div>
                             <div className="flex items-center gap-2">
                                <button onClick={onSaveChanges} className="bg-orange-700 hover:bg-orange-600 text-cream-100 font-semibold text-sm px-3 py-1 rounded-md transition-all shadow-sm">Save</button>
                                <button onClick={onCancelEditing} className="text-sm text-sepia-800 font-medium hover:underline">Cancel</button>
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div 
            className={`group relative p-4 rounded-md border ${containerClasses} ${isUser ? 'cursor-pointer' : ''}`}
            onClick={isUser ? onStartEditing : undefined}
            title={isUser ? "Click to edit" : ""}
        >
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">{icon}</div>
                <div className="flex-grow">
                    <p className={`font-semibold font-typewriter text-sm ${authorColor} mb-1`}>{authorName}</p>
                    <p className="text-sepia-900 whitespace-pre-wrap leading-relaxed text-base">{part.text}</p>
                </div>
            </div>
             <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="absolute top-2 right-2 p-1 rounded-full text-sepia-400 hover:bg-red-500/10 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100">
                <TrashIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

const AICoWriter: React.FC<{ sectionId: string }> = ({ sectionId }) => {
    const [prompt, setPrompt] = useState('');
    const [showInput, setShowInput] = useState(false);
    const actions = useContext(ActionsContext);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim() && actions) {
            actions.onCowrite(sectionId, prompt);
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
                    <button 
                        type="submit" 
                        className="bg-teal-700 hover:bg-teal-600 text-cream-100 font-semibold text-sm px-4 py-1.5 rounded-md transition-all shadow-sm border-b-2 border-teal-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!prompt.trim()}
                    >
                        Generate
                    </button>
                </form>
            )}
        </div>
    );
};

const AudioRecorder: React.FC<{ section: SongSection }> = ({ section }) => {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const actions = useContext(ActionsContext);

    const handleStartRecording = useCallback(async () => {
        if (!actions) return;
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
                actions.onUpdateAudio(section.id, audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error starting recording:", err);
            alert("Could not start recording. Please ensure you have given microphone permissions.");
        }
    }, [section.id, actions]);

    const handleStopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, []);
    
    if (!actions) return null;
    const { onUpdateAudio, onDeleteAudio, onAnalyzeAudio } = actions;
    
    const secondaryButtonClasses = "bg-cream-100/50 hover:bg-cream-100 text-sepia-800 font-semibold text-sm px-3 py-1.5 rounded-md transition-all border border-sepia-300 shadow-sm";

    return (
        <div className="border-t border-sepia-200 p-3 bg-sepia-200/20">
            <h4 className="text-xs font-typewriter font-semibold text-sepia-800 uppercase tracking-wider mb-2">Audio Sketchpad</h4>
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
                            <MicrophoneIcon className="w-5 h-5 text-sepia-800" /> Record Audio Idea
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};


const EditorComponent: React.FC<EditorProps> = ({ activeSection, lyricSuggestions }) => {
    const [userText, setUserText] = useState('');
    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    const [editingPartId, setEditingPartId] = useState<string | null>(null);
    const [editedText, setEditedText] = useState('');
    const actions = useContext(ActionsContext);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeSection?.content]);

    // When the active section changes, cancel any ongoing edits
    useEffect(() => {
        setEditingPartId(null);
    }, [activeSection?.id]);

    if (!actions) return null;
    const { onAddContentPart } = actions;

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
                {activeSection && <AICoWriter sectionId={activeSection.id} />}
            </div>
            
            <div className="flex-grow p-4 space-y-3 overflow-y-auto" style={{ minHeight: '40vh' }}>
                {activeSection && activeSection.content.map(part => (
                    <ContentPartBlock 
                        key={part.id} 
                        part={part} 
                        sectionId={activeSection.id}
                        sectionContext={activeSection.content.filter(p => p.id !== part.id).map(p => p.text).join('\n')}
                        isEditing={editingPartId === part.id}
                        editedText={editedText}
                        lyricSuggestions={lyricSuggestions}
                        onSetEditedText={setEditedText}
                        onStartEditing={() => {
                            setEditingPartId(part.id);
                            setEditedText(part.text);
                        }}
                        onCancelEditing={() => setEditingPartId(null)}
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
                    <AudioRecorder 
                        section={activeSection} 
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
                                className="bg-sepia-800 hover:bg-sepia-900 text-cream-100 font-semibold text-sm px-4 py-2 rounded-md transition-all duration-200 shadow-sm border-b-2 border-black/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!userText.trim()}
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

export const Editor = memo(EditorComponent);
