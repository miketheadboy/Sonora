import type { SectionType } from './types';

export const MUSICAL_KEYS = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

export const SONG_MOODS = [
    'Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Epic', 'Melancholic', 'Hopeful', 'Dark', 'Mysterious'
];

export const SONG_GENRES = [
    'Pop', 'Rock', 'Jazz', 'Folk', 'R&B', 'Electronic', 'Blues', 'Country', 'Hip-Hop'
];

export const CHORD_COMPLEXITIES = [
    'Simple',
    'Intermediate',
    'Advanced'
];

export const SECTION_TYPES: SectionType[] = ['Intro', 'Verse', 'Pre-Chorus', 'Chorus', 'Bridge', 'Solo', 'Outro'];

export const CHORD_FUNCTION_COLORS: Record<string, string> = {
    'tonic': 'bg-orange-700 border-orange-800 text-cream-100',
    'subdominant': 'bg-teal-700 border-teal-800 text-cream-100',
    'dominant': 'bg-orange-800 border-orange-900 text-cream-100',
    'predominant': 'bg-teal-600 border-teal-700 text-cream-100',
    'leading-tone': 'bg-sepia-400 border-sepia-500 text-sepia-900',
    'secondary-dominant': 'bg-orange-600 border-orange-700 text-cream-100',
    'other': 'bg-sepia-300 border-sepia-400 text-sepia-800',
};

// Custom Tailwind colors to be used in class definitions
export const customColors = {
  cream: {
    DEFAULT: '#f5f3f0', // background
    100: '#fffffb', // lightest elements
    200: '#e5e2de', // borders
  },
  sepia: {
    DEFAULT: '#4a4137', // base text
    200: '#dcd9d4', // light bg
    300: '#c3bfb9', // borders
    400: '#aba59f', // muted elements
    800: '#5a5147', // dark text
    900: '#3a3127', // darkest text
  },
  accent: {
    DEFAULT: '#c2410c', // burnt orange
    600: '#a33100', // darker orange
    700: '#c2410c'
  },
  secondary: {
      DEFAULT: '#115e59', // dark teal
      600: '#0f524e',
      700: '#115e59'
  }
};
