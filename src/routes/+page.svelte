<script lang="ts">
  import { games } from '$lib/games';
  import { formatGameType, formatDate, gameTitle, resultBadgeClass } from '$lib/format';

  $: recentGames = $games.slice(0, 6);
</script>

<!-- Clean Home/Dashboard -->
<div class="max-w-7xl mx-auto px-4 py-12">
  <div class="text-center mb-12">
    <h1 class="h1 mb-2 text-white">ChessVision</h1>
    <p class="text-lg text-surface-400">Análisis de ajedrez y juega contra IA</p>
  </div>

  <!-- Main Navigation Cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
    <a
      href="/play"
      class="card p-8 bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white cursor-pointer transition transform hover:scale-105"
    >
      <div class="text-5xl mb-4">🎮</div>
      <h2 class="h2 mb-2">Jugar vs IA</h2>
      <p class="text-surface-200">Selecciona dificultad y juega contra la mejor IA</p>
    </a>

    <a
      href="/library"
      class="card p-8 bg-gradient-to-br from-success-600 to-success-700 hover:from-success-500 hover:to-success-600 text-white cursor-pointer transition transform hover:scale-105"
    >
      <div class="text-5xl mb-4">📚</div>
      <h2 class="h2 mb-2">Biblioteca</h2>
      <p class="text-surface-200">Busca y abre tus partidas guardadas</p>
    </a>

    <a
      href="/review"
      class="card p-8 bg-gradient-to-br from-warning-600 to-warning-700 hover:from-warning-500 hover:to-warning-600 text-white cursor-pointer transition transform hover:scale-105"
    >
      <div class="text-5xl mb-4">🔍</div>
      <h2 class="h2 mb-2">Revisar Partidas Online</h2>
      <p class="text-surface-200">Importa y revisa partidas con análisis</p>
    </a>

    <a
      href="/stats"
      class="card p-8 bg-gradient-to-br from-error-600 to-error-700 hover:from-error-500 hover:to-error-600 text-white cursor-pointer transition transform hover:scale-105"
    >
      <div class="text-5xl mb-4">📈</div>
      <h2 class="h2 mb-2">Estadísticas</h2>
      <p class="text-surface-200">Ver tu progreso y estadísticas</p>
    </a>
  </div>

  <!-- Recent Games Section -->
  {#if recentGames.length > 0}
    <div class="border-t border-surface-700 pt-12">
      <div class="flex items-center justify-between mb-6">
        <h2 class="h2 text-white">Partidas Recientes</h2>
        <a href="/library" class="text-sm text-primary-400 hover:underline">Ver biblioteca →</a>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {#each recentGames as game (game.id)}
          <a
            href="/library"
            class="card p-4 bg-surface-800 border border-surface-700 hover:border-primary-500 cursor-pointer transition flex flex-col gap-2"
          >
            <div class="flex items-start justify-between gap-2">
              <span class="font-semibold text-white">{gameTitle(game)}</span>
              <span class="text-xs px-2 py-0.5 rounded {resultBadgeClass(game.result)}"
                >{game.result}</span
              >
            </div>
            <div class="text-xs text-surface-400">
              {formatGameType(game.type, game.difficulty)} · {formatDate(game.date)}
            </div>
            {#if game.accuracy !== undefined}
              <div class="text-sm text-surface-400">
                Precisión: <span class="text-primary-400 font-semibold">{game.accuracy}%</span>
              </div>
            {/if}
          </a>
        {/each}
      </div>
    </div>
  {/if}
</div>
