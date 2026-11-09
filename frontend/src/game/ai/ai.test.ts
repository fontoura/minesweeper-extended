import { describe, expect, it } from 'vitest';
import type { Field } from '../field';
import { MINE } from '../field';
import type { Move } from '../types';
import { makeGrid } from '../utils';
import { EMPTY, P1, P2, type VsMove } from '../versusTypes';
import { AI_KINDS } from './index';

// Minimal deterministic stand-in for Field: the AIs only read cols/rows/mines
// and cell(x, y), so we can drive them with a fixed mine layout.
function fakeField(cells: number[][]): Field {
    const cols = cells.length;
    const rows = cells[0].length;
    let mines = 0;
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            if (cells[x][y] === MINE) {
                mines++;
            }
        }
    }
    return {
        cols,
        rows,
        mines,
        cell: (x: number, y: number) => cells[x][y],
    } as unknown as Field;
}

// A big click claims a 5x5 area centred (and clamped) on (cx, cy); it is only a
// real move if that area contains at least one empty cell.
function bigAreaHasEmpty(moves: VsMove[][], cx: number, cy: number): boolean {
    const cols = moves.length;
    const rows = moves[0].length;
    const sx = cx < 2 ? 2 : Math.min(cx, cols - 3);
    const sy = cy < 2 ? 2 : Math.min(cy, rows - 3);
    for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 2; dy++) {
            if (moves[sx + dx][sy + dy] === EMPTY) {
                return true;
            }
        }
    }
    return false;
}

// A pseudo-random generator so the property test is deterministic/reproducible.
function makeRng(seed: number): () => number {
    let s = seed >>> 0;
    return () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 0xffffffff;
    };
}

// The invariant every opponent must uphold: on an active board that still has at
// least one empty cell, the chosen move must be *actionable* - a normal click on
// an empty cell, or a big click whose 5x5 area contains an empty cell. A move
// that is neither would be a no-op and freeze the turn.
function assertActionable(moves: VsMove[][], result: { x: number; y: number; bigClick: boolean }) {
    if (result.bigClick) {
        expect(bigAreaHasEmpty(moves, result.x, result.y)).toBe(true);
    } else {
        expect(moves[result.x][result.y]).toBe(EMPTY);
    }
}

describe('AI opponents always return an actionable move', () => {
    for (const ai of AI_KINDS) {
        it(`${ai.nameKey}: actionable across many random mid-game states`, () => {
            const cols = 16;
            const rows = 16;
            const rand = makeRng(0x1234 + ai.nameKey.length);

            for (let trial = 0; trial < 200; trial++) {
                // Random mine layout.
                const cells = makeGrid(cols, rows, 0);
                for (let x = 0; x < cols; x++) {
                    for (let y = 0; y < rows; y++) {
                        if (rand() < 0.2) {
                            cells[x][y] = MINE;
                        }
                    }
                }
                const field = fakeField(cells);

                // Random partially-played board that still has empty cells, with P1
                // generally ahead so the big-click thresholds get exercised.
                const moves = makeGrid<VsMove>(cols, rows, EMPTY);
                let emptyCount = 0;
                for (let x = 0; x < cols; x++) {
                    for (let y = 0; y < rows; y++) {
                        const r = rand();
                        if (r < 0.6) {
                            moves[x][y] = P1;
                        } else if (r < 0.7) {
                            moves[x][y] = P2;
                        } else {
                            emptyCount++;
                        }
                    }
                }
                if (emptyCount === 0) {
                    continue; // skip finished boards
                }

                const canBig = rand() < 0.5;
                const result = ai.play(field, moves as unknown as Move[][], EMPTY, P1, P2, canBig, rand);
                assertActionable(moves, result);
            }
        });
    }
});

describe('AI is deterministic when given a fixed rng', () => {
    for (const ai of AI_KINDS) {
        it(`${ai.nameKey}: same rng seed yields the same move`, () => {
            const cols = 16;
            const rows = 16;
            const cells = makeGrid(cols, rows, 0);
            cells[5][5] = MINE;
            cells[8][9] = MINE;
            const field = fakeField(cells);
            const moves = makeGrid<VsMove>(cols, rows, EMPTY);

            const a = ai.play(field, moves as unknown as Move[][], EMPTY, P1, P2, false, makeRng(42));
            const b = ai.play(field, moves as unknown as Move[][], EMPTY, P1, P2, false, makeRng(42));
            expect(a).toEqual(b);
        });
    }
});
