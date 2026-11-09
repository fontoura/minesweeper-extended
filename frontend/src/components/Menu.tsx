import { useI18n } from '../i18n/I18nContext';

interface Props {
    onSingle: () => void;
    onVersus: () => void;
}

/** The main menu, where the player picks a game mode. */
export default function Menu({ onSingle, onVersus }: Props) {
    const { t } = useI18n();
    return (
        <div className="options menu">
            <h1>{t('app.title')}</h1>
            <button onClick={onSingle}>{t('menu.singlePlayer')}</button>
            <button onClick={onVersus}>{t('menu.versus')}</button>
        </div>
    );
}
