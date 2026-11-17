const pad = (value: number) => String(value).padStart(2, '0');

/** Minutes after midnight as `HH:MM`. */
export function clock(minutes: number) {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

export function timeRange(start: number, duration: number) {
  return `${clock(start)} – ${clock(start + duration)}`;
}

/** Tetri as lari; the decimals appear only when they are needed. */
export function money(tetri: number) {
  return `${(tetri / 100).toFixed(tetri % 100 ? 2 : 0)} ₾`;
}

/** Time left as `M:SS`, rounded up so the display reaches 0:00 exactly when the deadline does. */
export function countdown(remainingMs: number) {
  const seconds = Math.max(0, Math.ceil(remainingMs / 1000));
  return `${Math.floor(seconds / 60)}:${pad(seconds % 60)}`;
}

/** Signed offset in minutes, e.g. `+30` or `−60`, with a typographic minus. */
export function signedMinutes(offset: number) {
  return `${offset > 0 ? '+' : '−'}${Math.abs(offset)}`;
}
