import { useState } from 'react';
import { clampCols, clampMines, clampRows } from '../game/field';
import { DIFFICULTIES } from '../game/types';
import { useI18n } from '../i18n/I18nContext';
import type { MessageKey } from '../i18n/translations';

interface Props {
    onStart: (cols: number, rows: number, mines: number) => void;
    onBack: () => void;
}

/**
 * The single-player setup screen. The player picks a preset difficulty or
 * enters a custom board size and mine count before starting.
 */
export default function Options({ onStart, onBack }: Props) {
    const { t } = useI18n();
    const [cols, setCols] = useState('9');
    const [rows, setRows] = useState('9');
    const [mines, setMines] = useState('10');
    const [error, setError] = useState<MessageKey | null>(null);

    const preset = (d: { cols: number; rows: number; mines: number }) => {
        setCols(String(d.cols));
        setRows(String(d.rows));
        setMines(String(d.mines));
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
        onStart(c, r, m);
    };

    return (
        <div className="options">
            <h1>{t('options.single.title')}</h1>
            <div className="presets">
                {DIFFICULTIES.map((d) => (
                    <button key={d.nameKey} onClick={() => preset(d)}>
                        {t(d.nameKey)}
                        <span>{t('options.presetSummary', { cols: d.cols, rows: d.rows, mines: d.mines })}</span>
                    </button>
                ))}
            </div>
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
