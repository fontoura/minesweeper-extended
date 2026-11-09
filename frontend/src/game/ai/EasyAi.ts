import type { Field } from '../field';
import type { Move } from '../types';
import { idiv } from '../utils';
import { type Ai, type AiResult, countScores, pickBigTarget, pickRandomEmpty, type Rng } from './ai';

/**
 * The easy opponent. It plays almost at random, only reaching for a big click
 * when it is comfortably ahead.
 */
class EasyAi implements Ai {
    readonly nameKey = 'ai.easy' as const;
    readonly minWait = 500;
    readonly maxWait = 1000;

    play(field: Field, moves: Move[][], empty: Move, p1: Move, p2: Move, canBig: boolean, rng: Rng = Math.random): AiResult {
        const { cols, rows } = field;
        const { total, p1: pts1, p2: pts2 } = countScores(field, moves, p1, p2);

        // When comfortably ahead, drop a big click on any reachable 5x5 area.
        if (canBig && pts1 - pts2 > idiv(20 * total, 100)) {
            const big = pickBigTarget(moves, empty, cols, rows, () => 1, false, rng);
            if (big) {
                return big;
            }
        }

        // Otherwise click a random empty cell. There is always one here because
        // the game only calls an AI while the board is still active.
        return pickRandomEmpty(moves, empty, rng) ?? { x: 0, y: 0, bigClick: false };
    }
}

/** Shared singleton for the easy opponent. */
export const easyAi: Ai = new EasyAi();
