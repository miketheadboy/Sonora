import React from 'react';

// Using a filter to create a hand-drawn effect
const SketchFilter = () => (
    <svg style={{ visibility: 'hidden', position: 'absolute' }} width="0" height="0" xmlns="http://www.w3.org/2000/svg" version="1.1">
        <defs>
            <filter id="sketch-filter">
                <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" stitchTiles="stitch" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" result="displacement" />
                <feMorphology operator="dilate" radius="0.5" in="displacement" result="fatten" />
                <feGaussianBlur in="fatten" stdDeviation="0.5" result="blur" />
                <feBlend in="SourceGraphic" in2="blur" mode="multiply" />
            </filter>
        </defs>
    </svg>
);

const withSketchFilter = <P extends object>(Component: React.ComponentType<P>): React.FC<P> => {
    return (props: P) => (
        <>
            <SketchFilter />
            <Component {...props} style={{ ...((props as any).style), filter: 'url(#sketch-filter)' }} />
        </>
    );
};

export const MusicNoteIcon: React.FC<React.SVGProps<SVGSVGElement>> = withSketchFilter((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9l10.5-3M9 9l-7.5 3L9 21V9z" />
    </svg>
));

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = withSketchFilter((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.553L16.5 21.75l-.398-1.197a3.375 3.375 0 00-2.456-2.456L12.75 18l1.197-.398a3.375 3.375 0 002.456-2.456L16.5 14.25l.398 1.197a3.375 3.375 0 002.456 2.456L20.25 18l-1.197.398a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
));

export const BookOpenIcon: React.FC<React.SVGProps<SVGSVGElement>> = withSketchFilter((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6-2.292m0 0v14.25" />
    </svg>
));

export const ClipboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = withSketchFilter((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v3.75m-8.5-4.362c-.055.194-.084.4-.084.612v3.75m8.5-4.362c-1.03-.693-2.25-.976-3.5-.976h-1c-1.25 0-2.47.283-3.5.976m10.5 0a2.25 2.25 0 00-2.25-2.25h-3a2.25 2.25 0 00-2.25 2.25m10.5 0c0 .675-.283 1.25-.625 1.625M4.875 14.25c0 .675.283 1.25.625 1.625m13.875-1.625c0 .675-.283 1.25-.625 1.625M6 10.5h12m-12 0a2.25 2.25 0 01-2.25-2.25v-3a2.25 2.25 0 012.25-2.25h12a2.25 2.25 0 012.25 2.25v3a2.25 2.25 0 01-2.25 2.25M6 10.5v4.875c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V10.5" />
  </svg>
));

export const LightbulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = withSketchFilter((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
    <path d="M9 18h6"/>
    <path d="M10 22h4"/>
  </svg>
));

export const LinkIcon: React.FC<React.SVGProps<SVGSVGElement>> = withSketchFilter((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
));

export const MetronomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = withSketchFilter((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m21.88 13.5-9.01-11.4a.49.49 0 0 0-.74 0L3.12 13.5a.48.48 0 0 0 0 .5l9.01 11.4a.49.49 0 0 0 .74 0l9.01-11.4a.48.48 0 0 0 0-.5Z"/>
        <path d="M12 12 4.2 8.5"/>
    </svg>
));

export const PaintBrushIcon: React.FC<React.SVGProps<SVGSVGElement>> = withSketchFilter((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.47 2.118v-.09A18.324 18.324 0 017.433 3.31l.003-.01.007-.021.014-.042.028-.082a.75.75 0 01.276-.445l2.099-1.575a.75.75 0 01.917 0l2.099 1.575a.75.75 0 01.276.445l.028.082.014.042.007.021.003.01a18.324 18.324 0 012.824 12.235v.09a2.25 2.25 0 01-2.47-2.118 3 3 0 00-5.78-1.128z" />
    </svg>
));

export const PlayIcon: React.FC<React.SVGProps<SVGSVGElement>> = withSketchFilter((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
    </svg>
));

export const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = withSketchFilter((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
));

export const BlocksIcon: React.FC<React.SVGProps<SVGSVGElement>> = withSketchFilter((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.03 1.125 0 1.131.094 1.976 1.057 1.976 2.192V7.5M8.25 7.5h7.5M8.25 7.5v3.75c0 1.135-.845 2.098-1.976 2.192a48.424 48.424 0 01-1.125 0c-1.131-.094-1.976-1.057-1.976-2.192V7.5M15.75 7.5v3.75c0 1.135.845 2.098 1.976 2.192.373.03.748-.03 1.125 0 1.131.094 1.976 1.057 1.976 2.192V7.5M8.25 15h7.5M8.25 15v3.75c0 1.135-.845 2.098-1.976 2.192a48.424 48.424 0 01-1.125 0c-1.131-.094-1.976-1.057-1.976-2.192V15m11.25-3.75c.621 0 1.125.504 1.125 1.125v3.75c0 1.135-.845 2.098-1.976 2.192a48.424 48.424 0 01-1.125 0c-1.131-.094-1.976-1.057-1.976-2.192v-3.75c0-.621.504-1.125 1.125-1.125h.375z" />
    </svg>
));

export const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = withSketchFilter((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
));

export const RobotIcon: React.FC<React.SVGProps<SVGSVGElement>> = withSketchFilter((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.008v.008H12v-.008z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15.75h.008v.008H7.5v-.008z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 15.75h.008v.008H16.5v-.008z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5v-3a8.966 8.966 0 012.25-6.066 8.966 8.966 0 0113.5 0A8.966 8.966 0 0121 10.5v3" />
    </svg>
));

export const StethoscopeIcon: React.FC<React.SVGProps<SVGSVGElement>> = withSketchFilter((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.254 0-2.25-1.01-2.25-2.25S10.746 4.5 12 4.5s2.25 1.01 2.25 2.25S13.254 8.25 12 8.25z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 10.5v.75a3 3 0 003 3v.75a3 3 0 003-3v-.75M9 10.5h6m-6 0a3.75 3.75 0 00-3.75 3.75v1.5a3.75 3.75 0 003.75 3.75h6a3.75 3.75 0 003.75-3.75v-1.5a3.75 3.75 0 00-3.75-3.75M9 10.5" />
    </svg>
));

export const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = withSketchFilter((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 016 0v8.25a3 3 0 01-3 3z" />
    </svg>
));

export const StopIcon: React.FC<React.SVGProps<SVGSVGElement>> = withSketchFilter((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
    </svg>
));

export const FilePlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = withSketchFilter((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
));

export const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = withSketchFilter((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
));

export const ShareIcon: React.FC<React.SVGProps<SVGSVGElement>> = withSketchFilter((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.195.025.39.044.585.06a2.25 2.25 0 012.828 0 .934.934 0 010 1.258m-2.828 0a2.25 2.25 0 000 2.186m0-2.186c-.195.025-.39.044-.585.06a2.25 2.25 0 00-2.828 0 .934.934 0 000 1.258m2.828 0a2.25 2.25 0 010 2.186m0-2.186 2.828 2.828m0-11.314a2.25 2.25 0 100-2.186m0 2.186c.195-.025.39-.044.585-.06a2.25 2.25 0 012.828 0 .934.934 0 010 1.258m-2.828 0a2.25 2.25 0 000-2.186m0 2.186c-.195-.025-.39-.044-.585-.06a2.25 2.25 0 00-2.828 0 .934.934 0 000 1.258m2.828 0a2.25 2.25 0 010-2.186m0 2.186-2.828-2.828" />
    </svg>
));

export const PencilSquareIcon: React.FC<React.SVGProps<SVGSVGElement>> = withSketchFilter((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </svg>
));

export const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = withSketchFilter((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
));

export const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = withSketchFilter((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
));

export const Bars3Icon: React.FC<React.SVGProps<SVGSVGElement>> = withSketchFilter((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
));

export const QuillIcon: React.FC<React.SVGProps<SVGSVGElement>> = withSketchFilter((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 19.82a2.25 2.25 0 01-1.61.792H6.375a2.25 2.25 0 01-2.25-2.25v-2.252a2.25 2.25 0 01.792-1.61L16.862 4.487z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125l-1.432-1.432" />
    </svg>
));

export const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = withSketchFilter((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
));

export const ChatBubbleBottomCenterTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = withSketchFilter((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 12.75a6 6 0 00-12 0v4.5m12-4.5v4.5m-6 3.75a3 3 0 116 0v-6.75a3 3 0 10-6 0v6.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.75a8.96 8.96 0 00-1.586-5.036 8.968 8.968 0 00-5.036-1.586 8.968 8.968 0 00-5.036 1.586A8.96 8.96 0 003 12.75v4.5a2.25 2.25 0 002.25 2.25h13.5a2.25 2.25 0 002.25-2.25v-4.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 12h9m-9 3h3" />
    </svg>
));