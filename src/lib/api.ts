export interface ChessComPlayer {
  username: string;
  rating: number;
  result: string;
}

export interface ChessComGame {
  pgn: string;
  end_time: number;
  white: ChessComPlayer;
  black: ChessComPlayer;
}

interface ChessComGamesResponse {
  games?: ChessComGame[];
}

export const loadRecentGames = async (username: string): Promise<ChessComGame[]> => {
  const today = new Date();
  const response = await fetch(
    `https://api.chess.com/pub/player/${username}/games/${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}`
  );
  if (!response.ok) return [];
  const payload = (await response.json()) as ChessComGamesResponse;
  return payload.games ?? [];
};

export const userWon = (username: string, game: ChessComGame) =>
  (game.white.username === username && game.white.result === 'win') ||
  (game.black.username === username && game.black.result === 'win');

export const isDraw = (game: ChessComGame) =>
  game.white.result !== 'win' && game.black.result !== 'win';
