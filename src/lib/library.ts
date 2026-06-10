/**
 * Small handoff helper used to send a PGN from the Library to the Analysis page.
 * Stored in `sessionStorage` so it survives the client-side navigation but is
 * consumed exactly once.
 */
const PENDING_PGN_KEY = 'chessvision_pending_pgn';

export function setPendingPgn(pgn: string): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(PENDING_PGN_KEY, pgn);
}

export function consumePendingPgn(): string | null {
  if (typeof sessionStorage === 'undefined') return null;
  const pgn = sessionStorage.getItem(PENDING_PGN_KEY);
  if (pgn) sessionStorage.removeItem(PENDING_PGN_KEY);
  return pgn;
}
