import type { MessageKey } from '../../i18n/translations';
import type { Field } from '../field';
import type { Cell, Move } from '../types';

/** A move chosen by an opponent: a cell, plus whether it is a big click. */
export interface AiResult extends Cell {
    bigClick: boolean;
}

/** Source of randomness. Injectable so tests can pin exact behaviour. */
export type Rng = () => number;

/** A computer opponent that decides a move from the current board. */
export interface Ai {
    /** Translation key for the opponent's display name. */
    readonly nameKey: MessageKey;
    /** Shortest delay before playing, in milliseconds. */
    readonly minWait: number;
    /** Longest delay before playing, in milliseconds. */
    readonly maxWait: number;
    play(field: Field, moves: Move[][], empty: Move, p1: Move, p2: Move, canBig: boolean, rng?: Rng): AiResult;
}

/**
 * Fixed-point scale for the probability heuristics. A cell's bomb chance is
 * `idiv(CERTAIN * bombs, free)`, so CERTAIN (the lowest common multiple of 1
 * to 8) stands for a guaranteed bomb without needing floating-point maths.
 */
export const CERTAIN = 840;

/** Mine totals for the whole board and for each player. */
export interface Scores {
    total: number;
    p1: number;
    p2: number;
}

/**
 * Counts the total mines on the board and how many each player has claimed.
 */
export function countScores(field: Field, moves: Move[][], p1: Move, p2: Move): Scores {
    let total = 0;
    let s1 = 0;
    let s2 = 0;
    for (let x = 0; x < field.cols; x++) {
        for (let y = 0; y < field.rows; y++) {
            if (field.cell(x, y) === -1) {
                total++;
                if (moves[x][y] === p1) {
                    s1++;
                }
                if (moves[x][y] === p2) {
                    s2++;
                }
            }
        }
    }
    return { total, p1: s1, p2: s2 };
}

/**
 * Returns the bounds of the 3x3 area around (x, y), clamped to the board edges.
 */
export function neighbourBounds(x: number, y: number, cols: number, rows: number) {
    return {
        xi: x === 0 ? x : x - 1,
        yi: y === 0 ? y : y - 1,
        xf: x === cols - 1 ? x : x + 1,
        yf: y === rows - 1 ? y : y + 1,
    };
}

/**
 * Picks one cell at random from a list, or null when the list is empty.
 */
export function pickAmong(cells: Cell[], rng: Rng): Cell | null {
    if (cells.length === 0) {
        return null;
    }
    return cells[Math.floor(rng() * cells.length)];
}

/**
 * Picks a random empty cell to click, or null when the board is full.
 */
export function pickRandomEmpty(moves: Move[][], empty: Move, rng: Rng): AiResult | null {
    const cells: Cell[] = [];
    for (let x = 0; x < moves.length; x++) {
        for (let y = 0; y < moves[0].length; y++) {
            if (moves[x][y] === empty) {
                cells.push({ x, y });
            }
        }
    }
    const pick = pickAmong(cells, rng);
    return pick ? { ...pick, bigClick: false } : null;
}

/**
 * Picks a random empty cell whose heuristic value matches the target.
 */
export function pickEmptyWithValue(moves: Move[][], empty: Move, grid: number[][], target: number, rng: Rng): AiResult | null {
    const cells: Cell[] = [];
    for (let x = 0; x < moves.length; x++) {
        for (let y = 0; y < moves[0].length; y++) {
            if (moves[x][y] === empty && grid[x][y] === target) {
                cells.push({ x, y });
            }
        }
    }
    const pick = pickAmong(cells, rng);
    return pick ? { ...pick, bigClick: false } : null;
}

/**
 * Chooses where to aim a big click. Only inner cells qualify, since a big click
 * covers a 5x5 area that must stay on the board. Each candidate centre scores
 * the `weight` once for every empty cell it would clear. When `pickMax` is true
 * the winner comes from the top-scoring centres, otherwise from any centre that
 * reaches at least one empty cell. Returns null when no centre reaches an empty
 * cell, so the caller can fall back to a normal click instead of wasting a turn.
 */
export function pickBigTarget(moves: Move[][], empty: Move, cols: number, rows: number, weight: (x: number, y: number) => number, pickMax: boolean, rng: Rng): AiResult | null {
    const score: number[][] = Array.from({ length: cols }, () => new Array(rows).fill(0));
    let best = 0;
    for (let x = 2; x < cols - 2; x++) {
        for (let y = 2; y < rows - 2; y++) {
            let s = 0;
            for (let dx = -2; dx <= 2; dx++) {
                for (let dy = -2; dy <= 2; dy++) {
                    if (moves[x + dx][y + dy] === empty) {
                        s += weight(x, y);
                    }
                }
            }
            score[x][y] = s;
            if (s > best) {
                best = s;
            }
        }
    }
    if (best === 0) {
        return null;
    }
    const cells: Cell[] = [];
    for (let x = 2; x < cols - 2; x++) {
        for (let y = 2; y < rows - 2; y++) {
            if (pickMax ? score[x][y] === best : score[x][y] > 0) {
                cells.push({ x, y });
            }
        }
    }
    const pick = pickAmong(cells, rng);
    return pick ? { ...pick, bigClick: true } : null;
}
