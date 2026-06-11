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
  import { beforeNavigate } from '$app/navigation';
  import { onDestroy } from 'svelte';

  let gameState: 'selector' | 'playing' = 'selector';
  let difficulty = 3;
  let saved = false;
  let gameOver = false;
  let gameInProgress = false;
 
  beforeNavigate((navigation) => {
    if (!gameInProgress) return;

    const confirmed = confirm(
        'Tienes una partida en curso. ¿Seguro que quieres abandonarla?'
    );

    if (!confirmed) {
        navigation.cancel();
    }
});

  onDestroy(() => {
    chess = new Chess();

  });


  beforeNavigate((nav) => {
    if (!gameInProgress) return;
    
    const leave = confirm('Tienes una partida en curso. Si sales, se perderá el progreso.');
    if (!leave) nav.cancel();
  });

  const playDifficulty: Writable<number> = getContext('playDifficulty');
  let chess: Chess = getContext('chess');
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
    gameInProgress = true;
    playDifficulty.set(difficulty);
    gameState = 'playing';
  };

  const handleNewGame = () => {
    // Persist the current game (if any) before leaving the board.
    if (
        gameInProgress &&
        !confirm(
            '¿Seguro que quieres iniciar una nueva partida?\n\nSe perderá la partida actual.'
        )
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
<div class="mx-auto my-6 md:my-10 max-w-[1285px] px-4">
  <div class="flex justify-center gap-8 items-start">

  <EvaluationBar evaluation={{ score: 0, type: 'cp', pv: '', label: Label.UNDEFINED }} />

  <div class="flex-1">

<div class="mb-3 flex items-center gap-2 px-2 text-xl font-bold text-white">
  ♟️ <span> {  difficulty === 1 ? 'Stockfish Principiante (~500 Elo)' :
  difficulty === 2 ? 'Stockfish Aficionado (~900 Elo)' :
  difficulty === 3 ? 'Stockfish Intermedio (~1400 Elo)' :
  difficulty === 4 ? 'Stockfish Experto (~2200 Elo)' :
  'Stockfish Maestro (~3000 Elo)'}</span>
</div>

<Chessboard />

<div class="mt-3 flex items-center gap-2 px-2 text-xl font-bold text-white">
  👤 <span>Tú</span>
</div>

</div>
    <!-- Game Controls -->
    <div class="w-[420px] shrink-0">
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
</div>
{/if}
