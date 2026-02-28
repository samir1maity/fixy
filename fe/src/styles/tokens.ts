/**
 * Design tokens for Fixy dashboard.
 * Import these where you need type-safe token references.
 * The actual CSS variables are defined in index.css / tailwind.config.ts.
 */

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px',
  '5xl': '48px',
} as const;

export const sidebar = {
  widthExpanded: 240,
  widthCollapsed: 64,
  transitionMs: 200,
} as const;

export const topbar = {
  height: 56,
} as const;

export const radius = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const;

export const zIndex = {
  sidebar: 40,
  topbar: 50,
  modal: 60,
  tooltip: 70,
} as const;
