<script lang="ts">
  import { goto } from '$app/navigation';
  import { games, type GameRecord, type GameResult, type GameType } from '$lib/games';
  import { setPendingPgn } from '$lib/library';
  import { parsePgnToGames, gamesToPgn, downloadText, gameFileName } from '$lib/pgn';
  import {
    formatGameType,
    formatResult,
    resultBadgeClass,
    formatDate,
    gameTitle
  } from '$lib/format';

  type TypeFilter = 'all' | GameType;
  type ResultFilter = 'all' | GameResult;
  type SortKey = 'date-desc' | 'date-asc' | 'accuracy-desc' | 'accuracy-asc';

  let selectedGame: GameRecord | null = null;
  let searchTerm = '';
  let typeFilter: TypeFilter = 'all';
  let resultFilter: ResultFilter = 'all';
  let sortKey: SortKey = 'date-desc';

  // Import UI state
  let showImport = false;
  let importText = '';
  let importError = '';
  let importMessage = '';

  $: filteredGames = $games
    .filter((game) => {
      if (typeFilter !== 'all' && game.type !== typeFilter) return false;
      if (resultFilter !== 'all' && game.result !== resultFilter) return false;
      const term = searchTerm.trim().toLowerCase();
      if (!term) return true;
      const haystack = [
        game.opening,
        game.white,
        game.black,
        game.event,
        formatGameType(game.type, game.difficulty),
        formatResult(game.result)
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    })
    .sort((a, b) => {
      switch (sortKey) {
        case 'date-asc':
          return a.date.getTime() - b.date.getTime();
        case 'accuracy-desc':
          return (b.accuracy ?? -1) - (a.accuracy ?? -1);
        case 'accuracy-asc':
          return (a.accuracy ?? 101) - (b.accuracy ?? 101);
        case 'date-desc':
        default:
          return b.date.getTime() - a.date.getTime();
      }
    });

  const handleImport = () => {
    importError = '';
    importMessage = '';
    try {
      const records = parsePgnToGames(importText);
      games.addGames(records);
      importMessage = `${records.length} partida(s) importada(s) correctamente.`;
      importText = '';
    } catch (e) {
      importError = e instanceof Error ? e.message : 'No se pudo importar el PGN.';
    }
  };

  const handleFile = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    importText = await file.text();
    handleImport();
    input.value = '';
  };

  const exportAll = () => {
    if ($games.length === 0) return;
    downloadText('chessvision-biblioteca.pgn', gamesToPgn($games));
  };

  const exportGame = (game: GameRecord) => {
    downloadText(gameFileName(game), game.pgn);
  };

  const analyzeGame = (game: GameRecord) => {
    setPendingPgn(game.pgn);
    goto('/review');
  };

  const deleteGame = (game: GameRecord) => {
    if (!confirm('¿Eliminar esta partida de la biblioteca?')) return;
    games.removeGame(game.id);
    if (selectedGame?.id === game.id) selectedGame = null;
  };

  // Group SAN moves into numbered pairs for display.
  const movePairs = (moves: string[]): { number: number; white: string; black?: string }[] => {
    const pairs = [];
    for (let i = 0; i < moves.length; i += 2) {
      pairs.push({ number: i / 2 + 1, white: moves[i], black: moves[i + 1] });
    }
    return pairs;
  };
</script>

<div class="max-w-7xl mx-auto px-4 py-8">
  {#if !selectedGame}
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <h1 class="h1 text-white">Biblioteca de Partidas</h1>
      <div class="flex items-center gap-2">
        <button class="btn variant-filled-primary" on:click={() => (showImport = !showImport)}>
          ⬆️ Importar PGN
        </button>
        <button
          class="btn variant-ghost-surface"
          on:click={exportAll}
          disabled={$games.length === 0}
        >
          ⬇️ Exportar Todo
        </button>
      </div>
    </div>

    <!-- Import panel -->
    {#if showImport}
      <div class="card p-4 bg-surface-800 border border-surface-700 mb-6 space-y-3">
        <label class="block">
          <span class="text-sm text-surface-300">Pega uno o varios PGN</span>
          <textarea
            bind:value={importText}
            class="textarea mt-1"
            rows="4"
            placeholder="[Event ...] 1. e4 e5 ..."
          ></textarea>
        </label>
        <div class="flex flex-wrap items-center gap-3">
          <button
            class="btn variant-filled-primary"
            on:click={handleImport}
            disabled={!importText.trim()}
          >
            Importar
          </button>
          <label class="btn variant-ghost-surface cursor-pointer">
            Cargar archivo
            <input type="file" accept=".pgn,.txt" class="hidden" on:change={handleFile} />
          </label>
          {#if importMessage}
            <span class="text-success-400 text-sm">{importMessage}</span>
          {/if}
          {#if importError}
            <span class="text-error-400 text-sm">{importError}</span>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Filters -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
      <input
        type="text"
        placeholder="Buscar por apertura, jugador..."
        bind:value={searchTerm}
        class="input md:col-span-2"
      />
      <select bind:value={typeFilter} class="select">
        <option value="all">Todos los tipos</option>
        <option value="AI">vs IA</option>
        <option value="PGN">PGN Analizado</option>
        <option value="Online">Revisión Online</option>
        <option value="Live">En Vivo</option>
      </select>
      <select bind:value={resultFilter} class="select">
        <option value="all">Todos los resultados</option>
        <option value="1-0">Ganan Blancas</option>
        <option value="0-1">Ganan Negras</option>
        <option value="1/2-1/2">Tablas</option>
        <option value="*">Sin resultado</option>
      </select>
    </div>

    <div class="flex items-center justify-between mb-4">
      <p class="text-sm text-surface-400">{filteredGames.length} partida(s)</p>
      <select bind:value={sortKey} class="select w-auto">
        <option value="date-desc">Más recientes</option>
        <option value="date-asc">Más antiguas</option>
        <option value="accuracy-desc">Mayor precisión</option>
        <option value="accuracy-asc">Menor precisión</option>
      </select>
    </div>

    <!-- Game grid -->
    {#if filteredGames.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each filteredGames as game (game.id)}
          <button
            on:click={() => (selectedGame = game)}
            class="card p-4 bg-surface-800 border border-surface-700 hover:border-primary-500 cursor-pointer transition text-left flex flex-col gap-2"
          >
            <div class="flex items-start justify-between gap-2">
              <span class="font-semibold text-white">{gameTitle(game)}</span>
              <span class="text-xs px-2 py-0.5 rounded {resultBadgeClass(game.result)}">
                {game.result}
              </span>
            </div>
            <div class="text-xs text-surface-400">
              {formatGameType(game.type, game.difficulty)} · {formatDate(game.date)}
            </div>
            {#if game.opening}
              <div class="text-sm text-surface-300 truncate">♟️ {game.opening}</div>
            {/if}
            <div class="flex items-center justify-between mt-1">
              {#if game.accuracy !== undefined}
                <span class="text-sm text-surface-400">
                  Precisión: <span class="text-primary-400 font-semibold">{game.accuracy}%</span>
                </span>
              {:else}
                <span class="text-xs text-surface-500">Sin analizar</span>
              {/if}
              <span class="text-xs text-surface-500">{game.moves.length} jugadas</span>
            </div>
          </button>
        {/each}
      </div>
    {:else}
      <div class="card p-8 bg-surface-800 border border-surface-700 text-center text-surface-400">
        <p>No hay partidas que coincidan con los filtros.</p>
        <p class="text-sm mt-2">Juega contra la IA o analiza un PGN para empezar tu biblioteca.</p>
      </div>
    {/if}
  {:else}
    <!-- Detail view -->
    <button on:click={() => (selectedGame = null)} class="btn btn-sm variant-filled-surface mb-6">
      ← Volver a Biblioteca
    </button>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Metadata -->
      <div class="card p-6 bg-surface-800 border border-surface-700 space-y-3">
        <h2 class="h3 text-white">{gameTitle(selectedGame)}</h2>
        <div class="space-y-2 text-sm text-surface-400">
          <div>
            Tipo: <span class="text-white"
              >{formatGameType(selectedGame.type, selectedGame.difficulty)}</span
            >
          </div>
          <div>Fecha: <span class="text-white">{formatDate(selectedGame.date)}</span></div>
          <div>
            Resultado:
            <span class="text-xs px-2 py-0.5 rounded {resultBadgeClass(selectedGame.result)}">
              {selectedGame.result}
            </span>
            <span class="text-white">{formatResult(selectedGame.result)}</span>
          </div>
          {#if selectedGame.opening}
            <div>Apertura: <span class="text-white">{selectedGame.opening}</span></div>
          {/if}
          {#if selectedGame.accuracy !== undefined}
            <div>
              Precisión: <span class="text-primary-400 font-semibold">{selectedGame.accuracy}%</span
              >
            </div>
          {/if}
          {#if selectedGame.inaccuracies !== undefined}
            <div>
              Inexactitudes: <span class="text-warning-400">{selectedGame.inaccuracies}</span>
            </div>
          {/if}
          {#if selectedGame.mistakes !== undefined}
            <div>Errores: <span class="text-warning-500">{selectedGame.mistakes}</span></div>
          {/if}
          {#if selectedGame.blunders !== undefined}
            <div>Torpezas: <span class="text-error-400">{selectedGame.blunders}</span></div>
          {/if}
        </div>

        <div class="flex flex-col gap-2 pt-2">
          <button
            class="btn variant-filled-primary"
            on:click={() => selectedGame && analyzeGame(selectedGame)}
          >
            🔍 Revisar
          </button>
          <button
            class="btn variant-ghost-surface"
            on:click={() => selectedGame && exportGame(selectedGame)}
          >
            ⬇️ Exportar PGN
          </button>
          <button
            class="btn variant-ghost-error"
            on:click={() => selectedGame && deleteGame(selectedGame)}
          >
            🗑️ Eliminar
          </button>
        </div>
      </div>

      <!-- Moves -->
      <div class="card p-6 bg-surface-800 border border-surface-700">
        <h3 class="h4 text-white mb-3">Jugadas</h3>
        {#if selectedGame.moves.length > 0}
          <div class="max-h-80 overflow-y-auto text-sm font-mono text-surface-300 space-y-1">
            {#each movePairs(selectedGame.moves) as pair}
              <div class="flex gap-2">
                <span class="text-surface-500 w-8">{pair.number}.</span>
                <span class="w-16 text-white">{pair.white}</span>
                <span class="w-16 text-white">{pair.black ?? ''}</span>
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-surface-500 text-sm">Sin jugadas.</p>
        {/if}
      </div>

      <!-- PGN -->
      <div class="card p-6 bg-surface-800 border border-surface-700">
        <h3 class="h4 text-white mb-3">PGN</h3>
        <textarea readonly class="textarea h-80 text-xs font-mono" value={selectedGame.pgn}
        ></textarea>
      </div>
    </div>
  {/if}
</div>
