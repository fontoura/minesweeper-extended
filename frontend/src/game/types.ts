import type { MessageKey } from '../i18n/translations';

/** A board coordinate, column x and row y. */
export interface Cell {
    x: number;
    y: number;
}

/** What the player has done to a square in single-player mode. */
export const CLOSED = 0;
export const OPEN = 1;
export const FLAG = 2;
export type Move = typeof CLOSED | typeof OPEN | typeof FLAG;

/** Overall single-player game status. */
export type Status = 'uninitialized' | 'active' | 'lost' | 'won';

/** A preset or custom board configuration. */
export interface Difficulty {
    nameKey: MessageKey;
    cols: number;
    rows: number;
    mines: number;
}

/** The standard Minesweeper difficulty presets. */
export const DIFFICULTIES: Difficulty[] = [
    { nameKey: 'difficulty.beginner', cols: 9, rows: 9, mines: 10 },
    { nameKey: 'difficulty.intermediate', cols: 16, rows: 16, mines: 40 },
    { nameKey: 'difficulty.expert', cols: 30, rows: 16, mines: 99 },
];
