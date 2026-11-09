import React, { type ReactNode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import Game from './components/Game';
import LanguageSelector from './components/LanguageSelector';
import Menu from './components/Menu';
import Options from './components/Options';
import VersusGame from './components/VersusGame';
import VersusOptions from './components/VersusOptions';
import { AI_KINDS } from './game/ai';
import { I18nProvider } from './i18n/I18nContext';

type Screen = { kind: 'menu' } | { kind: 'single-options' } | { kind: 'versus-options' } | { kind: 'single'; cols: number; rows: number; mines: number } | { kind: 'versus'; cols: number; rows: number; mines: number; aiIndex: number };

/**
 * Routes between menu, option screens, and active game screens.
 */
function App() {
    const [screen, setScreen] = useState<Screen>({ kind: 'menu' });

    let content: ReactNode;
    switch (screen.kind) {
        case 'menu':
            content = <Menu onSingle={() => setScreen({ kind: 'single-options' })} onVersus={() => setScreen({ kind: 'versus-options' })} />;
            break;
        case 'single-options':
            content = <Options onStart={(cols, rows, mines) => setScreen({ kind: 'single', cols, rows, mines })} onBack={() => setScreen({ kind: 'menu' })} />;
            break;
        case 'versus-options':
            content = <VersusOptions onStart={(cols, rows, mines, aiIndex) => setScreen({ kind: 'versus', cols, rows, mines, aiIndex })} onBack={() => setScreen({ kind: 'menu' })} />;
            break;
        case 'single':
            content = <Game cols={screen.cols} rows={screen.rows} mines={screen.mines} onExit={() => setScreen({ kind: 'single-options' })} />;
            break;
        case 'versus':
            content = <VersusGame cols={screen.cols} rows={screen.rows} mines={screen.mines} ai={screen.aiIndex >= 0 ? AI_KINDS[screen.aiIndex] : null} onExit={() => setScreen({ kind: 'versus-options' })} />;
            break;
    }

    return (
        <I18nProvider>
            <div id="App">
                <LanguageSelector />
                {content}
            </div>
        </I18nProvider>
    );
}

const container = document.getElementById('root');
if (!container) {
    throw new Error('Root container #root not found');
}

const root = createRoot(container);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
