import type { AltEval, RawEval } from '$models/Engine';
import type { Evaluation } from '$models/Evaluation';
import Label from '$models/Label';
import { type Chess, type Color, type Move, type PieceSymbol } from 'chess.js';

export interface AccuracyBreakdown {
  overall: number;
  white: number;
  black: number;
}

export function formatScore(evaluation: Evaluation) {
  if (evaluation.type === 'mate') {
    if (Math.abs(evaluation.score) === Infinity) {
      return 'M#';
    }
    return `M${Math.abs(evaluation.score)}`;
  } else {
    return (evaluation.score / 100).toLocaleString(undefined, {
      signDisplay: 'exceptZero',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }
}

// score is in centipawns
const LIMIT: number = 1000;

// Minimum centipawns diff for a move to be considered GREAT
const GREAT_THRESHOLD = 150;

function computeHeightForCP(value: number) {
  const rootValue = Math.sign(value) * Math.pow(Math.abs(value), 0.6);
  const rootLimit = Math.pow(LIMIT, 0.6);
  return Math.min(0.95, Math.max(0.05, (rootValue + rootLimit) / (2 * rootLimit)));
}

export function toEvaluationHeight(evaluation: Evaluation) {
  return evaluation.type === 'cp'
    ? computeHeightForCP(evaluation.score)
    : Math.sign(evaluation.score) > 0
      ? 1
      : 0;
}

export function getBestMove(evaluation?: Evaluation): string | undefined {
  return evaluation?.pv.split(' ').at(0);
}

export function isForced(evaluation: Evaluation): boolean {
  return !evaluation.altLine;
}

export function haveOnlyOneGoodMove(turn: Color, evaluation?: Evaluation): boolean {
  if (!evaluation || !evaluation.altLine) return false;
  return (
    isWinningAfterThisMove(turn, evaluation) && !isWinningAfterThisMove(turn, evaluation.altLine)
  );
}

function isWinningAfterThisMove(turn: Color, alt: AltEval) {
  return turn === 'w' ? alt.score > 0 : alt.score < 0;
}

export function isNextMoveCrucial(turn: Color, before?: Evaluation, current?: Evaluation) {
  if (!before || !current) return false;
  const isFlip =
    turn === 'w' ? before.score <= 0 && current.score > 0 : before.score >= 0 && current.score < 0;
  return isFlip && Math.abs(before.score - current.score) > GREAT_THRESHOLD;
}

function inverse(turn: Color): Color {
  return turn === 'w' ? 'b' : 'w';
}

function toPieceValue(piece: PieceSymbol): number {
  switch (piece) {
    case 'p':
      return 1;
    case 'n':
      return 3;
    case 'b':
      return 3;
    case 'r':
      return 5;
    case 'q':
      return 9;
    case 'k':
      return Infinity;
  }
}

function isALosingTrade(piece: number, defenders: number[], isCovered: boolean): boolean {
  if (!isCovered) {
    // If nobody is covering
    return true;
  } else {
    for (const defender of defenders) {
      if (defender < piece) {
        // if there is a defender of lower value
        // that can capture the piece
        return true;
      }
    }
  }
  return false;
}

export function isSacrifice(chess: Chess, move: Move): boolean {
  // If it's a pawn, not a sacrifice
  if (move.piece === 'p') {
    return false;
  }

  // Piece values
  const defenders = chess
    .attackers(move.to, inverse(move.color))
    .map((x) => toPieceValue(chess.get(x)!.type));
  const piece = toPieceValue(move.piece);

  const isCovered = chess.isAttacked(move.to, move.color);

  if (defenders.length) {
    if (move.captured) {
      const captured = toPieceValue(move.captured);

      if (piece > captured) {
        if (isALosingTrade(piece, defenders, isCovered)) {
          return true;
        }
      }
    } else {
      if (isALosingTrade(piece, defenders, isCovered)) {
        return true;
      }
    }
  }

  return false;
}

export function opponentDidABadPlay(prevEval?: Evaluation): boolean {
  return !!prevEval && (prevEval.label === Label.BLUNDER || prevEval.label === Label.MISTAKE);
}

/**
 *
 * WTF algo
 * @link https://github.com/franciscoBSalgueiro/en-croissant/blob/master/src/utils/score.ts
 */
export function getWinChance(centipawns: number) {
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * centipawns)) - 1);
}

export function computeWinChance(evaluation: RawEval) {
  return evaluation.type === 'cp'
    ? Math.max(0, Math.min(getWinChance(evaluation.score), 100))
    : Math.sign(evaluation.score) > 0
      ? 100
      : 0;
}

export function computeWinChanceLost(previousEval: RawEval, currentEval: RawEval) {
  return computeWinChance(previousEval) - computeWinChance(currentEval);
}

/**
 * Per-move accuracy (0-100) derived from how much win percentage the moving
 * player lost. Uses the formula from Lichess/CAPS-style accuracy metrics.
 */
export function moveAccuracy(winChanceLost: number): number {
  const lost = Math.max(0, winChanceLost);
  const accuracy = 103.1668 * Math.exp(-0.04354 * lost) - 3.1669;
  return Math.max(0, Math.min(100, accuracy));
}

/**
 * Compute overall and per-color accuracy from a list of evaluations (one per
 * move, scored from White's perspective, as produced by `analyze_game`).
 */
export function computeAccuracy(evaluations: Evaluation[], history: Move[]): AccuracyBreakdown {
  const whiteAcc: number[] = [];
  const blackAcc: number[] = [];

  for (let i = 0; i < history.length && i < evaluations.length; i++) {
    const winWhiteAfter = computeWinChance(evaluations[i]);
    const winWhiteBefore = i === 0 ? 50 : computeWinChance(evaluations[i - 1]);
    const color = history[i].color;
    // win percentage lost from the moving player's point of view
    const lost = color === 'w' ? winWhiteBefore - winWhiteAfter : winWhiteAfter - winWhiteBefore;
    const acc = moveAccuracy(lost);
    if (color === 'w') whiteAcc.push(acc);
    else blackAcc.push(acc);
  }

  const average = (arr: number[]): number =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  return {
    overall: average([...whiteAcc, ...blackAcc]),
    white: average(whiteAcc),
    black: average(blackAcc)
  };
}

/** Count inaccuracies, mistakes and blunders across a list of evaluations. */
export function countMistakes(evaluations: Evaluation[]): {
  inaccuracies: number;
  mistakes: number;
  blunders: number;
} {
  let inaccuracies = 0;
  let mistakes = 0;
  let blunders = 0;
  for (const evaluation of evaluations) {
    if (evaluation.label === Label.INACCURACY) inaccuracies++;
    else if (evaluation.label === Label.MISTAKE) mistakes++;
    else if (evaluation.label === Label.BLUNDER) blunders++;
  }
  return { inaccuracies, mistakes, blunders };
}
// Errores del jugador
export function countPlayerMistakes(
  evaluations: Evaluation[],
  history: Move[],
  playerColor: 'white' | 'black'
): {
  inaccuracies: number;
  mistakes: number;
  blunders: number;
} {
  let inaccuracies = 0;
  let mistakes = 0;
  let blunders = 0;

  const color = playerColor === 'white' ? 'w' : 'b';

  for (let i = 0; i < evaluations.length && i < history.length; i++) {
    if (history[i].color !== color) continue;

    const evaluation = evaluations[i];

    if (evaluation.label === Label.INACCURACY) inaccuracies++;
    else if (evaluation.label === Label.MISTAKE) mistakes++;
    else if (evaluation.label === Label.BLUNDER) blunders++;
  }

  return {
    inaccuracies,
    mistakes,
    blunders
  };
}
