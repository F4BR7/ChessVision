<script lang="ts">
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  import { Chess, DEFAULT_POSITION, type Move } from 'chess.js';
  import Chessboard from '../../components/Chessboard.svelte';
  import EvaluationBar from '../../components/EvaluationBar.svelte';
  import { games } from '$lib/games';
  import { buildGameRecord } from '$lib/pgn';
  import type { Evaluation } from '$models/Evaluation';
  import type { Settings as SettingsType } from '$models/Settings';
  import Label from '$models/Label';
  import { beforeNavigate } from '$app/navigation';

  let gameState: 'selector' | 'playing' = 'selector';
  let difficulty = 3;
  let saved = false;
  let gameOver = false;
  let gameInProgress = false;
  let chessboardRef;

  beforeNavigate((navigation) => {
    if (!gameInProgress) return;

    const confirmed = confirm('Tienes una partida en curso. ¿Seguro que quieres abandonarla?');

    if (!confirmed) {
      navigation.cancel();
    }
  });

  const playDifficulty: Writable<number> = getContext('playDifficulty');
  let chess: Chess = getContext('chess');
  const position: Writable<string> = getContext('position');
  const history: Writable<Move[]> = getContext('history');
  const move: Writable<number> = getContext('move');
  const evaluations: Writable<Evaluation[]> = getContext('evaluations');

  const settings: Writable<SettingsType> = getContext('settings');

  let showHints = false;

  function flipBoard() {
    settings.update((s) => ({
      ...s,
      orientation: s.orientation === 'w' ? 'b' : 'w'
    }));
  }

  function restartGame() {
    resetBoard();
    saved = false;
    gameOver = false;
  }

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
      'Event',
      `IA Nivel ${difficulty}`,
      'Site',
      'ChessVision',
      'Date',
      new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
      'White',
      'Tú',
      'Black',
      `Stockfish (Nivel ${difficulty})`
    );
    const record = buildGameRecord(chess, $history, {
      type: 'AI',
      difficulty,
      event: `IA Nivel ${difficulty}`
    });
    record.white = 'Tú';
    record.black = `Stockfish (Nivel ${difficulty})`;
    record.playerColor = 'white';
    games.addGame(record);
    saved = true;
  };

  const handleStartGame = () => {
    resetBoard();
    saved = false;
    gameOver = false;
    gameInProgress = true;
    playDifficulty.set(difficulty);
    gameState = 'playing';
  };

  const handleNewGame = () => {
    // Persist the current game (if any) before leaving the board.
    if (
      gameInProgress &&
      !confirm('¿Seguro que quieres iniciar una nueva partida?\n\nSe perderá la partida actual.')
    ) {
      return;
    }

    saveGame();
    gameInProgress = false;
    gameState = 'selector';
  };

  // Detect the end of the game whenever the position changes.
  $: if (gameState === 'playing' && $position) {
    gameOver = chess.isGameOver();

    if (gameOver) {
      gameInProgress = false;
      saveGame();
    }
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
                  ? 'Principiante (~500 Elo)'
                  : level === 2
                    ? 'Aficionado (~900 Elo)'
                    : level === 3
                      ? 'Intermedio (~1400 Elo)'
                      : level === 4
                        ? 'Experto (~2200 Elo)'
                        : 'Maestro (~3000 Elo)'}
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
  <div class="flex justify-center gap-8 items-start">
    <div class="flex justify-center gap-8 items-start">
<div class="flex-1">
  <div class="mb-3 flex items-center gap-2 px-2 text-xl font-bold text-white">
    ♟️ <span>
      {difficulty === 1
        ? 'Stockfish Principiante (~500 Elo)'
        : difficulty === 2
          ? 'Stockfish Aficionado (~900 Elo)'
          : difficulty === 3
            ? 'Stockfish Intermedio (~1400 Elo)'
            : difficulty === 4
              ? 'Stockfish Experto (~2200 Elo)'
              : 'Stockfish Maestro (~3000 Elo)'}
    </span>
  </div>

  <div class="flex gap-4 items-stretch ">
      <EvaluationBar
        evaluation={
          $evaluations.length
            ? $evaluations[$evaluations.length - 1]
            : { score: 0, type: 'cp', pv: '', label: Label.UNDEFINED }
        }
      />

    <Chessboard bind:this={chessboardRef} {showHints} />
  </div>

  <div class="mt-3 flex items-center gap-2 px-2 text-xl font-bold text-white">
    👤 <span>Tú</span>
  </div>
</div>
      <!-- Game Controls -->
      <div class="w-[420px] shrink-0 pt-12">
        <div
          class="card pt-4 pb-6 px-6 bg-surface-800 border border-surface-700 min-h-[720px] flex flex-col"
        >
          <div>
            <h2 class="h2 text-white mb-6">Juego</h2>

            <div class="rounded-lg bg-surface-700/40 p-3 mb-5">
              <div class="text-surface-400">
                Nivel:
                <span class="text-primary-400 font-bold">Nivel {difficulty}</span>
              </div>

              <div class="mt-1 text-surface-400">
                Turno:
                <span class="text-white font-medium">Blancas</span>
              </div>
            </div>
          </div>

          {#if gameOver}
            <div class="card p-4 bg-surface-700 border border-primary-600 text-center">
              <div class="font-bold text-white mb-1">{resultText()}</div>
              <div class="text-xs text-surface-400">Guardada en la Biblioteca</div>
            </div>
          {/if}

          <div class="space-y-3">
            <button on:click={handleNewGame} class="w-full btn variant-filled-primary py-3">
              🎮 Nueva Partida
            </button>

            <button on:click={restartGame} class="w-full btn variant-filled-surface py-3">
              🔄 Reiniciar
            </button>

            <button on:click={flipBoard} class="w-full btn variant-filled-surface py-3">
              🔃 Voltear tablero
            </button>
          </div>

          <div class=" border-surface-700 pt-4 space-y-3">
            <label
              class="flex items-center justify-between rounded-xl border border-surface-700 px-4 py-3 hover:bg-surface-700 transition cursor-pointer"
            >
              <span class="font-medium">Pistas</span>
              <input bind:checked={showHints} type="checkbox" class="slider" />
            </label>
          </div>

          <div class="mt-auto border-t border-surface-700 pt-4">
            <div class="text-sm font-semibold text-surface-300 mb-3">Últimas jugadas</div>

            <div class="space-y-2 text-sm text-surface-400">
              <div>1. e4 &nbsp;&nbsp;&nbsp; Nf6</div>
              <div>2. f3 &nbsp;&nbsp;&nbsp; d5</div>
              <div>3. Nc3 &nbsp;&nbsp;&nbsp; e6</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
