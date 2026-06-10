<script lang="ts">
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  import { Chess, DEFAULT_POSITION, type Move } from 'chess.js';
  import Chessboard from '../../components/Chessboard.svelte';
  import EvaluationBar from '../../components/EvaluationBar.svelte';
  import { games } from '$lib/games';
  import { buildGameRecord } from '$lib/pgn';
  import type { Evaluation } from '$models/Evaluation';
  import Label from '$models/Label';

  let gameState: 'selector' | 'playing' = 'selector';
  let difficulty = 3;
  let saved = false;
  let gameOver = false;

  const playDifficulty: Writable<number> = getContext('playDifficulty');
  const chess: Chess = getContext('chess');
  const position: Writable<string> = getContext('position');
  const history: Writable<Move[]> = getContext('history');
  const move: Writable<number> = getContext('move');
  const evaluations: Writable<Evaluation[]> = getContext('evaluations');

  const resetBoard = () => {
    chess.reset();
    history.set([]);
    position.set(DEFAULT_POSITION);
    move.set(-1);
    evaluations.set([]);
  };

  const saveGame = () => {
    if (saved || $history.length === 0) return;
    chess.header(
      'Event', `IA Nivel ${difficulty}`,
      'Site', 'ChessVision',
      'Date', new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
      'White', 'Tú',
      'Black', `Stockfish (Nivel ${difficulty})`
    );
    const record = buildGameRecord(chess, $history, {
      type: 'AI',
      difficulty,
      event: `IA Nivel ${difficulty}`
    });
    record.white = 'Tú';
    record.black = `Stockfish (Nivel ${difficulty})`;
    console.log(record);  
    games.addGame(record);
    saved = true;
  };

  const handleStartGame = () => {
    resetBoard();
    saved = false;
    gameOver = false;
    playDifficulty.set(difficulty);
    gameState = 'playing';
  };

  const handleNewGame = () => {
    // Persist the current game (if any) before leaving the board.
    saveGame();
    gameState = 'selector';
  };

  // Detect the end of the game whenever the position changes.
  $: if (gameState === 'playing' && $position) {
    gameOver = chess.isGameOver();
    if (gameOver) saveGame();
  }

  const resultText = (): string => {
    if (chess.isCheckmate())
      return chess.turn() === 'w' ? '¡Gana las negras!' : '¡Ganan las blancas!';
    if (chess.isStalemate()) return 'Tablas por ahogado';
    if (chess.isInsufficientMaterial()) return 'Tablas por material insuficiente';
    if (chess.isThreefoldRepetition()) return 'Tablas por repetición';
    if (chess.isDraw()) return 'Tablas';
    return 'Partida finalizada';
  };
</script>

{#if gameState === 'selector'}
  <!-- Difficulty Selector -->
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="card p-12 bg-surface-800 border border-surface-700 max-w-md w-full">
      <h1 class="h1 mb-8 text-white text-center">Jugar vs IA</h1>

      <div class="mb-8">
        <span class="block text-lg font-bold text-white mb-6">Selecciona dificultad:</span>

        <div class="space-y-3">
          {#each [1, 2, 3, 4, 5] as level}
            <button
              on:click={() => (difficulty = level)}
              class="w-full p-4 rounded-lg text-left transition {difficulty === level
                ? 'bg-primary-600 text-white'
                : 'bg-surface-700 text-surface-300 hover:bg-surface-600'}"
            >
              <div class="font-semibold">Nivel {level}</div>
              <div class="text-sm opacity-75">
                {level === 1
                  ? 'Principiante'
                  : level === 2
                    ? 'Intermedio'
                    : level === 3
                      ? 'Avanzado'
                      : level === 4
                        ? 'Experto'
                        : 'Maestro'}
              </div>
            </button>
          {/each}
        </div>
      </div>

      <button
        on:click={handleStartGame}
        class="w-full btn variant-filled-primary py-3 text-lg font-bold"
      >
        Empezar Partida
      </button>
    </div>
  </div>
{:else}
  <!-- Game Board -->
  <div class="flex flex-wrap justify-center my-6 md:my-16 gap-6 px-4">
    <div class="size-4/5 md:size-3/5 lg:size-5/12 flex gap-x-4">
      <EvaluationBar evaluation={{ score: 0, type: 'cp', pv: '', label: Label.UNDEFINED }} />
      <div class="grow">
        <Chessboard />
      </div>
    </div>

    <!-- Game Controls -->
    <div class="w-4/5 md:w-1/4">
      <div class="card p-6 bg-surface-800 border border-surface-700 space-y-4">
        <h2 class="h2 text-white">Juego</h2>
        <div class="space-y-2">
          <div class="text-sm text-surface-400">
            Nivel: <span class="text-primary-400 font-bold">Nivel {difficulty}</span>
          </div>
        </div>

        {#if gameOver}
          <div class="card p-4 bg-surface-700 border border-primary-600 text-center">
            <div class="font-bold text-white mb-1">{resultText()}</div>
            <div class="text-xs text-surface-400">Guardada en la Biblioteca</div>
          </div>
        {/if}

        <button on:click={handleNewGame} class="w-full btn variant-filled-surface py-3">
          Nueva Partida
        </button>
        <a href="/library" class="block w-full btn variant-ghost-primary py-3 text-center">
          Ver Biblioteca
        </a>
      </div>
    </div>
  </div>
{/if}
