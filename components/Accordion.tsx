
import React, { useState, ReactNode } from 'react';
import { ChevronUpIcon } from './icons';

interface AccordionSectionProps {
    title: string;
    children: ReactNode;
    isOpen?: boolean;
    onClick?: () => void;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ title, children, isOpen, onClick }) => {
    return (
        <div className="border-b border-sepia-200">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center p-3 text-left font-typewriter font-bold text-sepia-800 hover:bg-sepia-200/40"
            >
                <span>{title}</span>
                <ChevronUpIcon
                    className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''
                        }`}
                />
            </button>
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px]' : 'max-h-0'
                    }`}
            >
                <div className="p-3">
                    {children}
                </div>
            </div>
        </div>
    );
};

interface AccordionProps {
    children: React.ReactElement<AccordionSectionProps>[];
    allowMultipleOpen?: boolean;
    defaultOpenIndex?: number | number[];
}

export const Accordion: React.FC<AccordionProps> & { Section: React.FC<AccordionSectionProps> } = ({ children, allowMultipleOpen = false, defaultOpenIndex = [0] }) => {
    const [openSections, setOpenSections] = useState<number[]>(Array.isArray(defaultOpenIndex) ? defaultOpenIndex : typeof defaultOpenIndex === 'number' ? [defaultOpenIndex] : []);

    const handleSectionClick = (index: number) => {
        setOpenSections(prevOpen => {
            const isOpen = prevOpen.includes(index);
            if (allowMultipleOpen) {
                return isOpen ? prevOpen.filter(i => i !== index) : [...prevOpen, index];
            } else {
                return isOpen ? [] : [index];
            }
        });
    };

    return (
        <div>
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, {
                        isOpen: openSections.includes(index),
                        onClick: () => handleSectionClick(index),
                    });
                }
                return child;
            })}
        </div>
    );
};

// This allows creating sections directly inside Accordion without importing AccordionSection
Accordion.Section = AccordionSection;
