import { clamp } from './utils';

/** Who owns each square in versus mode: nobody, player 1, or player 2. */
export const EMPTY = 0;
export const P1 = 1;
export const P2 = 2;
export type VsMove = typeof EMPTY | typeof P1 | typeof P2;

/** Overall versus game status. */
export type VsStatus = 'active' | 'wonP1' | 'wonP2' | 'draw';

/**
 * Keeps a big-click centre far enough from the edges that its surrounding 5x5
 * area stays fully on a board of the given length.
 */
export function clampBigCenter(v: number, length: number): number {
    return clamp(v, 2, length - 3);
}
