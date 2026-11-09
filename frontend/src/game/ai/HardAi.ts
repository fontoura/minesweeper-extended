import { type Field, MINE } from '../field';
import type { Move } from '../types';
import { idiv, makeGrid } from '../utils';
import { type Ai, type AiResult, CERTAIN, countScores, neighbourBounds, pickBigTarget, pickEmptyWithValue, pickRandomEmpty, type Rng } from './ai';

const DIFF_PCT = 20;
const FULL_PCT = 45;

/**
 * The hard opponent. It runs layered probability analysis over the board (two
 * passes of "centres" and "orbits") to find the cell most likely to score, and
 * spends big clicks where they clear the most useful ground.
 */
class HardAi implements Ai {
    readonly nameKey = 'ai.hard' as const;
    readonly minWait = 400;
    readonly maxWait = 1200;

    play(field: Field, moves: Move[][], empty: Move, p1: Move, p2: Move, canBig: boolean, rng: Rng = Math.random): AiResult {
        const { cols, rows } = field;
        const ai = makeGrid(cols, rows, 0);
        const { p1: pts1, p2: pts2 } = countScores(field, moves, p1, p2);

        const bounds = (x: number, y: number) => neighbourBounds(x, y, cols, rows);

        // Two passes of centres + orbits (simple then complex).
        const computeCentres = (useOrbitFilter: boolean) => {
            for (let x = 0; x < cols; x++) {
                for (let y = 0; y < rows; y++) {
                    if (moves[x][y] !== empty && field.cell(x, y) !== MINE) {
                        const { xi, yi, xf, yf } = bounds(x, y);
                        let free = 0;
                        let bombs = 0;
                        for (let x2 = xi; x2 <= xf; x2++) {
                            for (let y2 = yi; y2 <= yf; y2++) {
                                if (moves[x2][y2] === empty) {
                                    if (!useOrbitFilter || ai[x2][y2] !== 0) {
                                        free++;
                                    }
                                    if (field.cell(x2, y2) === MINE) {
                                        bombs++;
                                    }
                                }
                            }
                        }
                        ai[x][y] = free > 0 ? idiv(CERTAIN * bombs, free) : 0;
                    }
                }
            }
        };
        const computeOrbits = () => {
            for (let x = 0; x < cols; x++) {
                for (let y = 0; y < rows; y++) {
                    if (moves[x][y] === empty) {
                        const { xi, yi, xf, yf } = bounds(x, y);
                        ai[x][y] = 0;
                        for (let x2 = xi; x2 <= xf; x2++) {
                            for (let y2 = yi; y2 <= yf; y2++) {
                                if (moves[x2][y2] !== empty && field.cell(x2, y2) !== MINE) {
                                    if (ai[x][y] < ai[x2][y2]) {
                                        ai[x][y] = ai[x2][y2];
                                    }
                                }
                            }
                        }
                    }
                }
            }
            for (let x = 0; x < cols; x++) {
                for (let y = 0; y < rows; y++) {
                    if (moves[x][y] === empty) {
                        const { xi, yi, xf, yf } = bounds(x, y);
                        for (let x2 = xi; x2 <= xf; x2++) {
                            for (let y2 = yi; y2 <= yf; y2++) {
                                if (moves[x2][y2] !== empty && field.cell(x2, y2) !== MINE) {
                                    if (ai[x2][y2] === 0) {
                                        ai[x][y] = 0;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        computeCentres(false);
        computeOrbits();
        computeCentres(true);
        computeOrbits();

        let best = 0;
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                if (moves[x][y] === empty && ai[x][y] > best) {
                    best = ai[x][y];
                }
            }
        }

        const wantBig = canBig && (pts1 >= idiv(FULL_PCT * field.mines, 100) || pts1 - pts2 > idiv(DIFF_PCT * field.mines, 100));
        // Big clicks weight each candidate area by its orbit value (+100 bias so a
        // zero-orbit empty cell still counts), picking the richest 5x5 region.
        const bigWeighted = (x: number, y: number) => 100 + ai[x][y];

        if (best > 0) {
            // Avoid wasting a big click on a 100%-certain cell we can just take.
            if (wantBig && best !== CERTAIN) {
                const big = pickBigTarget(moves, empty, cols, rows, bigWeighted, true, rng);
                if (big) {
                    return big;
                }
            }
            return pickEmptyWithValue(moves, empty, ai, best, rng) ?? { x: 0, y: 0, bigClick: false };
        }

        // No potential bombs around: try a big click, else fall back below.
        if (wantBig) {
            const big = pickBigTarget(moves, empty, cols, rows, () => 1, false, rng);
            if (big) {
                return big;
            }
        }

        // Count how many claimed mines border each empty cell, and click the
        // empty cell adjacent to the most mines (best chance of scoring).
        const adj = makeGrid(cols, rows, 0);
        let bestAdj = 0;
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                if (moves[x][y] === empty) {
                    const { xi, yi, xf, yf } = bounds(x, y);
                    for (let x2 = xi; x2 <= xf; x2++) {
                        for (let y2 = yi; y2 <= yf; y2++) {
                            if (moves[x2][y2] !== empty && field.cell(x2, y2) === MINE) {
                                adj[x][y]++;
                            }
                        }
                    }
                    if (adj[x][y] > bestAdj) {
                        bestAdj = adj[x][y];
                    }
                }
            }
        }
        if (bestAdj > 0) {
            return pickEmptyWithValue(moves, empty, adj, bestAdj, rng) ?? { x: 0, y: 0, bigClick: false };
        }

        // Otherwise, any empty cell.
        return pickRandomEmpty(moves, empty, rng) ?? { x: 0, y: 0, bigClick: false };
    }
}

/** Shared singleton for the hard opponent. */
export const hardAi: Ai = new HardAi();
