<script lang="ts">
  import { games, type GameRecord } from '$lib/games';
  import Chessboard from '../../components/Chessboard.svelte';
  import EvaluationBar from '../../components/EvaluationBar.svelte';

  let selectedGame: GameRecord | null = null;
  let searchTerm: string = '';

  const allGames = games.getRecent(100);

  $: filteredGames = allGames.filter((game) =>
    game.type.toLowerCase().includes(searchTerm.toLowerCase())
  );
</script>

<div class="max-w-7xl mx-auto px-4 py-8">
  <h1 class="h1 mb-6 text-white">Biblioteca de Partidas</h1>

  {#if !selectedGame}
    <!-- Game List View -->
    <div class="mb-6">
      <input
        type="text"
        placeholder="Buscar partidas..."
        bind:value={searchTerm}
        class="input w-full"
      />
    </div>

    {#if filteredGames.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each filteredGames as game (game.id)}
          <button
            on:click={() => (selectedGame = game)}
            class="card p-4 bg-surface-800 border border-surface-700 hover:border-primary-500 cursor-pointer transition text-left"
          >
            <div class="font-semibold text-white mb-2">
              {game.type === 'AI' ? `vs IA Nivel ${game.difficulty || 1}` : game.type === 'PGN' ? 'PGN Analizado' : 'Partida Live'}
            </div>
            <div class="text-sm text-surface-400 mb-2">
              {new Date(game.date).toLocaleDateString()}
            </div>
            {#if game.precision !== undefined}
              <div class="text-sm text-surface-400">
                Precisión: <span class="text-primary-400 font-semibold">{game.precision}%</span>
              </div>
            {/if}
          </button>
        {/each}
      </div>
    {:else}
      <div class="card p-8 bg-surface-800 border border-surface-700 text-center text-surface-400">
        <p>No hay partidas guardadas.</p>
      </div>
    {/if}
  {:else}
    <!-- Game Viewer -->
    <button
      on:click={() => (selectedGame = null)}
      class="btn btn-sm variant-filled-surface mb-6"
    >
      ← Volver a Biblioteca
    </button>

    <div class="flex flex-wrap justify-center gap-6 mb-6">
      <div class="size-4/5 md:size-3/5 lg:size-5/12 flex gap-x-4">
        <EvaluationBar evaluation={{ score: 0, type: 'cp', pv: '', label: 'UNDEFINED' }} />
        <div class="grow">
          <Chessboard />
        </div>
      </div>

      <div class="w-4/5 md:w-1/4">
        <div class="card p-6 bg-surface-800 border border-surface-700">
          <h3 class="h3 mb-4 text-white">Detalles de la Partida</h3>
          <div class="space-y-2 text-sm text-surface-400">
            <div>
              Tipo:
              <span class="text-white font-semibold">
                {selectedGame.type === 'AI' ? `IA Nivel ${selectedGame.difficulty}` : selectedGame.type}
              </span>
            </div>
            <div>
              Fecha:
              <span class="text-white font-semibold">
                {new Date(selectedGame.date).toLocaleDateString()}
              </span>
            </div>
            {#if selectedGame.precision !== undefined}
              <div>
                Precisión:
                <span class="text-primary-400 font-semibold">{selectedGame.precision}%</span>
              </div>
            {/if}
            {#if selectedGame.errors !== undefined}
              <div>
                Errores:
                <span class="text-warning-400 font-semibold">{selectedGame.errors}</span>
              </div>
            {/if}
            {#if selectedGame.blunders !== undefined}
              <div>
                Blunders:
                <span class="text-error-400 font-semibold">{selectedGame.blunders}</span>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
