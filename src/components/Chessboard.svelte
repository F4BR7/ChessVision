<script lang="ts">
  // @ts-expect-error: no declaration file as it was written in JS
  import { Chessboard, INPUT_EVENT_TYPE } from 'cm-chessboard/src/Chessboard';
  import { DEFAULT_POSITION, type Move } from 'chess.js';

  import { getContext, onMount } from 'svelte';
  import { derived, type Writable, type Readable } from 'svelte/store';
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

  const position: Writable<string> = getContext('position');
  const evaluation: Writable<Evaluation> = getContext('evaluation');
  const move: Writable<number> = getContext('move');
  const history: Writable<Move[]> = getContext('history');
  const settings: Writable<Settings> = getContext('settings');
  const chess: Chess = getContext('chess');
  const engine: Readable<Worker> = getContext('engine');
  const playDifficulty: Writable<number> = getContext('playDifficulty');
  const orientation = derived(settings, ($settings) => $settings.orientation);

  // DEBUG: Log context values at initialization
  console.log(`--- CHESSBOARD INIT DEBUG ---`);
  console.log(`playDifficulty value:`, playDifficulty);
  console.log(`typeof playDifficulty:`, typeof playDifficulty);
  console.log(`playDifficulty === undefined:`, playDifficulty === undefined);

  // Map difficulty level to Stockfish depth
  const getDifficultyDepth = (difficulty: number): number => {
    const depthMap: { [key: number]: number } = {
      1: 8,
      2: 12,
      3: 15,
      4: 18,
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

      console.log(`--- STOCKFISH THINKING ---`);
      console.log(`Difficulty level: ${difficulty}`);
      console.log(`CURRENT FEN: ${chess.fen()}`);

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

      console.log(`STOCKFISH MOVE: ${longAlgebraic} (${moveCoords.from}→${moveCoords.to})`);

      // Apply the move
      const moveResult = chess.move({
        from: moveCoords.from,
        to: moveCoords.to
      });

      if (moveResult) {
        console.log(`Accepted: ${moveResult.san}`);
        console.log(`New turn: ${chess.turn() === 'w' ? 'White' : 'Black'}`);

        // Update stores
        position.set(chess.fen());
        history.set(chess.history({ verbose: true }));
        move.set(-1);
      } else {
        console.error(`Stockfish move validation failed: ${moveCoords.from}→${moveCoords.to}`);
      }
    } catch (error) {
      console.error('Stockfish move error:', error);
    } finally {
      aiThinking = false;
    }
  };

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
        }
      ]
    });

    // Enable move input after board initialization
    board.enableMoveInput((event) => {
      if (event.type === INPUT_EVENT_TYPE.moveInputStarted) {
        const squareFrom = event.squareFrom;
        const piece = board.getPiece(squareFrom);
        const currentTurn = chess.turn(); // 'w' or 'b'
        const pieceColor = piece?.[0]; // 'w' or 'b'

        console.log(`--- MOVE INPUT STARTED ---`);
        console.log(`Current turn: ${currentTurn === 'w' ? 'White' : 'Black'}`);
        console.log(`Selected piece: ${piece} at ${squareFrom}`);

        // Only allow if piece color matches current turn
        if (!piece) {
          console.log(`Rejected: No piece at ${squareFrom}`);
          return false;
        }

        if (pieceColor !== currentTurn) {
          console.log(`Rejected: Wrong side to move (${pieceColor === 'w' ? 'White' : 'Black'} piece, but ${currentTurn === 'w' ? 'White' : 'Black'}'s turn)`);
          return false;
        }

        console.log(`Accepted: Piece can be moved`);
        return true;
      }

      if (event.type === INPUT_EVENT_TYPE.validateMoveInput) {
        const squareFrom = event.squareFrom;
        const squareTo = event.squareTo;

        console.log(`--- VALIDATING MOVE ---`);
        console.log(`Attempted move: ${squareFrom} -> ${squareTo}`);

        // Get all legal moves from this square
        const legalMoves = chess.moves({ square: squareFrom, verbose: true });
        const moveExists = legalMoves.some((m) => m.to === squareTo);

        // If move doesn't exist in legal moves, reject immediately
        if (!moveExists) {
          console.log(`Rejected: ${squareFrom}→${squareTo} is not a legal move`);
          console.log(`Legal moves from ${squareFrom}: ${legalMoves.map((m) => m.san).join(', ')}`);
          return false;
        }

        // Now attempt to make the move (it should succeed since we validated it)
        const moveResult = chess.move({
          from: squareFrom,
          to: squareTo
        });

        if (moveResult) {
          console.log(`PLAYER MOVE: ${moveResult.san}`);
          console.log(`Accepted: ${moveResult.san}`);
          console.log(`New turn: ${chess.turn() === 'w' ? 'White' : 'Black'}`);

          // Update position store with new FEN
          position.set(chess.fen());
          // Update history store
          history.set(chess.history({ verbose: true }));
          // Reset move index (no specific move selected)
          move.set(-1);

          // DEBUG: Log context values
          console.log(`--- DEBUG: CHECKING AI CONDITION ---`);
          console.log(`playDifficulty:`, playDifficulty);
          console.log(`typeof playDifficulty:`, typeof playDifficulty);
          console.log(`chess.turn():`, chess.turn());
          console.log(`chess.turn() === 'b':`, chess.turn() === 'b');
          console.log(`playDifficulty && chess.turn() === 'b':`, playDifficulty && chess.turn() === 'b');

          // If Play tab is active and it's Stockfish's turn (Black), make the AI move
          if (playDifficulty && chess.turn() === 'b') {
            console.log('Condition TRUE - calling makeStockfishMove()');
            makeStockfishMove();
          } else {
            console.log('Condition FALSE - NOT calling makeStockfishMove()');
          }

          return true;
        } else {
          console.log(`Rejected: Move validation failed (chess.js internal error)`);
          return false;
        }
      }

      if (event.type === INPUT_EVENT_TYPE.moveInputCanceled) {
        console.log(`Move input canceled`);
      }

      if (event.type === INPUT_EVENT_TYPE.moveInputFinished) {
        console.log(`Move input finished`);
      }
    });

    console.log('MOVE INPUT ENABLED');
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
</script>

<div class="w-full" bind:this={boardElement}></div>
