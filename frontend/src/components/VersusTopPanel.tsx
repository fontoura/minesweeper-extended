import { size, top } from '../game/assets';
import type { Status } from '../game/types';
import type { VsStatus } from '../game/versusTypes';
import { useI18n } from '../i18n/I18nContext';
import { u } from '../utils/unit';
import FaceButton from './FaceButton';
import Scoreboard from './Scoreboard';

interface Props {
    score1: number;
    score2: number;
    status: VsStatus;
    bigPossible: boolean;
    bigAvailable1: boolean;
    bigAvailable2: boolean;
    bigActive1: boolean;
    bigActive2: boolean;
    onReset: () => void;
    onBig1: () => void;
    onBig2: () => void;
}

/**
 * Maps a versus match status to the shared face-button status.
 */
function faceStatus(s: VsStatus): Status {
    if (s === 'wonP1' || s === 'wonP2') {
        return 'won';
    }
    if (s === 'draw') {
        return 'lost';
    }
    return 'active';
}

/**
 * Renders one player power button for the big-click move.
 */
function PowerButton({ player, available, active, onClick, title }: { player: 1 | 2; available: boolean; active: boolean; onClick: () => void; title: string }) {
    return (
        <button className={`power power-p${player} ${active ? 'active' : ''}`} disabled={!available} onClick={onClick} title={title}>
            ✸
        </button>
    );
}

/**
 * Renders the versus top panel with both scores, reset face, and optional big-click buttons.
 */
export default function VersusTopPanel(props: Props) {
    const { t } = useI18n();
    const bigTitle = t('versus.bigClick');
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
            <Scoreboard value={props.score1} />
            <div className="top-center">
                {props.bigPossible && <PowerButton player={1} available={props.bigAvailable1} active={props.bigActive1} onClick={props.onBig1} title={bigTitle} />}
                <FaceButton status={faceStatus(props.status)} onReset={props.onReset} />
                {props.bigPossible && <PowerButton player={2} available={props.bigAvailable2} active={props.bigActive2} onClick={props.onBig2} title={bigTitle} />}
            </div>
            <Scoreboard value={props.score2} />
        </div>
    );
}
