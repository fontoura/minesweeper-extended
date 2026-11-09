import { clamp, makeGrid } from './utils';

export const MINE = -1;

export const MIN_ROWS = 9;
export const MAX_ROWS = 30;
export const MIN_COLS = 9;
export const MAX_COLS = 30;

/**
 * Forces a column count into the allowed board range.
 */
export function clampCols(cols: number): number {
    return clamp(cols, MIN_COLS, MAX_COLS);
}

/**
 * Forces a row count into the allowed board range.
 */
export function clampRows(rows: number): number {
    return clamp(rows, MIN_ROWS, MAX_ROWS);
}

/**
 * Forces a mine count into a playable range for the given board size.
 * There must be at least one mine and at least one safe cell.
 */
export function clampMines(cols: number, rows: number, mines: number): number {
    return clamp(mines, 1, cols * rows - 1);
}

/**
 * The static contents of a minefield: for each square, whether it is a mine or
 * how many mines sit next to it. It does not track player moves such as flags
 * or revealed cells; that belongs to the game state.
 *
 * `cols` is the number of columns (x axis), `rows` the number of rows (y axis).
 */
export class Field {
    readonly cols: number;
    readonly rows: number;
    readonly mines: number;
    /** cells[x][y] is MINE, or the count of neighbouring mines (0 to 8). */
    private readonly cells: number[][];

    /**
     * Creates a field and scatters the mines at random. When a free cell is
     * given (the first cell the player clicks), it is guaranteed to stay safe.
     */
    constructor(cols: number, rows: number, mines: number, freeX = -1, freeY = -1) {
        this.cols = clampCols(cols);
        this.rows = clampRows(rows);
        this.mines = clampMines(this.cols, this.rows, mines);

        this.cells = makeGrid(this.cols, this.rows, 0);

        // Scatter the mines, keeping the first-clicked cell free.
        let freeTotal = this.cols * this.rows;
        if (freeX >= 0 && freeX < this.cols && freeY >= 0 && freeY < this.rows) {
            freeTotal--;
        }

        for (let i = 0; i < this.mines; i++) {
            let selected = Math.floor(Math.random() * freeTotal);
            placing: for (let x = 0; x < this.cols; x++) {
                for (let y = 0; y < this.rows; y++) {
                    if ((x !== freeX || y !== freeY) && this.cells[x][y] !== MINE) {
                        if (selected === 0) {
                            freeTotal--;
                            this.cells[x][y] = MINE;
                            const x1 = x > 0 ? x - 1 : 0;
                            const y1 = y > 0 ? y - 1 : 0;
                            const x2 = x < this.cols - 1 ? x + 1 : x;
                            const y2 = y < this.rows - 1 ? y + 1 : y;
                            for (let xs = x1; xs <= x2; xs++) {
                                for (let ys = y1; ys <= y2; ys++) {
                                    if (this.cells[xs][ys] !== MINE) {
                                        this.cells[xs][ys]++;
                                    }
                                }
                            }
                            break placing;
                        }
                        selected--;
                    }
                }
            }
        }
    }

    /**
     * Returns the contents of a single cell (MINE or a neighbour count).
     */
    cell(x: number, y: number): number {
        return this.cells[x][y];
    }

    /**
     * Works out which cells open up when the player clicks (x, y). Empty cells
     * flood outwards and pull in their neighbours, just like classic Minesweeper.
     * Returns a grid flagging every cell that should be revealed.
     */
    click(x: number, y: number): boolean[][] {
        // temp: 0 = untouched, 1 = to visit, 2 = visited
        const temp = makeGrid(this.cols, this.rows, 0);
        const result = makeGrid(this.cols, this.rows, false);

        temp[x][y] = 1;
        result[x][y] = true;

        let keepGoing = true;
        while (keepGoing) {
            keepGoing = false;
            for (let xn = 0; xn < this.cols; xn++) {
                for (let yn = 0; yn < this.rows; yn++) {
                    if (temp[xn][yn] === 1) {
                        temp[xn][yn] = 2;
                        if (this.cells[xn][yn] === 0) {
                            keepGoing = true;
                            const x1 = xn > 0 ? xn - 1 : 0;
                            const y1 = yn > 0 ? yn - 1 : 0;
                            const x2 = xn < this.cols - 1 ? xn + 1 : xn;
                            const y2 = yn < this.rows - 1 ? yn + 1 : yn;
                            for (let xp = x1; xp <= x2; xp++) {
                                for (let yp = y1; yp <= y2; yp++) {
                                    if (temp[xp][yp] === 0) {
                                        temp[xp][yp] = 1;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        for (let xn = 0; xn < this.cols; xn++) {
            for (let yn = 0; yn < this.rows; yn++) {
                if (temp[xn][yn] === 2) {
                    result[xn][yn] = true;
                }
            }
        }

        return result;
    }
}
