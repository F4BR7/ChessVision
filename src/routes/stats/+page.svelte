<script lang="ts">
  import { games } from '$lib/games';
  import { computeStatistics, computeOpeningStats, getWins, getLosses, getDraws } from '$lib/stats';
  import StatsCard from '../../components/StatsCard.svelte';
  import { getWinRate, getBestAccuracy, getWorstAccuracy, getFavoriteOpening } from '$lib/stats';

  // NOTE: This page is the foundation for the upcoming Statistics module.
  // It consumes the pure helpers in `$lib/stats` so future visualizations
  // (rating progression, accuracy trends, per-opening performance) can be
  // layered on top without touching data-aggregation logic.
  $: aiGames = $games.filter((g) => g.type === 'AI');

  $: winRate = getWinRate(aiGames);

  $: bestAccuracy = getBestAccuracy(aiGames);

  $: worstAccuracy = getWorstAccuracy(aiGames);

  $: favoriteOpening = getFavoriteOpening(aiGames);

  // Resultados del jugador
  $: wins = getWins(aiGames);

  $: losses = getLosses(aiGames);

  $: draws = getDraws(aiGames);

  $: stats = computeStatistics(aiGames);

  $: openingStats = computeOpeningStats(aiGames);

  $: recent = aiGames.slice(0, 5);
  $: recentAccuracy = (() => {
    const values = recent.map((g) => g.accuracy).filter((a): a is number => typeof a === 'number');
    return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  })();
  $: recentMistakes = recent.reduce((sum, g) => sum + (g.mistakes ?? 0), 0);
  $: recentBlunders = recent.reduce((sum, g) => sum + (g.blunders ?? 0), 0);
</script>

<div class="max-w-7xl mx-auto px-4 py-8">
  <div class="flex items-center gap-3 mb-2">
    <h1 class="h1 text-white">Estadísticas</h1>
    <span class="badge variant-soft-primary">Base</span>
  </div>
  <p class="text-surface-400 mb-12">
    Estructura inicial del módulo de estadísticas. Más métricas próximamente.
  </p>

  <!-- Overall Stats -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
    <div class="card p-6 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
      <div class="text-5xl font-bold mb-2">{stats.totalGames}</div>
      <div class="text-lg opacity-90">Partidas Totales</div>
    </div>

    <div class="card p-6 bg-gradient-to-br from-tertiary-600 to-tertiary-700 text-white">
      <div class="text-5xl font-bold mb-2">{stats.averageAccuracy}%</div>
      <div class="text-lg opacity-90">Precisión Promedio</div>
    </div>

    <div class="card p-6 bg-gradient-to-br from-warning-600 to-warning-700 text-white">
      <div class="text-5xl font-bold mb-2">{stats.totalMistakes}</div>
      <div class="text-lg opacity-90">Errores Totales</div>
    </div>

    <div class="card p-6 bg-gradient-to-br from-error-600 to-error-700 text-white">
      <div class="text-5xl font-bold mb-2">{stats.totalBlunders}</div>
      <div class="text-lg opacity-90">Torpezas Totales</div>
    </div>
  </div>

  <!-- ================================================== -->
  <!-- ESTADÍSTICAS AVANZADAS -->
  <!-- ================================================== -->

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
    <div class="card p-6 bg-surface-800 border border-surface-700">
      <div class="text-4xl font-bold text-success-400 mb-2">
        {winRate}%
      </div>
      <div class="text-surface-300">Win Rate</div>
    </div>

    <div class="card p-6 bg-surface-800 border border-surface-700">
      <div class="text-4xl font-bold text-primary-400 mb-2">
        {bestAccuracy}%
      </div>
      <div class="text-surface-300">Mejor Accuracy</div>
    </div>

    <div class="card p-6 bg-surface-800 border border-surface-700">
      <div class="text-4xl font-bold text-warning-400 mb-2">
        {worstAccuracy}%
      </div>
      <div class="text-surface-300">Peor Accuracy</div>
    </div>

    <div class="card p-6 bg-surface-800 border border-surface-700">
      <div class="text-xl font-bold text-white mb-2 truncate">
        {favoriteOpening}
      </div>
      <div class="text-surface-300">Apertura Favorita</div>
    </div>
  </div>

  <!-- Games by Type / Result -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
    <div class="card p-6 bg-surface-800 border border-surface-700">
      <h2 class="h2 mb-6 text-white">Partidas por Tipo</h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between p-3 bg-surface-700 rounded">
          <span class="text-surface-300">vs IA</span>
          <span class="text-white font-bold text-xl">{stats.byType.AI}</span>
        </div>
        <div class="flex items-center justify-between p-3 bg-surface-700 rounded">
          <span class="text-surface-300">PGN Analizados</span>
          <span class="text-white font-bold text-xl">{stats.byType.PGN}</span>
        </div>
        <div class="flex items-center justify-between p-3 bg-surface-700 rounded">
          <span class="text-surface-300">Revisión Online</span>
          <span class="text-white font-bold text-xl">{stats.byType.Online}</span>
        </div>
      </div>
    </div>

    <div class="card p-6 bg-surface-800 border border-surface-700">
      <h2 class="h2 mb-6 text-white">Resultados</h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between p-3 bg-surface-700 rounded">
          <span class="text-surface-300">Victorias</span>
          <span class="text-white font-bold text-xl">{wins}</span>
        </div>
        <div class="flex items-center justify-between p-3 bg-surface-700 rounded">
          <span class="text-surface-300">Derrotas</span>
          <span class="text-white font-bold text-xl">{losses}</span>
        </div>
        <div class="flex items-center justify-between p-3 bg-surface-700 rounded">
          <span class="text-surface-300">Tablas</span>
          <span class="text-white font-bold text-xl">{draws}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Top openings -->
  {#if openingStats.length > 0}
    <div class="mb-12">
      <h2 class="h2 mb-6 text-white">Aperturas Más Jugadas</h2>
      <div class="card p-6 bg-surface-800 border border-surface-700 space-y-3">
        {#each openingStats as opening}
          <div class="flex items-center justify-between p-3 bg-surface-700 rounded">
            <span class="text-surface-300 truncate">{opening.opening}</span>
            <span class="text-white font-bold">{opening.count}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Recent Performance -->
  {#if recent.length > 0}
    <div class="mb-12">
      <h2 class="h2 mb-6 text-white">Rendimiento Reciente</h2>
      <div class="card p-6 bg-surface-800 border border-surface-700">
        <StatsCard
          title="Últimas 5 Partidas"
          precision={recentAccuracy}
          errors={recentMistakes}
          blunders={recentBlunders}
        />
      </div>
    </div>
  {/if}
</div>
