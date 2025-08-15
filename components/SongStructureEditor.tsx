import React, { useState, useEffect } from 'react';
import type { SongSection, SectionType } from '../types';
import { TrashIcon, CheckIcon, XMarkIcon, SparklesIcon } from './icons';
import { SECTION_TYPES } from '../constants';

interface SectionBlockProps {
    section: SongSection;
    isActive: boolean;
    onSelect: () => void;
    onDelete: () => void;
    onUpdate: (id: string, updates: { type: SectionType, label: string }) => void;
    onDragStart: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
}

const SectionBlock: React.FC<SectionBlockProps> = ({ section, isActive, onSelect, onDelete, onUpdate, ...dragProps }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedLabel, setEditedLabel] = useState(section.label);
    const [editedType, setEditedType] = useState<SectionType>(section.type);

    useEffect(() => {
        setEditedLabel(section.label);
        setEditedType(section.type);
    }, [section]);

    const typeColorMap: Record<string, string> = {
        'Intro': 'border-l-cyan-700',
        'Verse': 'border-l-teal-700',
        'Pre-Chorus': 'border-l-teal-500',
        'Chorus': 'border-l-orange-700',
        'Bridge': 'border-l-amber-600',
        'Solo': 'border-l-pink-700',
        'Outro': 'border-l-sepia-800',
    };

    const handleDoubleClick = () => {
        if (!isActive) onSelect(); // Select before editing
        setIsEditing(true);
    };

    const handleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (editedLabel.trim()) {
            onUpdate(section.id, { label: editedLabel.trim(), type: editedType });
        }
        setIsEditing(false);
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditedLabel(section.label);
        setEditedType(section.type);
        setIsEditing(false);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete();
    };

    const baseClasses = 'group w-full bg-cream-100/50 p-2 rounded-md flex justify-between items-center cursor-pointer transition-all duration-200 border border-sepia-200 border-l-4 transform hover:bg-cream-100';
    const activeClasses = 'ring-2 ring-orange-700/80 border-orange-700';
    const typeColor = typeColorMap[section.type] || 'border-l-sepia-400';
    const editingClasses = 'ring-2 ring-teal-500 border-teal-500 cursor-default';

    if (isEditing) {
        return (
            <div className={`${baseClasses} ${editingClasses} ${typeColorMap[editedType]}`}>
                <div className="flex flex-col gap-1.5 flex-grow pr-2">
                     <select 
                        value={editedType} 
                        onChange={(e) => setEditedType(e.target.value as SectionType)}
                        className="w-full bg-cream-100 text-sepia-900 border border-sepia-300 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                        onClick={e => e.stopPropagation()}
                     >
                        {SECTION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                     </select>
                     <input
                        type="text"
                        value={editedLabel}
                        onChange={(e) => setEditedLabel(e.target.value)}
                        className="w-full bg-cream-100 text-sepia-900 border border-sepia-300 rounded px-1 py-0.5 text-sm font-semibold font-typewriter focus:outline-none focus:ring-1 focus:ring-teal-500"
                        autoFocus
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSave(e as any); if (e.key === 'Escape') handleCancel(e as any); }}
                        onClick={e => e.stopPropagation()}
                     />
                </div>
                <div className="flex items-center">
                    <button onClick={handleSave} className="p-1 rounded-full text-teal-600 hover:bg-teal-500/10 hover:text-teal-700">
                        <CheckIcon className="w-5 h-5" />
                    </button>
                    <button onClick={handleCancel} className="p-1 rounded-full text-sepia-400 hover:bg-sepia-800/10 hover:text-sepia-900">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div 
            className={`${baseClasses} ${isActive ? activeClasses : 'hover:border-sepia-300'} ${typeColor}`}
            onClick={onSelect}
            onDoubleClick={handleDoubleClick}
            draggable
            {...dragProps}
        >
            <div className="flex flex-col overflow-hidden">
                <span className="font-semibold font-typewriter text-sm text-sepia-800">{section.label}</span>
                <span className="text-xs text-sepia-800/70 truncate">{section.content[0]?.text.split('\n')[0] || '...'}</span>
            </div>
            <button onClick={handleDelete} className="p-1 rounded-full text-sepia-400 hover:bg-red-500/10 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0">
                <TrashIcon className="w-4 h-4" />
            </button>
        </div>
    );
};


interface SongStructureEditorProps {
    sections: SongSection[];
    activeSectionId: string | null;
    onSectionSelect: (id: string) => void;
    onReorder: (startIndex: number, endIndex: number) => void;
    onDelete: (id: string) => void;
    onUpdateSection: (id: string, updates: { type: SectionType, label: string }) => void;
    onAddSection: (type: SectionType) => void;
}

export const SongStructureEditor: React.FC<SongStructureEditorProps> = ({ sections, activeSectionId, onSectionSelect, onReorder, onDelete, onUpdateSection, onAddSection }) => {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
    };
    
    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) return;
        onReorder(draggedIndex, dropIndex);
        setDraggedIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    return (
        <div className="h-full flex flex-col">
             <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-bold font-typewriter text-sepia-800">Song Structure</h2>
             </div>
             <div className="flex-grow space-y-2">
                {sections.map((section, index) => (
                    <SectionBlock
                        key={section.id}
                        section={section}
                        isActive={section.id === activeSectionId}
                        onSelect={() => onSectionSelect(section.id)}
                        onDelete={() => onDelete(section.id)}
                        onUpdate={onUpdateSection}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                    />
                ))}
                 {sections.length === 0 && (
                     <p className="w-full text-center text-sepia-400 text-sm py-4">Your song is empty. Add a section to begin!</p>
                 )}
             </div>
              <div className="pt-4 border-t border-sepia-200 mt-4 space-y-2">
                  <p className="text-xs text-sepia-800 font-semibold mb-2">Add a new section:</p>
                  <div className="grid grid-cols-2 gap-2">
                      {(['Verse', 'Chorus', 'Bridge', 'Intro', 'Outro', 'Solo'] as SectionType[]).map(type => (
                          <button 
                            key={type} 
                            onClick={() => onAddSection(type)} 
                            className="w-full text-center bg-cream-100/50 hover:bg-cream-100 text-sepia-800 font-semibold text-sm px-3 py-1.5 rounded-md transition-all border border-sepia-300 shadow-sm"
                          >
                              {type}
                          </button>
                      ))}
                  </div>
              </div>
        </div>
    );
};