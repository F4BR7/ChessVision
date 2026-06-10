<script lang="ts">
  import { games } from '$lib/games';

  const lastGame = games.getLastGame();
  const recentGames = games.getRecent(5);
</script>

<!-- Clean Home/Dashboard -->
<div class="max-w-7xl mx-auto px-4 py-12">
  <div class="text-center mb-12">
    <h1 class="h1 mb-2 text-white">ChessVision</h1>
    <p class="text-lg text-surface-400">Análisis de ajedrez y juega contra IA</p>
  </div>

  <!-- Main Navigation Cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
    <a href="/play" class="card p-8 bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white cursor-pointer transition transform hover:scale-105">
      <div class="text-5xl mb-4">🎮</div>
      <h2 class="h2 mb-2">Jugar vs IA</h2>
      <p class="text-surface-200">Selecciona dificultad y juega contra Stockfish</p>
    </a>

    <a href="/analysis" class="card p-8 bg-gradient-to-br from-accent-600 to-accent-700 hover:from-accent-500 hover:to-accent-600 text-white cursor-pointer transition transform hover:scale-105">
      <div class="text-5xl mb-4">📊</div>
      <h2 class="h2 mb-2">Analizar</h2>
      <p class="text-surface-200">Carga PGN y analiza con Stockfish</p>
    </a>

    <a href="/library" class="card p-8 bg-gradient-to-br from-success-600 to-success-700 hover:from-success-500 hover:to-success-600 text-white cursor-pointer transition transform hover:scale-105">
      <div class="text-5xl mb-4">📚</div>
      <h2 class="h2 mb-2">Biblioteca</h2>
      <p class="text-surface-200">Busca y abre tus partidas guardadas</p>
    </a>

    <a href="/review" class="card p-8 bg-gradient-to-br from-warning-600 to-warning-700 hover:from-warning-500 hover:to-warning-600 text-white cursor-pointer transition transform hover:scale-105">
      <div class="text-5xl mb-4">🔍</div>
      <h2 class="h2 mb-2">Revisar Partidas Online</h2>
      <p class="text-surface-200">Importa y revisa partidas con análisis</p>
    </a>

    <a href="/stats" class="card p-8 bg-gradient-to-br from-error-600 to-error-700 hover:from-error-500 hover:to-error-600 text-white cursor-pointer transition transform hover:scale-105">
      <div class="text-5xl mb-4">📈</div>
      <h2 class="h2 mb-2">Estadísticas</h2>
      <p class="text-surface-200">Ver tu progreso y estadísticas</p>
    </a>
  </div>

  <!-- Recent Games Section -->
  {#if recentGames.length > 0}
    <div class="border-t border-surface-700 pt-12">
      <h2 class="h2 mb-6 text-white">Partidas Recientes</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {#each recentGames as game (game.id)}
          <div class="card p-4 bg-surface-800 border border-surface-700 hover:border-primary-500 cursor-pointer transition">
            <div class="font-semibold text-white mb-2">
              {game.type === 'AI' ? `vs IA Nivel ${game.difficulty || 1}` : game.type === 'PGN' ? 'PGN Analizado' : 'Partida Live'}
            </div>
            {#if game.precision !== undefined}
              <div class="text-sm text-surface-400">
                Precisión: <span class="text-primary-400 font-semibold">{game.precision}%</span>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
