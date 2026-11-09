import { type Field, MINE } from '../field';
import type { Move } from '../types';
import { idiv, makeGrid } from '../utils';
import { type Ai, type AiResult, CERTAIN, countScores, neighbourBounds, pickBigTarget, pickEmptyWithValue, type Rng } from './ai';

/**
 * The medium opponent. It clicks the empty cell most likely to hide a bomb,
 * estimated from the revealed numbers, and uses a big click when ahead.
 */
class MediumAi implements Ai {
    readonly nameKey = 'ai.medium' as const;
    readonly minWait = 500;
    readonly maxWait = 1000;

    play(field: Field, moves: Move[][], empty: Move, p1: Move, p2: Move, canBig: boolean, rng: Rng = Math.random): AiResult {
        const { cols, rows } = field;
        const { total, p1: pts1, p2: pts2 } = countScores(field, moves, p1, p2);

        // Big click: prefer the inner 5x5 area covering the most empty cells.
        if (canBig && (pts1 >= idiv(40 * total, 100) || pts1 - pts2 > idiv(15 * total, 100))) {
            const big = pickBigTarget(moves, empty, cols, rows, () => 1, true, rng);
            if (big) {
                return big;
            }
        }

        // Estimate bomb probability around each revealed number, then propagate
        // the max to each empty cell; click the empty cell with the highest value.
        const prob = makeGrid(cols, rows, 0);
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                if (field.cell(x, y) !== MINE && moves[x][y] !== empty) {
                    const { xi, yi, xf, yf } = neighbourBounds(x, y, cols, rows);
                    let freeN = 0;
                    let bombsN = 0;
                    for (let x2 = xi; x2 <= xf; x2++) {
                        for (let y2 = yi; y2 <= yf; y2++) {
                            if (moves[x2][y2] === empty) {
                                freeN++;
                                if (field.cell(x2, y2) === MINE) {
                                    bombsN++;
                                }
                            }
                        }
                    }
                    prob[x][y] = freeN === 0 ? 0 : idiv(CERTAIN * bombsN, freeN);
                }
            }
        }
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                if (moves[x][y] === empty) {
                    const { xi, yi, xf, yf } = neighbourBounds(x, y, cols, rows);
                    for (let x2 = xi; x2 <= xf; x2++) {
                        for (let y2 = yi; y2 <= yf; y2++) {
                            if (moves[x2][y2] !== empty && prob[x][y] < prob[x2][y2]) {
                                prob[x][y] = prob[x2][y2];
                            }
                        }
                    }
                }
            }
        }
        let best = 0;
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                if (moves[x][y] === empty && prob[x][y] > best) {
                    best = prob[x][y];
                }
            }
        }
        return pickEmptyWithValue(moves, empty, prob, best, rng) ?? { x: 0, y: 0, bigClick: false };
    }
}

/** Shared singleton for the medium opponent. */
export const mediumAi: Ai = new MediumAi();
