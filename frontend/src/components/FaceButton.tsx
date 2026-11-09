import { useState } from 'react';
import { face, size } from '../game/assets';
import type { Status } from '../game/types';
import { u } from '../utils/unit';

/**
 * Picks the face image: cool shades on a win, a dead face on a loss, and the
 * pressed face while the mouse is held down.
 */
function faceImage(status: Status, pressed: boolean): string {
    if (status === 'won') {
        return face.cool;
    }
    if (status === 'lost') {
        return face.dead;
    }
    return pressed ? face.normalPressed : face.normal;
}

/** The smiley reset button shown at the top of the board. */
export default function FaceButton({ status, onReset }: { status: Status; onReset: () => void }) {
    const [pressed, setPressed] = useState(false);
    return (
        <img
            className="face-button"
            src={faceImage(status, pressed)}
            alt="reset"
            draggable={false}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            onClick={onReset}
            style={{
                width: u(size.face),
                height: u(size.face),
            }}
        />
    );
}
