import type { ReactElement } from 'react';
import { field, fieldImages, selector, size } from '../game/assets';
import { type Field, MINE } from '../game/field';
import type { Cell } from '../game/types';
import { clampBigCenter, EMPTY, P1, P2, type VsMove, type VsStatus } from '../game/versusTypes';
import { u } from '../utils/unit';

interface Props {
    cols: number;
    rows: number;
    moves: VsMove[][];
    field: Field;
    status: VsStatus;
    pressed: Cell | null;
    hover: Cell | null;
    turn: VsMove;
    humanTurn: boolean;
    bigActive: boolean;
    bigPossible: boolean;
    last1: Cell | null;
    last2: Cell | null;
    onMove: (x: number, y: number) => void;
    onPressChange: (cell: Cell | null) => void;
    onHover: (cell: Cell | null) => void;
}

/**
 * Resolves the image to render for one versus board cell.
 */
function cellImage(p: Props, x: number, y: number): string {
    const move = p.moves[x][y];
    const value = p.field.cell(x, y);
    const isMine = value === MINE;

    if (p.status === 'active') {
        if (move === EMPTY) {
            if (p.pressed && p.pressed.x === x && p.pressed.y === y) {
                return field.pressed;
            }
            return field.closed;
        }
        if (isMine) {
            return move === P1 ? field.p1 : field.p2;
        }
        return fieldImages[value];
    }
    if (p.status === 'wonP1') {
        if (move === EMPTY) {
            return isMine ? field.mine : field.closed;
        }
        if (isMine) {
            return move === P1 ? field.p1 : field.explosion;
        }
        return fieldImages[value];
    }
    if (p.status === 'wonP2') {
        if (move === EMPTY) {
            return isMine ? field.mine : field.closed;
        }
        if (isMine) {
            return move === P2 ? field.p2 : field.explosion;
        }
        return fieldImages[value];
    }
    // draw
    if (move === EMPTY) {
        return field.closed;
    }
    if (isMine) {
        return field.mine;
    }
    return fieldImages[value];
}

/**
 * Clamps a hovered cell to a valid big-click selector center.
 */
function clampSelectorCenter(cell: Cell, cols: number, rows: number): Cell {
    return {
        x: clampBigCenter(cell.x, cols),
        y: clampBigCenter(cell.y, rows),
    };
}

/**
 * Renders the versus minefield with claimed mines and selector overlays.
 */
export default function VersusBoard(props: Props) {
    const { cols, rows, onMove, onPressChange, onHover } = props;

    const cells: ReactElement[] = [];
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
                    onMouseEnter={() => onHover({ x, y })}
                    onMouseUp={(e) => {
                        onPressChange(null);
                        if (e.button === 0) {
                            onMove(x, y);
                        }
                    }}
                />,
            );
        }
    }

    // Selector overlays (positioned in cell units over the grid).
    const selectors: ReactElement[] = [];
    /**
     * Adds one selector overlay sprite at cell-space coordinates.
     */
    const addSelector = (img: string, cx: number, cy: number, span: number, key: string) => {
        selectors.push(
            <img
                key={key}
                className="selector"
                src={img}
                alt=""
                draggable={false}
                style={{
                    left: u(cx * size.cell),
                    top: u(cy * size.cell),
                    width: u(span * size.cell),
                    height: u(span * size.cell),
                }}
            />,
        );
    };

    if (props.status === 'active') {
        if (props.last1) {
            addSelector(selector.p1, props.last1.x - 1, props.last1.y - 1, 3, 'last1');
        }
        if (props.last2) {
            addSelector(selector.p2, props.last2.x - 1, props.last2.y - 1, 3, 'last2');
        }

        const h = props.hover;
        if (h && props.humanTurn && h.x >= 0 && h.x < cols && h.y >= 0 && h.y < rows) {
            const big = props.bigActive && props.bigPossible;
            const isP1 = props.turn === P1;
            if (big) {
                const clamped = clampSelectorCenter(h, cols, rows);
                addSelector(isP1 ? selector.bigP1 : selector.bigP2, clamped.x - 3, clamped.y - 3, 7, 'hoverBig');
            } else {
                addSelector(isP1 ? selector.p1 : selector.p2, h.x - 1, h.y - 1, 3, 'hover');
            }
        }
    }

    const bevel = u(2);
    return (
        <div
            className="board"
            onMouseLeave={() => {
                onPressChange(null);
                onHover(null);
            }}
            style={{
                paddingTop: u(size.borderTop - 2),
                paddingBottom: u(size.borderBottom - 2),
                paddingLeft: u(size.borderLeft - 2),
                paddingRight: u(size.borderRight - 2),
                borderWidth: bevel,
                borderStyle: 'solid',
                borderColor: '#ffffff #7b7b7b #7b7b7b #ffffff',
            }}
        >
            <div
                className="grid"
                style={{
                    position: 'relative',
                    gridTemplateColumns: `repeat(${cols}, ${u(size.cell)})`,
                    gridTemplateRows: `repeat(${rows}, ${u(size.cell)})`,
                    borderWidth: bevel,
                    borderStyle: 'solid',
                    borderColor: '#7b7b7b #ffffff #ffffff #7b7b7b',
                }}
            >
                {cells}
                <div className="selectors">{selectors}</div>
            </div>
        </div>
    );
}
