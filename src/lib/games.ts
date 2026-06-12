import { writable } from 'svelte/store';

/** Result of a game following standard PGN notation. */
export type GameResult = '1-0' | '0-1' | '1/2-1/2' | '*';

/** Origin of a stored game. */
export type GameType = 'AI' | 'PGN' | 'Online' | 'Live';

/**
 * A single game stored in the local library.
 *
 * `pgn` is the canonical representation of the game. The remaining fields are
 * denormalized metadata used for listing, searching, filtering and statistics.
 */
export interface GameRecord {
  playerColor?: 'white' | 'black';
  id: string;
  date: Date;
  type: GameType;
  /** Full PGN of the game (movetext + tags when available). */
  pgn: string;
  /** Moves in SAN, kept for quick previews without re-parsing the PGN. */
  moves: string[];
  /** Final result of the game. */
  result: GameResult;
  /** Detected ECO opening name, if any. */
  opening?: string;
  /** Overall accuracy (0-100) when the game has been analyzed. */
  accuracy?: number;

  // --- Optional metadata ---
  /** Name of the player with the white pieces. */
  white?: string;
  /** Name of the player with the black pieces. */
  black?: string;
  /** AI difficulty level (only for `type === 'AI'`). */
  difficulty?: number;
  /** Number of inaccuracies detected during analysis. */
  inaccuracies?: number;
  /** Number of mistakes detected during analysis. */
  mistakes?: number;
  /** Number of blunders detected during analysis. */
  blunders?: number;
  /** Event/source tag (e.g. "chess.com", "Análisis"). */
  event?: string;
}

const STORAGE_KEY = 'chessvision_games';

interface StoredGame extends Omit<GameRecord, 'date'> {
  date: string;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function loadFromStorage(): GameRecord[] {
  if (!isBrowser()) return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed: StoredGame[] = JSON.parse(stored);
    return parsed.map((g) => ({ ...g, date: new Date(g.date) }));
  } catch (e) {
    console.error('Failed to load games from localStorage:', e);
    return [];
  }
}

function persist(records: GameRecord[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

/** Generate a reasonably unique identifier for a game. */
export function createGameId(): string {
  if (isBrowser() && typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createGamesStore() {
  const { subscribe, set, update } = writable<GameRecord[]>(loadFromStorage());

  const snapshot = (): GameRecord[] => {
    let current: GameRecord[] = [];
    subscribe((g) => {
      current = g;
    })();
    return current;
  };

  return {
    subscribe,
    /** Add a new game to the top of the library. */
    addGame: (game: GameRecord) => {
      update((games) => {
        const updated = [game, ...games];
        persist(updated);
        return updated;
      });
    },
    /** Add several games at once (used by PGN import). */
    addGames: (newGames: GameRecord[]) => {
      update((games) => {
        const updated = [...newGames, ...games];
        persist(updated);
        return updated;
      });
    },
    /** Remove a game by id. */
    removeGame: (id: string) => {
      update((games) => {
        const updated = games.filter((g) => g.id !== id);
        persist(updated);
        return updated;
      });
    },
    /** Replace an existing game (matched by id). */
    updateGame: (game: GameRecord) => {
      update((games) => {
        const updated = games.map((g) => (g.id === game.id ? game : g));
        persist(updated);
        return updated;
      });
    },
    /** Remove every stored game. */
    clear: () => {
      set([]);
      if (isBrowser()) localStorage.removeItem(STORAGE_KEY);
    },
    /** Get a single game by id. */
    getById: (id: string): GameRecord | null => snapshot().find((g) => g.id === id) ?? null,
    /** Get the most recent `limit` games. */
    getRecent: (limit: number = 5): GameRecord[] => snapshot().slice(0, limit),
    /** Get the most recently stored game. */
    getLastGame: (): GameRecord | null => snapshot()[0] ?? null,
    /** Get an immutable snapshot of every stored game. */
    all: (): GameRecord[] => snapshot()
  };
}

export const games = createGamesStore();
