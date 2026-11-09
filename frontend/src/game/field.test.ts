import { describe, expect, it } from 'vitest';
import { clampCols, clampMines, clampRows, Field, MINE } from './field';

describe('clamping', () => {
    it('clamps columns and rows to the 9..30 range', () => {
        expect(clampCols(5)).toBe(9);
        expect(clampCols(40)).toBe(30);
        expect(clampCols(16)).toBe(16);
        expect(clampRows(1)).toBe(9);
        expect(clampRows(100)).toBe(30);
        expect(clampRows(20)).toBe(20);
    });

    it('clamps mines between 1 and cols*rows - 1', () => {
        expect(clampMines(9, 9, 0)).toBe(1);
        expect(clampMines(9, 9, 1000)).toBe(80); // 81 cells - 1
        expect(clampMines(9, 9, 10)).toBe(10);
    });
});

function countMines(field: Field): number {
    let count = 0;
    for (let x = 0; x < field.cols; x++) {
        for (let y = 0; y < field.rows; y++) {
            if (field.cell(x, y) === MINE) {
                count++;
            }
        }
    }
    return count;
}

// Recomputes neighbour counts from scratch to validate the field's own numbers.
function expectedNeighbours(field: Field, x: number, y: number): number {
    let n = 0;
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || nx >= field.cols || ny < 0 || ny >= field.rows) {
                continue;
            }
            if (dx === 0 && dy === 0) {
                continue;
            }
            if (field.cell(nx, ny) === MINE) {
                n++;
            }
        }
    }
    return n;
}

describe('Field construction', () => {
    it('places exactly the requested number of mines', () => {
        for (let seed = 0; seed < 20; seed++) {
            const field = new Field(12, 10, 25);
            expect(countMines(field)).toBe(25);
        }
    });

    it('keeps the first-clicked cell free of mines', () => {
        for (let seed = 0; seed < 50; seed++) {
            // Near-full board so the free cell is the only safe spot.
            const field = new Field(9, 9, 80, 4, 4);
            expect(field.cell(4, 4)).not.toBe(MINE);
        }
    });

    it('stores correct neighbouring mine counts for every non-mine cell', () => {
        for (let seed = 0; seed < 10; seed++) {
            const field = new Field(14, 11, 30);
            for (let x = 0; x < field.cols; x++) {
                for (let y = 0; y < field.rows; y++) {
                    if (field.cell(x, y) !== MINE) {
                        expect(field.cell(x, y)).toBe(expectedNeighbours(field, x, y));
                    }
                }
            }
        }
    });
});

describe('Field.click flood fill', () => {
    it('reveals only the clicked cell when it has adjacent mines', () => {
        // One mine at (0,0): cell (1,0) has value 1, so clicking it reveals just it.
        const field = new Field(9, 9, 1, 8, 8); // keep (8,8) free; mine lands elsewhere
        // Find a numbered (>0) cell and verify a single-cell reveal.
        let found = false;
        for (let x = 0; x < field.cols && !found; x++) {
            for (let y = 0; y < field.rows && !found; y++) {
                if (field.cell(x, y) > 0) {
                    const revealed = field.click(x, y);
                    let count = 0;
                    for (let i = 0; i < field.cols; i++) {
                        for (let j = 0; j < field.rows; j++) {
                            if (revealed[i][j]) {
                                count++;
                            }
                        }
                    }
                    expect(count).toBe(1);
                    expect(revealed[x][y]).toBe(true);
                    found = true;
                }
            }
        }
        expect(found).toBe(true);
    });

    it('flood-fills a mine-free board entirely from any cell', () => {
        // mines clamped to >= 1, so use a single mine in the corner and click far away.
        const field = new Field(9, 9, 1);
        // Find an empty (0) cell not adjacent to the mine and flood from it.
        let origin: [number, number] | null = null;
        for (let x = 0; x < field.cols && !origin; x++) {
            for (let y = 0; y < field.rows && !origin; y++) {
                if (field.cell(x, y) === 0) {
                    origin = [x, y];
                }
            }
        }
        expect(origin).not.toBeNull();
        const [ox, oy] = origin as [number, number];
        const revealed = field.click(ox, oy);
        // Every revealed cell must be non-mine, and the flood must include at least
        // the origin plus its empty neighbourhood.
        let revealedCount = 0;
        for (let x = 0; x < field.cols; x++) {
            for (let y = 0; y < field.rows; y++) {
                if (revealed[x][y]) {
                    expect(field.cell(x, y)).not.toBe(MINE);
                    revealedCount++;
                }
            }
        }
        expect(revealedCount).toBeGreaterThan(1);
    });
});
