<script lang="ts">
  import { setContext, getContext } from 'svelte';
  import { writable, type Writable } from 'svelte/store';
  import Chessboard from '../../components/Chessboard.svelte';
  import EvaluationBar from '../../components/EvaluationBar.svelte';

  let gameState: 'selector' | 'playing' = 'selector';
  let difficulty = 3;

  const playDifficulty: Writable<number> = getContext('playDifficulty');

  const handleStartGame = () => {
    playDifficulty.set(difficulty);
    gameState = 'playing';
  };

  const handleNewGame = () => {
    gameState = 'selector';
  };
</script>

{#if gameState === 'selector'}
  <!-- Difficulty Selector -->
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="card p-12 bg-surface-800 border border-surface-700 max-w-md w-full">
      <h1 class="h1 mb-8 text-white text-center">Jugar vs IA</h1>
      
      <div class="mb-8">
        <label class="block text-lg font-bold text-white mb-6">Selecciona dificultad:</label>
        
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
                {level === 1 ? 'Principiante' : level === 2 ? 'Intermedio' : level === 3 ? 'Avanzado' : level === 4 ? 'Experto' : 'Maestro'}
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
      <EvaluationBar evaluation={{ score: 0, type: 'cp', pv: '', label: 'UNDEFINED' }} />
      <div class="grow">
        <Chessboard />
      </div>
    </div>

    <!-- Game Controls -->
    <div class="w-4/5 md:w-1/4">
      <div class="card p-6 bg-surface-800 border border-surface-700 space-y-4">
        <h2 class="h2 text-white">Juego</h2>
        <div class="space-y-2">
          <div class="text-sm text-surface-400">Nivel: <span class="text-primary-400 font-bold">Nivel {difficulty}</span></div>
        </div>
        <button
          on:click={handleNewGame}
          class="w-full btn variant-filled-surface py-3"
        >
          Nueva Partida
        </button>
      </div>
    </div>
  </div>
{/if}
