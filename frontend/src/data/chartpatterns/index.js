import { BULLISH_PATTERNS } from './bullish';
import { BEARISH_PATTERNS } from './bearish';
import { SIDEWAYS_PATTERNS } from './sideways';
import { SPECIAL_PATTERNS } from './special';

export const ALL_PATTERNS = [
  ...BULLISH_PATTERNS,
  ...BEARISH_PATTERNS,
  ...SIDEWAYS_PATTERNS,
  ...SPECIAL_PATTERNS
];

export const CATEGORIES = {
  all: { id: 'all', name: 'All Patterns', color: 'var(--text-primary)', bg: 'rgba(255,255,255,0.05)' },
  bullish: { id: 'bullish', name: 'Bullish', color: 'var(--bullish)', bg: 'var(--bullish-bg)' },
  bearish: { id: 'bearish', name: 'Bearish', color: 'var(--bearish)', bg: 'var(--bearish-bg)' },
  sideways: { id: 'sideways', name: 'Sideways', color: 'var(--neutral)', bg: 'var(--neutral-bg)' },
  special: { id: 'special', name: 'Special', color: 'var(--warning)', bg: 'var(--warning-bg)' }
};

export const BADGES = {
  'Best for Swing': { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' }, // Purple
  'Best for Breakout': { color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.15)' }, // Light Blue
  'Best for Trend Following': { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' }, // Emerald
  'Best for Reversal': { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' }, // Amber
  'High Accuracy': { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' }, // Pink
  'Need Volume Confirmation': { color: '#64748b', bg: 'rgba(100, 116, 139, 0.2)' } // Slate
};

export function getPatternById(id) {
  return ALL_PATTERNS.find(pattern => pattern.id === id);
}
