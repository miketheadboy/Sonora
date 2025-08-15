import React, { useState } from 'react';
import { MusicNoteIcon, FilePlusIcon, DownloadIcon, ShareIcon, Bars3Icon } from './icons';

interface HeaderProps {
    onNewSong: () => void;
    onExport: () => void;
    onShare: () => Promise<boolean>;
    onToggleStructure: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNewSong, onExport, onShare, onToggleStructure }) => {
    const [linkCopied, setLinkCopied] = useState(false);
    
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
                    <div className="flex items-center">
                        <MusicNoteIcon className="w-7 h-7 text-orange-700" />
                        <h1 className="text-3xl font-typewriter text-sepia-800 ml-2">
                            Sonora AI
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                     <button onClick={onNewSong} className={buttonClasses} title="New Song">
                        <FilePlusIcon className="w-6 h-6" />
                    </button>
                     <button onClick={onExport} className={buttonClasses} title="Export as .txt">
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
                </div>
            </div>
        </header>
    );
};
