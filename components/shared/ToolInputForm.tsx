import React from 'react';

interface ToolInputFormProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    placeholder: string;
    buttonText: string;
}

export const ToolInputForm: React.FC<ToolInputFormProps> = ({ value, onChange, onSubmit, placeholder, buttonText }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            onSubmit();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="flex-grow w-full bg-cream-100 text-sepia-900 border border-sepia-300 rounded-md px-3 py-2 text-sm placeholder-sepia-400 focus:outline-none focus:ring-1 focus:ring-orange-700 focus:border-orange-700"
            />
            <button type="submit" className="w-auto bg-orange-700 hover:bg-orange-600 text-cream-100 font-semibold text-sm px-4 py-2 rounded-md transition-all duration-200 shadow-sm border-b-2 border-orange-900/50 disabled:opacity-50" disabled={!value.trim()}>
                {buttonText}
            </button>
        </form>
    );
};
