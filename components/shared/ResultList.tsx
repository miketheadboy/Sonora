import React from 'react';
import { ClipboardIcon } from '../icons';

interface ResultListProps {
    items: string[];
}

export const ResultList: React.FC<ResultListProps> = ({ items }) => {
    if (items.length === 0) {
        return null;
    }

    return (
        <div className="mt-2 bg-sepia-200/40 p-2 rounded-md max-h-40 overflow-y-auto border border-sepia-200">
            <ul className="space-y-1">
                {items.map((item, index) => (
                    <li key={index} className="text-sm text-sepia-800 flex justify-between items-center bg-cream-100/50 p-1.5 rounded">
                        <span>{item}</span>
                        <button onClick={() => navigator.clipboard.writeText(item)} title="Copy" className="text-sepia-400 hover:text-orange-700 transition-colors flex-shrink-0 p-1">
                            <ClipboardIcon className="w-4 h-4" />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};
