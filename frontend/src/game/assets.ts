import border_bottom from '../assets/images/game/border_bottom.svg';
import border_bottom_left from '../assets/images/game/border_bottom_left.svg';
import border_bottom_right from '../assets/images/game/border_bottom_right.svg';
import border_left from '../assets/images/game/border_left.svg';
import border_right from '../assets/images/game/border_right.svg';
import border_top from '../assets/images/game/border_top.svg';
import border_top_left from '../assets/images/game/border_top_left.svg';
import border_top_right from '../assets/images/game/border_top_right.svg';
import digit_0 from '../assets/images/game/digit_0.svg';
import digit_1 from '../assets/images/game/digit_1.svg';
import digit_2 from '../assets/images/game/digit_2.svg';
import digit_3 from '../assets/images/game/digit_3.svg';
import digit_4 from '../assets/images/game/digit_4.svg';
import digit_5 from '../assets/images/game/digit_5.svg';
import digit_6 from '../assets/images/game/digit_6.svg';
import digit_7 from '../assets/images/game/digit_7.svg';
import digit_8 from '../assets/images/game/digit_8.svg';
import digit_9 from '../assets/images/game/digit_9.svg';
import digit_blank from '../assets/images/game/digit_blank.svg';
import digit_minus from '../assets/images/game/digit_minus.svg';
import face_cool from '../assets/images/game/face_cool.svg';
import face_dead from '../assets/images/game/face_dead.svg';
import face_normal from '../assets/images/game/face_normal.svg';
import face_normal_pressed from '../assets/images/game/face_normal_pressed.svg';
import field_0 from '../assets/images/game/field_0.svg';
import field_1 from '../assets/images/game/field_1.svg';
import field_2 from '../assets/images/game/field_2.svg';
import field_3 from '../assets/images/game/field_3.svg';
import field_4 from '../assets/images/game/field_4.svg';
import field_5 from '../assets/images/game/field_5.svg';
import field_6 from '../assets/images/game/field_6.svg';
import field_7 from '../assets/images/game/field_7.svg';
import field_8 from '../assets/images/game/field_8.svg';
import field_closed from '../assets/images/game/field_closed.svg';
import field_explosion from '../assets/images/game/field_explosion.svg';
import field_flag from '../assets/images/game/field_flag.svg';
import field_mine from '../assets/images/game/field_mine.svg';
import field_p1 from '../assets/images/game/field_p1.svg';
import field_p2 from '../assets/images/game/field_p2.svg';
import field_wrong from '../assets/images/game/field_wrong.svg';
import score_bottom from '../assets/images/game/score_bottom.svg';
import score_left from '../assets/images/game/score_left.svg';
import score_right from '../assets/images/game/score_right.svg';
import score_top from '../assets/images/game/score_top.svg';
import selector_big_p1 from '../assets/images/game/selector_big_p1.svg';
import selector_big_p2 from '../assets/images/game/selector_big_p2.svg';
import selector_p1 from '../assets/images/game/selector_p1.svg';
import selector_p2 from '../assets/images/game/selector_p2.svg';
import top_background from '../assets/images/game/top_background.svg';
import top_left from '../assets/images/game/top_left.svg';
import top_right from '../assets/images/game/top_right.svg';

/** Revealed-cell images indexed by neighbouring mine count, 0 to 8. */
export const fieldImages = [field_0, field_1, field_2, field_3, field_4, field_5, field_6, field_7, field_8];

/** The non-numbered cell images. */
export const field = {
    closed: field_closed,
    flag: field_flag,
    mine: field_mine,
    explosion: field_explosion,
    wrong: field_wrong,
    // A pressed (held-down) closed cell looks like a revealed "0" cell.
    pressed: field_0,
    p1: field_p1,
    p2: field_p2,
};

export const selector = {
    p1: selector_p1,
    p2: selector_p2,
    bigP1: selector_big_p1,
    bigP2: selector_big_p2,
};

export const border = {
    top: border_top,
    bottom: border_bottom,
    left: border_left,
    right: border_right,
    topLeft: border_top_left,
    topRight: border_top_right,
    bottomLeft: border_bottom_left,
    bottomRight: border_bottom_right,
};

export const digitImages = [digit_0, digit_1, digit_2, digit_3, digit_4, digit_5, digit_6, digit_7, digit_8, digit_9];
export const digit = { minus: digit_minus, blank: digit_blank };

export const score = { top: score_top, bottom: score_bottom, left: score_left, right: score_right };

export const face = {
    normal: face_normal,
    normalPressed: face_normal_pressed,
    cool: face_cool,
    dead: face_dead,
};

export const top = { background: top_background, left: top_left, right: top_right };

/**
 * Each asset's natural pixel size, read from its SVG viewBox. These are only
 * used as ratios: the layout multiplies them by the shared `--unit` scale.
 */
export const size = {
    cell: 16,
    borderTop: 9,
    borderBottom: 8,
    borderLeft: 12,
    borderRight: 8,
    digitW: 13,
    digitH: 23,
    scoreTop: 17,
    scoreBottom: 5,
    scoreLeft: 6,
    scoreRight: 8,
    face: 26,
    topH: 47,
    topLeft: 11,
    topRight: 7,
};
