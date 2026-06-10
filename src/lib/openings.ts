import { Chess } from 'chess.js';
import OPENINGS from '$lib/openings.json';

const OPENINGS_MAP = OPENINGS as Record<string, string>;

/** Return the opening name for a given FEN, if it matches a known position. */
export function getOpeningName(fen: string): string | undefined {
  return OPENINGS_MAP[fen];
}

/**
 * Detect the opening of a game by replaying its SAN moves and returning the
 * deepest known opening reached. Only the first dozen plies matter for openings,
 * so we stop scanning early for performance.
 */
export function detectOpening(moves: string[]): string | undefined {
  const chess = new Chess();
  let opening: string | undefined;
  const limit = Math.min(moves.length, 24);
  for (let i = 0; i < limit; i++) {
    try {
      chess.move(moves[i]);
    } catch {
      break;
    }
    const name = getOpeningName(chess.fen());
    if (name) opening = name;
  }
  return opening;
}
