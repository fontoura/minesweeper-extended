import { size, top } from '../game/assets';
import type { Status } from '../game/types';
import { u } from '../utils/unit';
import FaceButton from './FaceButton';
import Scoreboard from './Scoreboard';

interface Props {
    minesLeft: number;
    time: number;
    status: Status;
    onReset: () => void;
}

/**
 * The single-player header: the mine counter, the reset face, and the elapsed
 * time counter, all inside a raised border.
 */
export default function TopPanel({ minesLeft, time, status, onReset }: Props) {
    return (
        <div
            className="top-panel"
            style={{
                height: u(size.topH),
                paddingLeft: u(size.topLeft),
                paddingRight: u(size.topRight),
            }}
        >
            <div className="top-fill top-fill-left" style={{ width: u(size.topLeft), backgroundImage: `url(${top.left})` }} />
            <div className="top-fill top-fill-right" style={{ width: u(size.topRight), backgroundImage: `url(${top.right})` }} />
            <Scoreboard value={minesLeft} />
            <FaceButton status={status} onReset={onReset} />
            <Scoreboard value={time} />
        </div>
    );
}
