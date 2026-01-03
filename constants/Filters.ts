import { FilterType } from '../types';

export interface FilterConfig {
  id: FilterType;
  name: string;
  icon: string;
  description: string;
}

export const FILTERS: FilterConfig[] = [
  { 
    id: 'original', 
    name: 'Original', 
    icon: '📷',
    description: 'No filter applied'
  },
  { 
    id: 'bw', 
    name: 'B&W', 
    icon: '⚫',
    description: 'Black and white'
  },
  { 
    id: 'grayscale', 
    name: 'Grayscale', 
    icon: '🌫️',
    description: 'Shades of gray'
  },
  { 
    id: 'highContrast', 
    name: 'High Contrast', 
    icon: '🔆',
    description: 'Enhanced contrast'
  },
];