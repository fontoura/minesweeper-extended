/**
 * Supported language codes.
 */
export type Lang = 'en' | 'pt' | 'es';

/**
 * Language options shown by the language selector.
 */
export const LANGS: { code: Lang; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Português' },
    { code: 'es', label: 'Español' },
];

/**
 * Translation shape used by every language catalog.
 *
 * When adding a key, provide it in every language object.
 */
export interface Messages {
    'app.title': string;

    'menu.singlePlayer': string;
    'menu.versus': string;

    'options.single.title': string;
    'options.versus.title': string;
    'options.width': string;
    'options.height': string;
    'options.mines': string;
    'options.back': string;
    'options.start': string;
    'options.errorDimensions': string;
    'options.errorMines': string;
    'options.secondPlayer': string;
    'options.human': string;
    'options.defaultMode': string;
    'options.presetSummary': string; // {cols} {rows} {mines}

    'difficulty.beginner': string;
    'difficulty.intermediate': string;
    'difficulty.expert': string;

    'ai.easy': string;
    'ai.medium': string;
    'ai.hard': string;

    'game.newGame': string;
    'game.turn': string; // {player}
    'game.player1': string;
    'game.player2': string;
    'game.computer': string;

    'versus.bigClick': string;
}

/**
 * Valid translation keys for `t()`.
 */
export type MessageKey = keyof Messages;

const en: Messages = {
    'app.title': 'Minesweeper',

    'menu.singlePlayer': 'Single player',
    'menu.versus': 'Versus (2 players / vs computer)',

    'options.single.title': 'Minesweeper',
    'options.versus.title': 'Versus',
    'options.width': 'Width',
    'options.height': 'Height',
    'options.mines': 'Mines',
    'options.back': 'Back',
    'options.start': 'Start',
    'options.errorDimensions': 'The given dimensions are invalid (9–30).',
    'options.errorMines': 'The given number of mines is invalid.',
    'options.secondPlayer': 'Second player',
    'options.human': 'Human',
    'options.defaultMode': 'Default mode (16×16, 51 mines)',
    'options.presetSummary': '{cols}×{rows}, {mines} mines',

    'difficulty.beginner': 'Beginner',
    'difficulty.intermediate': 'Intermediate',
    'difficulty.expert': 'Expert',

    'ai.easy': 'Computer (easy)',
    'ai.medium': 'Computer (medium)',
    'ai.hard': 'Computer (hard)',

    'game.newGame': '← New game',
    'game.turn': "{player}'s turn",
    'game.player1': 'Player 1',
    'game.player2': 'Player 2',
    'game.computer': 'Computer',

    'versus.bigClick': 'Big click (5×5)',
};

const pt: Messages = {
    'app.title': 'Campo Minado',

    'menu.singlePlayer': '1 jogador',
    'menu.versus': 'Versus (2 jogadores / vs computador)',

    'options.single.title': 'Campo Minado',
    'options.versus.title': 'Versus',
    'options.width': 'Largura',
    'options.height': 'Altura',
    'options.mines': 'Bombas',
    'options.back': 'Voltar',
    'options.start': 'Iniciar',
    'options.errorDimensions': 'As dimensões fornecidas são inválidas (9–30).',
    'options.errorMines': 'O número de bombas fornecido é inválido.',
    'options.secondPlayer': 'Segundo jogador',
    'options.human': 'Humano',
    'options.defaultMode': 'Modo padrão (16×16, 51 bombas)',
    'options.presetSummary': '{cols}×{rows}, {mines} bombas',

    'difficulty.beginner': 'Iniciante',
    'difficulty.intermediate': 'Médio',
    'difficulty.expert': 'Avançado',

    'ai.easy': 'Computador fácil',
    'ai.medium': 'Computador médio',
    'ai.hard': 'Computador difícil',

    'game.newGame': '← Novo jogo',
    'game.turn': 'Vez do {player}',
    'game.player1': 'Jogador 1',
    'game.player2': 'Jogador 2',
    'game.computer': 'Computador',

    'versus.bigClick': 'Bombona (5×5)',
};

const es: Messages = {
    'app.title': 'Buscaminas',

    'menu.singlePlayer': '1 jugador',
    'menu.versus': 'Versus (2 jugadores / vs computadora)',

    'options.single.title': 'Buscaminas',
    'options.versus.title': 'Versus',
    'options.width': 'Ancho',
    'options.height': 'Alto',
    'options.mines': 'Minas',
    'options.back': 'Volver',
    'options.start': 'Iniciar',
    'options.errorDimensions': 'Las dimensiones ingresadas no son válidas (9–30).',
    'options.errorMines': 'El número de minas ingresado no es válido.',
    'options.secondPlayer': 'Segundo jugador',
    'options.human': 'Humano',
    'options.defaultMode': 'Modo predeterminado (16×16, 51 minas)',
    'options.presetSummary': '{cols}×{rows}, {mines} minas',

    'difficulty.beginner': 'Principiante',
    'difficulty.intermediate': 'Intermedio',
    'difficulty.expert': 'Experto',

    'ai.easy': 'Computadora (fácil)',
    'ai.medium': 'Computadora (medio)',
    'ai.hard': 'Computadora (difícil)',

    'game.newGame': '← Nuevo juego',
    'game.turn': 'Turno de {player}',
    'game.player1': 'Jugador 1',
    'game.player2': 'Jugador 2',
    'game.computer': 'Computadora',

    'versus.bigClick': 'Clic grande (5×5)',
};

/**
 * Full translation catalog consumed by `I18nProvider`.
 */
export const MESSAGES: Record<Lang, Messages> = { en, pt, es };
