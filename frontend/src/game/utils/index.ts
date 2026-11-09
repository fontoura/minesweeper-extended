/**
 * Constrains a value to the inclusive range between min and max.
 */
export function clamp(v: number, min: number, max: number): number {
    if (v < min) {
        return min;
    }
    if (v > max) {
        return max;
    }
    return v;
}

/**
 * Builds a cols by rows grid pre-filled with the given value.
 */
export function makeGrid<T>(cols: number, rows: number, value: T): T[][] {
    return Array.from({ length: cols }, () => new Array<T>(rows).fill(value));
}

/**
 * Integer division. The AI heuristics use fixed-point maths, so results are
 * floored to stay in whole numbers.
 */
export const idiv = (a: number, b: number): number => Math.floor(a / b);
