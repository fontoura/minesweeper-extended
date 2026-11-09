import { useState } from 'react';
import { AI_KINDS } from '../game/ai';
import { clampCols, clampMines, clampRows } from '../game/field';
import { useI18n } from '../i18n/I18nContext';
import type { MessageKey } from '../i18n/translations';

interface Props {
    onStart: (cols: number, rows: number, mines: number, aiIndex: number) => void;
    onBack: () => void;
}

/**
 * The versus setup screen. The player sets the board size and mine count and
 * chooses whether player two is a human or one of the computer opponents.
 */
export default function VersusOptions({ onStart, onBack }: Props) {
    const { t } = useI18n();
    const [cols, setCols] = useState('16');
    const [rows, setRows] = useState('16');
    const [mines, setMines] = useState('51');
    // -1 => human player 2; 0..2 => AI difficulty
    const [opponent, setOpponent] = useState(-1);
    const [error, setError] = useState<MessageKey | null>(null);

    const preset = () => {
        setCols('16');
        setRows('16');
        setMines('51');
        setError(null);
    };

    const start = () => {
        const c = parseInt(cols, 10) || 0;
        const r = parseInt(rows, 10) || 0;
        const m = parseInt(mines, 10) || 0;
        if (c !== clampCols(c) || r !== clampRows(r)) {
            setError('options.errorDimensions');
            return;
        }
        if (m !== clampMines(c, r, m)) {
            setError('options.errorMines');
            return;
        }
        onStart(c, r, m, opponent);
    };

    return (
        <div className="options">
            <h1>{t('options.versus.title')}</h1>
            <button onClick={preset}>{t('options.defaultMode')}</button>
            <div className="fields">
                <label>
                    {t('options.width')}
                    <input value={cols} onChange={(e) => setCols(e.target.value)} />
                </label>
                <label>
                    {t('options.height')}
                    <input value={rows} onChange={(e) => setRows(e.target.value)} />
                </label>
                <label>
                    {t('options.mines')}
                    <input value={mines} onChange={(e) => setMines(e.target.value)} />
                </label>
            </div>
            <label className="select-label">
                {t('options.secondPlayer')}
                <select value={opponent} onChange={(e) => setOpponent(parseInt(e.target.value, 10))}>
                    <option value={-1}>{t('options.human')}</option>
                    {AI_KINDS.map((a, i) => (
                        <option key={a.nameKey} value={i}>
                            {t(a.nameKey)}
                        </option>
                    ))}
                </select>
            </label>
            {error && <div className="error">{t(error)}</div>}
            <div className="button-row">
                <button onClick={onBack}>{t('options.back')}</button>
                <button className="start" onClick={start}>
                    {t('options.start')}
                </button>
            </div>
        </div>
    );
}
