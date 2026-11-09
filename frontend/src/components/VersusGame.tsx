import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import type { Ai } from '../game/ai';
import { Field, MINE } from '../game/field';
import type { Cell } from '../game/types';
import { makeGrid } from '../game/utils';
import { clampBigCenter, EMPTY, P1, P2, type VsMove, type VsStatus } from '../game/versusTypes';
import { useI18n } from '../i18n/I18nContext';
import { useBoardScale } from '../utils/useBoardScale';
import VersusBoard from './VersusBoard';
import VersusTopPanel from './VersusTopPanel';

interface Props {
    cols: number;
    rows: number;
    mines: number;
    /** The computer opponent for player two, or null for two humans. */
    ai: Ai | null;
    onExit: () => void;
}

interface State {
    field: Field;
    moves: VsMove[][];
    status: VsStatus;
    turn: VsMove;
    score1: number;
    score2: number;
    last1: Cell | null;
    last2: Cell | null;
    bigAvailable1: boolean;
    bigAvailable2: boolean;
    bigActive: boolean;
}

function emptyMoves(cols: number, rows: number): VsMove[][] {
    return makeGrid<VsMove>(cols, rows, EMPTY);
}

/**
 * The versus game. Two players take turns claiming cells: claiming a mine scores
 * a point and keeps the turn, while a safe flood fill passes the turn. The first
 * to more than half the mines wins. An optional AI drives player two.
 */
export default function VersusGame({ cols, rows, mines, ai, onExit }: Props) {
    const { t } = useI18n();
    const bigPossible = cols >= 16 && rows >= 16;

    const build = useCallback((): State => {
        return {
            field: new Field(cols, rows, mines),
            moves: emptyMoves(cols, rows),
            status: 'active',
            turn: P1,
            score1: 0,
            score2: 0,
            last1: null,
            last2: null,
            bigAvailable1: bigPossible,
            bigAvailable2: bigPossible,
            bigActive: false,
        };
    }, [cols, rows, mines, bigPossible]);

    const [state, setState] = useState<State>(build);
    const [pressed, setPressed] = useState<Cell | null>(null);
    const [hover, setHover] = useState<Cell | null>(null);

    const reset = useCallback(() => {
        setState(build());
        setPressed(null);
        setHover(null);
    }, [build]);

    /** Recounts each player's score from the board and checks for a win. */
    const score = useCallback(
        (s: State): State => {
            let p1 = 0;
            let p2 = 0;
            for (let x = 0; x < cols; x++) {
                for (let y = 0; y < rows; y++) {
                    if (s.field.cell(x, y) === MINE) {
                        if (s.moves[x][y] === P1) {
                            p1++;
                        }
                        if (s.moves[x][y] === P2) {
                            p2++;
                        }
                    }
                }
            }
            const limit = Math.floor(mines / 2) + 1;
            let status: VsStatus = s.status;
            if (p1 >= limit) {
                status = 'wonP1';
            } else if (p2 >= limit) {
                status = 'wonP2';
            } else if (p1 === p2 && p1 + p2 === mines) {
                status = 'draw';
            }
            return { ...s, score1: p1, score2: p2, status };
        },
        [cols, rows, mines],
    );

    /**
     * Applies a normal click on one cell. Hitting a mine scores and keeps the
     * turn; a safe cell floods open and passes the turn. Returns null if the
     * move is not allowed.
     */
    const applyClick = useCallback(
        (s: State, x: number, y: number): State | null => {
            if (s.status !== 'active') {
                return null;
            }
            if (x < 0 || x >= cols || y < 0 || y >= rows) {
                return null;
            }
            if (s.moves[x][y] !== EMPTY) {
                return null;
            }

            const moves = s.moves.map((c) => c.slice());
            const last = { x, y };
            let turn = s.turn;

            if (s.field.cell(x, y) === MINE) {
                moves[x][y] = s.turn; // scored, keep turn
            } else {
                const effect = s.field.click(x, y);
                for (let i = 0; i < cols; i++) {
                    for (let j = 0; j < rows; j++) {
                        if (effect[i][j] && moves[i][j] === EMPTY) {
                            moves[i][j] = s.turn;
                        }
                    }
                }
                turn = s.turn === P1 ? P2 : P1; // safe, pass turn
            }

            const next: State = {
                ...s,
                moves,
                turn,
                last1: s.turn === P1 ? last : s.last1,
                last2: s.turn === P2 ? last : s.last2,
                bigActive: false,
            };
            return score(next);
        },
        [cols, rows, score],
    );

    /**
     * Applies a big click: a 5x5 area centred on the clamped target. It always
     * passes the turn and uses up the player's one big click. Returns null if
     * the move is not allowed.
     */
    const applyBigClick = useCallback(
        (s: State, cx: number, cy: number): State | null => {
            if (s.status !== 'active' || !bigPossible) {
                return null;
            }
            const sx = clampBigCenter(cx, cols);
            const sy = clampBigCenter(cy, rows);

            let possible = false;
            for (let dx = -2; dx <= 2; dx++) {
                for (let dy = -2; dy <= 2; dy++) {
                    if (s.moves[sx + dx][sy + dy] === EMPTY) {
                        possible = true;
                    }
                }
            }
            if (!possible) {
                return null;
            }

            const moves = s.moves.map((c) => c.slice());
            for (let dx = -2; dx <= 2; dx++) {
                for (let dy = -2; dy <= 2; dy++) {
                    if (moves[sx + dx][sy + dy] === EMPTY) {
                        const effect = s.field.click(sx + dx, sy + dy);
                        for (let i = 0; i < cols; i++) {
                            for (let j = 0; j < rows; j++) {
                                if (effect[i][j] && moves[i][j] === EMPTY) {
                                    moves[i][j] = s.turn;
                                }
                            }
                        }
                    }
                }
            }
            const last = { x: sx, y: sy };
            const next: State = {
                ...s,
                moves,
                turn: s.turn === P1 ? P2 : P1,
                last1: s.turn === P1 ? last : s.last1,
                last2: s.turn === P2 ? last : s.last2,
                bigActive: false,
                bigAvailable1: s.turn === P1 ? false : s.bigAvailable1,
                bigAvailable2: s.turn === P2 ? false : s.bigAvailable2,
            };
            return score(next);
        },
        [cols, rows, bigPossible, score],
    );

    /**
     * Plays the first empty cell found. Used as a last resort so a broken AI
     * move can never freeze the game on its turn.
     */
    const firstEmptyMove = useCallback(
        (s: State): State | null => {
            for (let x = 0; x < cols; x++) {
                for (let y = 0; y < rows; y++) {
                    if (s.moves[x][y] === EMPTY) {
                        return applyClick(s, x, y);
                    }
                }
            }
            return null;
        },
        [cols, rows, applyClick],
    );

    const humanTurn = state.turn === P1 || (state.turn === P2 && !ai);

    const onMove = useCallback(
        (x: number, y: number) => {
            setPressed(null);
            if (!humanTurn) {
                return;
            }
            setState((s) => {
                const next = s.bigActive && bigPossible ? applyBigClick(s, x, y) : applyClick(s, x, y);
                return next ?? s;
            });
        },
        [humanTurn, bigPossible, applyBigClick, applyClick],
    );

    /** Toggles a player's big click, allowed only on their turn and when behind. */
    const toggleBig = useCallback(
        (player: VsMove) => {
            setState((s) => {
                if (!bigPossible || s.status !== 'active' || s.turn !== player) {
                    return s;
                }
                const available = player === P1 ? s.bigAvailable1 : s.bigAvailable2;
                const behind = player === P1 ? s.score1 < s.score2 : s.score2 < s.score1;
                if (!available || !behind) {
                    return s;
                }
                return { ...s, bigActive: !s.bigActive };
            });
        },
        [bigPossible],
    );

    // AI driving player 2. Depends on `state.moves` (a new array after every move)
    // and not only on `state.turn`: scoring a mine keeps the turn, so the turn
    // alone would not change and the AI would never be scheduled again.
    const aiTimer = useRef<number | null>(null);
    // biome-ignore lint/correctness/useExhaustiveDependencies: state.moves re-triggers the AI after it scores a mine and keeps the turn.
    useEffect(() => {
        if (!ai || state.status !== 'active' || state.turn !== P2) {
            return;
        }
        const wait = ai.minWait + Math.random() * (ai.maxWait - ai.minWait);
        aiTimer.current = window.setTimeout(() => {
            setState((s) => {
                if (s.status !== 'active' || s.turn !== P2) {
                    return s;
                }
                const canBig = bigPossible && s.bigAvailable2 && s.score2 < s.score1;
                const result = ai.play(s.field, s.moves, EMPTY, P1, P2, canBig);
                const next = result.bigClick ? applyBigClick(s, result.x, result.y) : applyClick(s, result.x, result.y);
                // Safety net: should the AI ever produce an invalid / no-op move,
                // the turn would never pass and the game would freeze. Fall back to
                // the first empty cell so progress is always guaranteed.
                return next ?? firstEmptyMove(s) ?? s;
            });
        }, wait);
        return () => {
            if (aiTimer.current) {
                window.clearTimeout(aiTimer.current);
            }
        };
    }, [ai, state.status, state.turn, state.moves, bigPossible, applyBigClick, applyClick, firstEmptyMove]);

    const { unit, containerRef, chromeRef } = useBoardScale(cols, rows);

    return (
        <div className="game" ref={containerRef} style={{ '--unit': `${unit}px` } as CSSProperties}>
            <div className="versus-bar" ref={chromeRef}>
                <button className="exit" onClick={onExit}>
                    {t('game.newGame')}
                </button>
                <span className={`turn-label ${state.status !== 'active' ? 'hidden' : ''}`}>
                    {t('game.turn', {
                        player: t(state.turn === P1 ? 'game.player1' : ai ? 'game.computer' : 'game.player2'),
                    })}
                </span>
            </div>
            <div className="game-frame">
                <VersusTopPanel
                    score1={state.score1}
                    score2={state.score2}
                    status={state.status}
                    bigPossible={bigPossible}
                    bigAvailable1={state.bigAvailable1 && state.score1 < state.score2}
                    bigAvailable2={state.bigAvailable2 && state.score2 < state.score1 && !ai}
                    bigActive1={state.bigActive && state.turn === P1}
                    bigActive2={state.bigActive && state.turn === P2}
                    onReset={reset}
                    onBig1={() => toggleBig(P1)}
                    onBig2={() => toggleBig(P2)}
                />
                <VersusBoard
                    cols={cols}
                    rows={rows}
                    moves={state.moves}
                    field={state.field}
                    status={state.status}
                    pressed={pressed}
                    hover={hover}
                    turn={state.turn}
                    humanTurn={humanTurn}
                    bigActive={state.bigActive}
                    bigPossible={bigPossible}
                    last1={state.last1}
                    last2={state.last2}
                    onMove={onMove}
                    onPressChange={setPressed}
                    onHover={setHover}
                />
            </div>
        </div>
    );
}
