import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { type Lang, MESSAGES, type MessageKey } from './translations';

type Vars = Record<string, string | number>;

interface I18nContextValue {
    lang: Lang;
    setLang: (lang: Lang) => void;
    t: (key: MessageKey, vars?: Vars) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'minesweeper.lang';

/**
 * Picks the initial UI language from persisted storage or browser locale.
 */
function initialLang(): Lang {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored === 'en' || stored === 'pt' || stored === 'es') {
        return stored;
    }
    const nav = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : 'en';
    if (nav.startsWith('pt')) {
        return 'pt';
    }
    if (nav.startsWith('es')) {
        return 'es';
    }
    return 'en';
}

/**
 * Replaces {name} placeholders in a translation template.
 */
function interpolate(template: string, vars?: Vars): string {
    if (!vars) {
        return template;
    }
    return template.replace(/\{(\w+)\}/g, (_, name) => (name in vars ? String(vars[name]) : `{${name}}`));
}

/**
 * Provides the app-wide language store and translation function.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>(initialLang);

    const setLang = useCallback((next: Lang) => {
        setLangState(next);
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {
            /* ignore storage errors */
        }
    }, []);

    const t = useCallback((key: MessageKey, vars?: Vars) => interpolate(MESSAGES[lang][key], vars), [lang]);

    const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Returns the current language store from context.
 */
export function useI18n(): I18nContextValue {
    const ctx = useContext(I18nContext);
    if (!ctx) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return ctx;
}
