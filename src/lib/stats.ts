import type { GameRecord, GameResult, GameType } from '$lib/games';

/**
 * Foundation for the upcoming Statistics module.
 *
 * This module intentionally only exposes pure, side-effect-free helpers that
 * derive aggregate metrics from a list of `GameRecord`s. The future Statistics
 * page is expected to build richer visualizations (rating progression, per
 * opening performance, accuracy trends over time, etc.) on top of these
 * primitives. Keeping the computation here keeps the UI thin and testable.
 */

export interface GameStatistics {
  totalGames: number;
  averageAccuracy: number;
  totalInaccuracies: number;
  totalMistakes: number;
  totalBlunders: number;
  byType: Record<GameType, number>;
  byResult: Record<GameResult, number>;
  byDifficulty: Record<number, number>;
}

/** Aggregate openings sorted by frequency, used by the future Statistics view. */
export interface OpeningStat {
  opening: string;
  count: number;
  averageAccuracy: number;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

/** Compute the headline statistics for a collection of games. */
export function computeStatistics(records: GameRecord[]): GameStatistics {
  const byType: Record<GameType, number> = { AI: 0, PGN: 0, Online: 0, Live: 0 };
  const byResult: Record<GameResult, number> = { '1-0': 0, '0-1': 0, '1/2-1/2': 0, '*': 0 };
  const byDifficulty: Record<number, number> = {};
  const accuracies: number[] = [];

  let totalInaccuracies = 0;
  let totalMistakes = 0;
  let totalBlunders = 0;

  for (const game of records) {
    byType[game.type] = (byType[game.type] ?? 0) + 1;
    byResult[game.result] = (byResult[game.result] ?? 0) + 1;
    if (game.type === 'AI' && game.difficulty) {
      byDifficulty[game.difficulty] = (byDifficulty[game.difficulty] ?? 0) + 1;
    }
    if (typeof game.accuracy === 'number') accuracies.push(game.accuracy);
    totalInaccuracies += game.inaccuracies ?? 0;
    totalMistakes += game.mistakes ?? 0;
    totalBlunders += game.blunders ?? 0;
  }

  return {
    totalGames: records.length,
    averageAccuracy: average(accuracies),
    totalInaccuracies,
    totalMistakes,
    totalBlunders,
    byType,
    byResult,
    byDifficulty
  };
}

/** Compute per-opening aggregates, sorted by how often each opening appears. */
export function computeOpeningStats(records: GameRecord[]): OpeningStat[] {
  const map = new Map<string, { count: number; accuracies: number[] }>();
  for (const game of records) {
    if (!game.opening) continue;
    const entry = map.get(game.opening) ?? { count: 0, accuracies: [] };
    entry.count++;
    if (typeof game.accuracy === 'number') entry.accuracies.push(game.accuracy);
    map.set(game.opening, entry);
  }
  return [...map.entries()]
    .map(([opening, { count, accuracies }]) => ({
      opening,
      count,
      averageAccuracy: average(accuracies)
    }))
    .sort((a, b) => b.count - a.count);
}
