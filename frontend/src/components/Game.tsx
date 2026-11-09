import { type CSSProperties, useCallback, useEffect, useState } from 'react';
import { Field, MINE } from '../game/field';
import { type Cell, CLOSED, FLAG, type Move, OPEN, type Status } from '../game/types';
import { makeGrid } from '../game/utils';
import { useI18n } from '../i18n/I18nContext';
import { useBoardScale } from '../utils/useBoardScale';
import Board from './Board';
import TopPanel from './TopPanel';

interface Props {
    cols: number;
    rows: number;
    mines: number;
    onExit: () => void;
}

function emptyMoves(cols: number, rows: number): Move[][] {
    return makeGrid<Move>(cols, rows, CLOSED);
}

/**
 * The single-player game. It owns the field, the player's moves, and the game
 * status, and connects the board and top panel together.
 */
export default function Game({ cols, rows, mines, onExit }: Props) {
    const { t } = useI18n();
    const [field, setField] = useState<Field | null>(null);
    const [moves, setMoves] = useState<Move[][]>(() => emptyMoves(cols, rows));
    const [status, setStatus] = useState<Status>('uninitialized');
    const [explosion, setExplosion] = useState<Cell | null>(null);
    const [pressed, setPressed] = useState<Cell | null>(null);
    const [time, setTime] = useState(0);

    // Timer: runs only while the game is active.
    useEffect(() => {
        if (status !== 'active') {
            return;
        }
        const id = setInterval(() => setTime((t) => (t < 999 ? t + 1 : t)), 1000);
        return () => clearInterval(id);
    }, [status]);

    const reset = useCallback(() => {
        setField(null);
        setMoves(emptyMoves(cols, rows));
        setStatus('uninitialized');
        setExplosion(null);
        setPressed(null);
        setTime(0);
    }, [cols, rows]);

    const flagCount = moves.reduce((acc, col) => acc + col.filter((m) => m === FLAG).length, 0);
    const minesLeft = status === 'won' ? 0 : mines - flagCount;

    const reveal = useCallback(
        (x: number, y: number) => {
            setPressed(null);
            if (status !== 'uninitialized' && status !== 'active') {
                return;
            }
            if (moves[x][y] !== CLOSED) {
                return;
            }

            // Create the field on first click (keeping that cell safe).
            let activeField = field;
            if (status === 'uninitialized') {
                activeField = new Field(cols, rows, mines, x, y);
                setField(activeField);
            }
            if (!activeField) {
                return;
            }

            if (activeField.cell(x, y) === MINE) {
                setExplosion({ x, y });
                setStatus('lost');
                return;
            }

            const effect = activeField.click(x, y);
            const next = moves.map((col) => col.slice());
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    if (effect[i][j] && next[i][j] === CLOSED) {
                        next[i][j] = OPEN;
                    }
                }
            }
            setMoves(next);

            // Victory test: every non-mine cell is open.
            let won = true;
            for (let i = 0; i < cols && won; i++) {
                for (let j = 0; j < rows; j++) {
                    if (activeField.cell(i, j) !== MINE && next[i][j] !== OPEN) {
                        won = false;
                        break;
                    }
                }
            }
            setStatus(won ? 'won' : 'active');
        },
        [field, moves, status, cols, rows, mines],
    );

    const flag = useCallback(
        (x: number, y: number) => {
            if (status !== 'uninitialized' && status !== 'active') {
                return;
            }
            setMoves((prev) => {
                const next = prev.map((col) => col.slice());
                if (next[x][y] === CLOSED) {
                    next[x][y] = FLAG;
                } else if (next[x][y] === FLAG) {
                    next[x][y] = CLOSED;
                }
                return next;
            });
        },
        [status],
    );

    const { unit, containerRef, chromeRef } = useBoardScale(cols, rows);

    return (
        <div className="game" ref={containerRef} style={{ '--unit': `${unit}px` } as CSSProperties}>
            <button className="exit" ref={chromeRef} onClick={onExit}>
                {t('game.newGame')}
            </button>
            <div className="game-frame">
                <TopPanel minesLeft={minesLeft} time={time} status={status} onReset={reset} />
                <Board cols={cols} rows={rows} moves={moves} field={field} status={status} explosion={explosion} pressed={pressed} onReveal={reveal} onFlag={flag} onPressChange={setPressed} />
            </div>
        </div>
    );
}
