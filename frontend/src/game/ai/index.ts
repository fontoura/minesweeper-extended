export type { Ai, AiResult } from './ai';

import type { Ai } from './ai';
import { easyAi } from './EasyAi';
import { hardAi } from './HardAi';
import { mediumAi } from './MediumAi';

/** Every opponent the player can choose, ordered from easiest to hardest. */
export const AI_KINDS: Ai[] = [easyAi, mediumAi, hardAi];
