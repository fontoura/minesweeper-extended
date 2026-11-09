/**
 * Turns an asset-pixel size into a scaled CSS length. Every in-game dimension is
 * its natural pixel size times the shared `--unit` scale factor.
 */
export const u = (n: number): string => `calc(var(--unit) * ${n})`;
