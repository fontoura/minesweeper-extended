import langEn from '../assets/images/lang-en.svg';
import langEs from '../assets/images/lang-es.svg';
import langPt from '../assets/images/lang-pt.svg';
import { useI18n } from '../i18n/I18nContext';
import { LANGS } from '../i18n/translations';

const FLAGS: Record<string, string> = { en: langEn, pt: langPt, es: langEs };

/** Flag buttons that switch the interface language through the language store. */
export default function LanguageSelector() {
    const { lang, setLang } = useI18n();
    return (
        <div className="lang-selector">
            {LANGS.map(({ code, label }) => (
                <button key={code} className={`lang-button ${lang === code ? 'active' : ''}`} title={label} aria-label={label} onClick={() => setLang(code)}>
                    <img src={FLAGS[code]} alt={label} draggable={false} />
                </button>
            ))}
        </div>
    );
}
