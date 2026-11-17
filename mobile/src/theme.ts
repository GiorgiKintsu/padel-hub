/** Design tokens. Screens and components take every colour, radius and shadow from here. */
export const colors = {
  // Brand
  ink: '#123D32',
  inkSoft: '#294D42',
  lime: '#D8F653',
  limeSoft: '#EDF4D5',
  limeDeep: '#90A64B',

  // Surfaces
  background: '#F5F6F0',
  surface: '#FFFFFF',
  tag: '#E8EEDD',

  // Text
  muted: '#66776F',
  onInk: '#FFFFFF',
  onInkMuted: '#C9D7CA',

  // Lines
  border: '#DFE5DA',
  divider: '#E9EDE4',

  // Status: something needs attention soon / something went wrong
  warning: '#8A5A00',
  warningSoft: '#FFF2CC',
  danger: '#B3261E',
  dangerSoft: '#FCE9E6',
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

/** Soft, green-tinted elevation for cards that sit on the page background. */
export const shadow = {
  card: '0 1px 2px rgba(18, 61, 50, 0.05), 0 10px 28px rgba(18, 61, 50, 0.07)',
  bar: '0 -6px 20px rgba(18, 61, 50, 0.06)',
} as const;

/** Content never grows wider than this, so tablets and the web preview keep a phone-like column. */
export const MAX_CONTENT_WIDTH = 620;
