
import React, { useState, useEffect, memo, useContext } from 'react';
import { MusicNoteIcon, FilePlusIcon, DownloadIcon, ShareIcon, Bars3Icon } from './icons';
import { SongDataContext, ActionsContext } from '../App';

interface HeaderProps {
    onNewSong: () => void;
    onExport: () => void;
    onShare: () => Promise<boolean>;
    onToggleStructure: () => void;
    onToggleTools: () => void;
}

const HeaderComponent: React.FC<HeaderProps> = ({ onNewSong, onExport, onShare, onToggleStructure, onToggleTools }) => {
    const songData = useContext(SongDataContext);
    const actions = useContext(ActionsContext);
    
    const [linkCopied, setLinkCopied] = useState(false);
    const [currentTitle, setCurrentTitle] = useState(songData?.title || '');

    useEffect(() => {
        if (songData) {
            setCurrentTitle(songData.title);
        }
    }, [songData?.title]);

    if (!songData || !actions) return null;
    const { onUpdateTitle } = actions;

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentTitle(e.target.value);
    };
    
    const handleTitleBlur = () => {
        if (currentTitle.trim() && currentTitle !== songData.title) {
            onUpdateTitle(currentTitle.trim());
        } else {
            setCurrentTitle(songData.title); // Revert if empty or unchanged
        }
    };
    
    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur(); // Trigger blur to save
        }
    };

    const handleShareClick = async () => {
        const success = await onShare();
        if (success) {
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        }
    };
    
    const buttonClasses = "p-2 rounded-md hover:bg-sepia-200/50 text-sepia-800 transition-colors";

    return (
        <header className="sticky top-0 bg-[#f5f3f0]/80 backdrop-blur-md border-b border-sepia-200 z-10 h-[65px]">
            <div className="max-w-[100rem] mx-auto flex items-center justify-between px-4 h-full">
                <div className="flex items-center gap-4">
                     <button onClick={onToggleStructure} className={buttonClasses} title="Toggle Structure Panel">
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2">
                        <MusicNoteIcon className="w-7 h-7 text-orange-700 flex-shrink-0" />
                        <input
                            type="text"
                            value={currentTitle}
                            onChange={handleTitleChange}
                            onBlur={handleTitleBlur}
                            onKeyDown={handleTitleKeyDown}
                            className="text-3xl font-typewriter text-sepia-800 bg-transparent focus:outline-none focus:bg-sepia-200/50 rounded-md px-2 -ml-2 w-full max-w-xs sm:max-w-sm md:max-w-lg"
                            aria-label="Song title"
                            title="Click to edit title"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                     <button onClick={onNewSong} className={buttonClasses} title="New Song">
                        <FilePlusIcon className="w-6 h-6" />
                    </button>
                     <button onClick={onExport} className={buttonClasses} title="Export as .html">
                        <DownloadIcon className="w-6 h-6" />
                    </button>
                    <button onClick={handleShareClick} className={`${buttonClasses} relative w-28 text-sm font-semibold`} title="Copy Share Link">
                         {linkCopied ? <span className="text-orange-700">Link Copied!</span> : (
                             <div className="flex items-center justify-center gap-1.5">
                                <ShareIcon className="w-5 h-5" />
                                <span>Share</span>
                             </div>
                         )}
                    </button>
                     <button onClick={onToggleTools} className={buttonClasses} title="Toggle Tools Panel">
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export const Header = memo(HeaderComponent);
