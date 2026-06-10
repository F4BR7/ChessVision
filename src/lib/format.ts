import type { GameRecord, GameResult, GameType } from '$lib/games';

/** Spanish label for a game type. */
export function formatGameType(type: GameType, difficulty?: number): string {
  switch (type) {
    case 'AI':
      return `vs IA Nivel ${difficulty ?? 1}`;
    case 'PGN':
      return 'PGN Analizado';
    case 'Online':
      return 'Revisión Online';
    case 'Live':
      return 'Partida en Vivo';
  }
}

/** Short Spanish label for a game result. */
export function formatResult(result: GameResult): string {
  switch (result) {
    case '1-0':
      return 'Ganan Blancas';
    case '0-1':
      return 'Ganan Negras';
    case '1/2-1/2':
      return 'Tablas';
    default:
      return 'Sin resultado';
  }
}

/** Tailwind classes for a result badge. */
export function resultBadgeClass(result: GameResult): string {
  switch (result) {
    case '1-0':
      return 'bg-surface-100 text-surface-900';
    case '0-1':
      return 'bg-surface-900 text-white border border-surface-500';
    case '1/2-1/2':
      return 'bg-surface-600 text-white';
    default:
      return 'bg-surface-700 text-surface-300';
  }
}

/** Localized short date (es). */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Build a one-line title for a game. */
export function gameTitle(game: GameRecord): string {
  if ((game.type === 'PGN' || game.type === 'Online') && game.white && game.black) {
    return `${game.white} vs ${game.black}`;
  }
  return formatGameType(game.type, game.difficulty);
}
