import { writable } from 'svelte/store';

export interface GameRecord {
  id: string;
  date: Date;
  type: 'AI' | 'PGN' | 'Live';
  difficulty?: number;
  moves: string[];
  precision?: number;
  errors?: number;
  blunders?: number;
  pgn?: string;
}

function createGamesStore() {
  const { subscribe, set, update } = writable<GameRecord[]>([]);

  // Load games from localStorage on init
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('chessvision_games');
    if (stored) {
      try {
        const games = JSON.parse(stored).map((g: any) => ({
          ...g,
          date: new Date(g.date)
        }));
        set(games);
      } catch (e) {
        console.error('Failed to load games from localStorage:', e);
      }
    }
  }

  return {
    subscribe,
    addGame: (game: GameRecord) => {
      update((games) => {
        const updated = [game, ...games];
        if (typeof window !== 'undefined') {
          localStorage.setItem('chessvision_games', JSON.stringify(updated));
        }
        return updated;
      });
    },
    clear: () => {
      set([]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('chessvision_games');
      }
    },
    getRecent: (limit: number = 5) => {
      let games: GameRecord[] = [];
      subscribe((g) => {
        games = g;
      })();
      return games.slice(0, limit);
    },
    getLastGame: () => {
      let games: GameRecord[] = [];
      subscribe((g) => {
        games = g;
      })();
      return games[0] || null;
    }
  };
}

export const games = createGamesStore();
