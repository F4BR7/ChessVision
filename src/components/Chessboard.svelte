<script lang="ts">
  // @ts-expect-error: no declaration file as it was written in JS
  import { Chessboard, INPUT_EVENT_TYPE } from 'cm-chessboard/src/Chessboard';
  import { DEFAULT_POSITION, type Move, type Square } from 'chess.js';
  // @ts-expect-error: no declaration file as it was written in JS
  import { Markers } from 'cm-chessboard/src/extensions/markers/Markers.js';
  import { getContext, onMount } from 'svelte';
  import { derived, type Writable, type Readable } from 'svelte/store';
  import { page } from '$app/state';
  import type { Evaluation } from '$models/Evaluation';
  import { EvaluationMarkerExtension } from '$lib/extension';
  import type { Settings } from '$models/Settings';
  import { playMoveTypeSound } from '$lib/media';
  import { getMoveType } from '$lib/chess';
  import type { Chess } from 'chess.js';
  import { evaluate } from '$lib/engine';

  let boardElement: HTMLDivElement;

  let board: Chessboard;
  let aiThinking = false;
  export let showHints = false;

  $: if (!showHints && board) {
    board.setMarkers([]);
  }

  const position: Writable<string> = getContext('position');
  const evaluation: Writable<Evaluation> = getContext('evaluation');
  const move: Writable<number> = getContext('move');
  const history: Writable<Move[]> = getContext('history');
  const settings: Writable<Settings> = getContext('settings');
  const chess: Chess = getContext('chess');
  const engine: Readable<Worker> = getContext('engine');
  const playDifficulty: Writable<number> = getContext('playDifficulty');
  const orientation = derived(settings, ($settings) => $settings.orientation);

  type MoveInputEvent = {
    type: string;
    squareFrom: Square;
    squareTo?: Square;
  };

  // Map difficulty level to Stockfish depth
  const getDifficultyDepth = (difficulty: number): number => {
    const depthMap: { [key: number]: number } = {
      1: 2,
      2: 5,
      3: 10,
      4: 15,
      5: 20
    };
    return depthMap[difficulty] || 15;
  };

  // Extract the first move from PV line (long algebraic notation)
  const getFirstMoveFromPv = (pv: string): string | null => {
    const moves = pv.split(' ');
    return moves.length > 0 ? moves[0] : null;
  };

  // Convert long algebraic (e2e4) to from/to squares
  const parseLongAlgebraic = (move: string): { from: string; to: string } | null => {
    if (move.length < 4) return null;
    return {
      from: move.substring(0, 2),
      to: move.substring(2, 4)
    };
  };

  const showHint = async () => {
    const engineWorker = $engine;

    if (!engineWorker) return;

    const result = await evaluate(engineWorker, chess.fen(), 12);

    const bestMove = getFirstMoveFromPv(result.pv);

    if (!bestMove) return;

    alert(`Mejor jugada: ${bestMove}`);
  };

  // Make Stockfish move
  const makeStockfishMove = async () => {
    if (!playDifficulty || aiThinking) return;

    aiThinking = true;
    let difficulty = 15;

    try {
      // Get the current difficulty value from the store
      const unsubscribe = playDifficulty.subscribe((value) => {
        difficulty = getDifficultyDepth(value);
      });
      unsubscribe();

      const engineWorker = $engine;
      if (!engineWorker) {
        console.error('Engine not initialized');
        aiThinking = false;
        return;
      }

      // Get Stockfish evaluation
      const evaluation = await evaluate(engineWorker, chess.fen(), difficulty);
      const pvLine = evaluation.pv;

      if (!pvLine) {
        console.error('No PV line from Stockfish');
        aiThinking = false;
        return;
      }

      // Extract first move from PV
      const longAlgebraic = getFirstMoveFromPv(pvLine);
      if (!longAlgebraic) {
        console.error('Could not parse move from PV');
        aiThinking = false;
        return;
      }

      const moveCoords = parseLongAlgebraic(longAlgebraic);
      if (!moveCoords) {
        console.error('Could not parse algebraic notation');
        aiThinking = false;
        return;
      }

      // Apply the move
      const moveResult = chess.move({
        from: moveCoords.from,
        to: moveCoords.to
      });

      if (moveResult) {
        // Keep UI state synchronized after Stockfish makes a legal move.
        playMoveTypeSound(getMoveType(moveResult.san));
        position.set(chess.fen());
        history.set(chess.history({ verbose: true }));
        move.set(-1);

        if (showHints) {
          setTimeout(() => {
            showHint();
          }, 300);
        }
      } else {
        console.error(`Stockfish move validation failed: ${moveCoords.from}→${moveCoords.to}`);
      }
    } catch (error) {
      console.error('Stockfish move error:', error);
    } finally {
      aiThinking = false;
    }
  };

  const isReviewPage = page.url.pathname === '/review';

  // ====================================================
  // INICIALIZACIÓN DEL TABLERO
  // ====================================================

  onMount(async () => {
    board = new Chessboard(boardElement, {
      position: DEFAULT_POSITION,
      assetsUrl: '/',
      animationDuration: 50,
      style: {
        pieces: {
          file: 'standard.svg'
        }
      },
      extensions: [
        {
          class: EvaluationMarkerExtension
        },
        {
          class: Markers,
          props: {
            autoMarkers: null,
            sprite: '/markers.svg'
          }
        }
      ]
    });

    // Validate user moves through chess.js before the board accepts them.
    board.enableMoveInput((event: MoveInputEvent) => {
      const squareFrom = event.squareFrom;
      const piece = board.getPiece(squareFrom);
      const currentTurn = chess.turn(); // 'w' or 'b'
      const pieceColor = piece?.[0]; // 'w' or 'b'

      if (isReviewPage) {
        return false;
      }

      if (event.type === INPUT_EVENT_TYPE.moveInputStarted) {
        if (!piece) {
          return false;
        }

        if (pieceColor !== currentTurn) {
          return false;
        }

        const legalMoves = chess.moves({
          square: squareFrom,
          verbose: true
        });

        board.setMarkers([
          {
            square: squareFrom,
            label: 'SELECTED',
            showIcon: false
          },
          ...legalMoves.map((move) => ({
            square: move.to,
            label: 'LEGAL',
            showIcon: false
          }))
        ]);

        return true;
      }

      if (event.type === INPUT_EVENT_TYPE.validateMoveInput) {
        const squareFrom = event.squareFrom;
        const squareTo = event.squareTo;

        if (!squareTo) return false;

        // Get all legal moves from this square
        const legalMoves = chess.moves({ square: squareFrom, verbose: true });
        const moveExists = legalMoves.some((m) => m.to === squareTo);

        // If move doesn't exist in legal moves, reject immediately
        if (!moveExists) {
          return false;
        }

        // Now attempt to make the move (it should succeed since we validated it)
        const moveResult = chess.move({
          from: squareFrom,
          to: squareTo
        });

        if (moveResult) {
          playMoveTypeSound(getMoveType(moveResult.san));
          // Update position store with new FEN
          position.set(chess.fen());
          // Update history store
          history.set(chess.history({ verbose: true }));
          // Reset move index (no specific move selected)
          move.set(-1);

          // If Play tab is active and it's Stockfish's turn (Black), make the AI move
          if (playDifficulty && chess.turn() === 'b') {
            makeStockfishMove();
          }

          return true;
        } else {
          return false;
        }
      }

      if (event.type === INPUT_EVENT_TYPE.moveInputCanceled) {
        board.setMarkers([]);
      }

      if (event.type === INPUT_EVENT_TYPE.moveInputFinished) {
        board.setMarkers([]);
      }
    });
  });

  orientation.subscribe((value) => {
    board?.setOrientation(value);
    // TODO: quick fix
    board?.setMarkers([]);
  });
  $: board?.setPosition($position, true);
  $: {
    if ($history.length > 0 && $move >= 0) {
      playMoveTypeSound(getMoveType($history[$move].san));
      board?.setMarkers([
        {
          square: $history[$move].from,
          showIcon: false,
          label: $evaluation.label
        },
        {
          square: $history[$move].to,
          showIcon: true,
          label: $evaluation.label
        }
      ]);
    } else {
      board?.setMarkers([]);
    }
  }
  export { showHint };
</script>

<div class="w-full" bind:this={boardElement}></div>
