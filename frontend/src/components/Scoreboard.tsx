import { digit, digitImages, size } from '../game/assets';
import { u } from '../utils/unit';

const MINUS = -1;
const BLANK = -2;

/**
 * Splits a number into fixed-width display digits, ordered for rendering.
 * Leading positions are blank, and a negative value adds a minus sign.
 */
function digitsFor(value: number, length: number): number[] {
    const negative = value < 0;
    let temp = negative ? -value : value;

    let count = 0;
    do {
        count++;
        temp = Math.floor(temp / 10);
    } while (temp > 0);
    if (count > length) {
        count = length;
    }

    const out = new Array<number>(length).fill(BLANK);
    temp = negative ? -value : value;
    for (let i = 0; i < count; i++) {
        out[i] = temp % 10;
        temp = Math.floor(temp / 10);
    }
    if (negative && count < length) {
        out[count] = MINUS;
    }

    // Digits are filled least-significant first; reverse for rendering.
    return out.reverse();
}

/** Maps a display digit (or the minus / blank markers) to its image. */
function imageFor(d: number): string {
    if (d === MINUS) {
        return digit.minus;
    }
    if (d === BLANK) {
        return digit.blank;
    }
    return digitImages[d];
}

/**
 * A fixed-width numeric display framed by a sunken border, used for both the
 * mine counter and the timer.
 */
export default function Scoreboard({ value, length = 3 }: { value: number; length?: number }) {
    const digits = digitsFor(value, length);
    return (
        <div className="scoreboard">
            {digits.map((d, i) => (
                <img
                    key={`pos-${i}`}
                    className="digit"
                    src={imageFor(d)}
                    alt=""
                    style={{
                        width: u(size.digitW),
                        height: u(size.digitH),
                    }}
                />
            ))}
        </div>
    );
}
