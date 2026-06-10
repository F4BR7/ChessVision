import { Chess, type Move } from 'chess.js';
import { detectOpening } from '$lib/openings';
import { createGameId, type GameRecord, type GameResult, type GameType } from '$lib/games';

const VALID_RESULTS: GameResult[] = ['1-0', '0-1', '1/2-1/2'];

function cleanHeader(value: string | null | undefined): string | undefined {
  if (!value || value === '?' || value === '????.??.??') return undefined;
  return value;
}

/** Determine the result of a game from its final position (and PGN header). */
export function getResult(chess: Chess, headerResult?: string | null): GameResult {
  if (chess.isCheckmate()) return chess.turn() === 'w' ? '0-1' : '1-0';
  if (
    chess.isStalemate() ||
    chess.isInsufficientMaterial() ||
    chess.isThreefoldRepetition() ||
    chess.isDraw()
  ) {
    return '1/2-1/2';
  }
  if (headerResult && VALID_RESULTS.includes(headerResult as GameResult)) {
    return headerResult as GameResult;
  }
  return '*';
}

/** Parse a `YYYY.MM.DD` PGN date header into a Date, falling back to now. */
function parsePgnDate(value: string | undefined): Date {
  if (!value) return new Date();
  const match = value.match(/^(\d{4})\.(\d{2})\.(\d{2})$/);
  if (!match) return new Date();
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return isNaN(date.getTime()) ? new Date() : date;
}

export interface BuildGameOptions {
  type: GameType;
  difficulty?: number;
  accuracy?: number;
  inaccuracies?: number;
  mistakes?: number;
  blunders?: number;
  event?: string;
}

/**
 * Build a `GameRecord` from a played/loaded `Chess` instance and its move
 * history. Metadata (opening, result, players, date) is derived automatically.
 */
export function buildGameRecord(
  chess: Chess,
  history: Move[],
  options: BuildGameOptions
): GameRecord {
  const headers = chess.header();
  console.log('HEADERS:', headers);
  const rawPgn = chess.pgn();
  console.log('RAW PGN:', rawPgn);
  const moves = history.map((m) => m.san);
  return {
    id: createGameId(),
    date: parsePgnDate(cleanHeader(headers.Date)),
    type: options.type,
    pgn: chess.pgn(),
    moves,
    result: getResult(chess, headers.Result),
    opening: cleanHeader(headers.Opening) ?? detectOpening(moves),
    accuracy: options.accuracy,
    white: cleanHeader(headers.White),
    black: cleanHeader(headers.Black),
    difficulty: options.difficulty,
    inaccuracies: options.inaccuracies,
    mistakes: options.mistakes,
    blunders: options.blunders,
    event: options.event ?? cleanHeader(headers.Event)
  };
}

/**
 * Split a PGN string that may contain multiple games into individual PGNs.
 * Games are separated by their `[Event ...]` tag, or treated as a single game
 * when no tags are present.
 */
export function splitPgnGames(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (!/\[Event /.test(trimmed)) return [trimmed];
  const parts = trimmed.split(/\n\s*(?=\[Event )/g);
  return parts.map((p) => p.trim()).filter(Boolean);
}

/**
 * Parse a (possibly multi-game) PGN string into `GameRecord`s. Invalid games
 * are skipped. Throws only when nothing could be parsed.
 */
export function parsePgnToGames(text: string, type: GameType = 'PGN'): GameRecord[] {
  const chunks = splitPgnGames(text);
  const records: GameRecord[] = [];
  for (const chunk of chunks) {
    const chess = new Chess();
    try {
      chess.loadPgn(chunk);
    } catch {
      continue;
    }
    const history = chess.history({ verbose: true }) as Move[];
    if (history.length === 0) continue;
    records.push(buildGameRecord(chess, history, { type, event: 'Importado' }));
  }
  if (records.length === 0) {
    throw new Error('No se pudo leer ninguna partida del PGN proporcionado.');
  }
  return records;
}

/** Serialize one or more games into a single PGN string. */
export function gamesToPgn(records: GameRecord[]): string {
  return records.map((g) => g.pgn.trim()).join('\n\n\n');
}

/** Trigger a browser download of the given text content. */
export function downloadText(filename: string, content: string): void {
  if (typeof document === 'undefined') return;
  const blob = new Blob([content], { type: 'application/x-chess-pgn' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Build a human-friendly file name for a game export. */
export function gameFileName(game: GameRecord): string {
  const date = game.date.toISOString().slice(0, 10);
  const opening = (game.opening ?? game.type).replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  return `chessvision-${date}-${opening}.pgn`;
}
