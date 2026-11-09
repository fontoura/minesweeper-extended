import { field, fieldImages, size } from '../game/assets';
import { type Field, MINE } from '../game/field';
import { type Cell, FLAG, type Move, OPEN, type Status } from '../game/types';
import { u } from '../utils/unit';

interface BoardProps {
    cols: number;
    rows: number;
    moves: Move[][];
    field: Field | null;
    status: Status;
    explosion: Cell | null;
    pressed: Cell | null;
    onReveal: (x: number, y: number) => void;
    onFlag: (x: number, y: number) => void;
    onPressChange: (cell: Cell | null) => void;
}

/**
 * Chooses the image for one cell from the current game status and player moves.
 */
function cellImage(p: BoardProps, x: number, y: number): string {
    const move = p.moves[x][y];
    const value = p.field ? p.field.cell(x, y) : 0;
    const isPressed = p.pressed?.x === x && p.pressed?.y === y;

    if (p.status === 'uninitialized') {
        if (isPressed) {
            return field.pressed;
        }
        if (move === FLAG) {
            return field.flag;
        }
        return field.closed;
    }
    if (p.status === 'active') {
        if (move === FLAG) {
            return field.flag;
        }
        if (move === OPEN) {
            return fieldImages[value];
        }
        if (isPressed) {
            return field.pressed;
        }
        return field.closed;
    }
    if (p.status === 'lost') {
        if (p.explosion && x === p.explosion.x && y === p.explosion.y) {
            return field.explosion;
        }
        if (move === FLAG) {
            return value === MINE ? field.flag : field.wrong;
        }
        if (value === MINE) {
            return field.mine;
        }
        if (move === OPEN) {
            return fieldImages[value];
        }
        return field.closed;
    }
    // won
    if (value === MINE) {
        return field.flag;
    }
    return fieldImages[value];
}

/**
 * Renders the single-player minefield grid inside its sunken border frame, and
 * turns mouse input into reveal, flag, and press-feedback callbacks.
 */
export default function Board(props: BoardProps) {
    const { cols, rows, onReveal, onFlag, onPressChange } = props;

    const cells = [];
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            cells.push(
                <img
                    key={`${x},${y}`}
                    className="cell"
                    src={cellImage(props, x, y)}
                    alt=""
                    draggable={false}
                    onMouseDown={(e) => {
                        if (e.button === 0) {
                            onPressChange({ x, y });
                        }
                    }}
                    onMouseEnter={(e) => {
                        if (e.buttons & 1) {
                            onPressChange({ x, y });
                        }
                    }}
                    onMouseUp={(e) => {
                        onPressChange(null);
                        if (e.button === 0) {
                            onReveal(x, y);
                        }
                    }}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        onFlag(x, y);
                    }}
                />,
            );
        }
    }

    const bevel = u(2);
    return (
        <div
            className="board"
            onMouseLeave={() => onPressChange(null)}
            style={{
                paddingTop: u(size.borderTop - 2),
                paddingBottom: u(size.borderBottom - 2),
                paddingLeft: u(size.borderLeft - 2),
                paddingRight: u(size.borderRight - 2),
                borderWidth: bevel,
                borderStyle: 'solid',
                // Raised outer frame (highlight top-left, shadow bottom-right).
                borderColor: '#ffffff #7b7b7b #7b7b7b #ffffff',
            }}
        >
            <div
                className="grid"
                style={{
                    gridTemplateColumns: `repeat(${cols}, ${u(size.cell)})`,
                    gridTemplateRows: `repeat(${rows}, ${u(size.cell)})`,
                    borderWidth: bevel,
                    borderStyle: 'solid',
                    // Sunken inner edge around the field (shadow top-left).
                    borderColor: '#7b7b7b #ffffff #ffffff #7b7b7b',
                }}
            >
                {cells}
            </div>
        </div>
    );
}
