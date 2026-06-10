<script lang="ts">
  import { games } from '$lib/games';
  import StatsCard from '../../components/StatsCard.svelte';

  const allGames = games.getRecent(100);

  // Calculate statistics
  $: totalGames = allGames.length;
  $: avgPrecision = allGames.length > 0 
    ? Math.round(allGames.reduce((sum, g) => sum + (g.precision || 0), 0) / allGames.filter(g => g.precision).length)
    : 0;
  $: totalErrors = allGames.reduce((sum, g) => sum + (g.errors || 0), 0);
  $: totalBlunders = allGames.reduce((sum, g) => sum + (g.blunders || 0), 0);

  // Games by type
  $: aiGames = allGames.filter(g => g.type === 'AI').length;
  $: pgnGames = allGames.filter(g => g.type === 'PGN').length;
  $: liveGames = allGames.filter(g => g.type === 'Live').length;

  // Games by difficulty
  $: difficultyStats = {
    1: allGames.filter(g => g.type === 'AI' && g.difficulty === 1).length,
    2: allGames.filter(g => g.type === 'AI' && g.difficulty === 2).length,
    3: allGames.filter(g => g.type === 'AI' && g.difficulty === 3).length,
    4: allGames.filter(g => g.type === 'AI' && g.difficulty === 4).length,
    5: allGames.filter(g => g.type === 'AI' && g.difficulty === 5).length
  };
</script>

<div class="max-w-7xl mx-auto px-4 py-8">
  <h1 class="h1 mb-12 text-white">Estadísticas</h1>

  <!-- Overall Stats -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
    <div class="card p-6 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
      <div class="text-5xl font-bold mb-2">{totalGames}</div>
      <div class="text-lg opacity-90">Partidas Totales</div>
    </div>

    <div class="card p-6 bg-gradient-to-br from-accent-600 to-accent-700 text-white">
      <div class="text-5xl font-bold mb-2">{avgPrecision}%</div>
      <div class="text-lg opacity-90">Precisión Promedio</div>
    </div>

    <div class="card p-6 bg-gradient-to-br from-warning-600 to-warning-700 text-white">
      <div class="text-5xl font-bold mb-2">{totalErrors}</div>
      <div class="text-lg opacity-90">Errores Totales</div>
    </div>

    <div class="card p-6 bg-gradient-to-br from-error-600 to-error-700 text-white">
      <div class="text-5xl font-bold mb-2">{totalBlunders}</div>
      <div class="text-lg opacity-90">Blunders Totales</div>
    </div>
  </div>

  <!-- Games by Type -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
    <div class="card p-6 bg-surface-800 border border-surface-700">
      <h2 class="h2 mb-6 text-white">Partidas por Tipo</h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between p-3 bg-surface-700 rounded">
          <span class="text-surface-300">vs IA</span>
          <span class="text-white font-bold text-xl">{aiGames}</span>
        </div>
        <div class="flex items-center justify-between p-3 bg-surface-700 rounded">
          <span class="text-surface-300">PGN Analizados</span>
          <span class="text-white font-bold text-xl">{pgnGames}</span>
        </div>
        <div class="flex items-center justify-between p-3 bg-surface-700 rounded">
          <span class="text-surface-300">Partidas Live</span>
          <span class="text-white font-bold text-xl">{liveGames}</span>
        </div>
      </div>
    </div>

    <!-- Games by Difficulty -->
    <div class="card p-6 bg-surface-800 border border-surface-700">
      <h2 class="h2 mb-6 text-white">Partidas vs IA por Dificultad</h2>
      <div class="space-y-4">
        {#each [1, 2, 3, 4, 5] as level}
          <div class="flex items-center justify-between p-3 bg-surface-700 rounded">
            <span class="text-surface-300">Nivel {level}</span>
            <span class="text-white font-bold text-xl">{difficultyStats[level]}</span>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Recent Performance -->
  {#if allGames.length > 0}
    <div class="mb-12">
      <h2 class="h2 mb-6 text-white">Rendimiento Reciente</h2>
      <div class="card p-6 bg-surface-800 border border-surface-700">
        <StatsCard 
          title="Últimas 5 Partidas"
          precision={Math.round(allGames.slice(0, 5).reduce((sum, g) => sum + (g.precision || 0), 0) / allGames.slice(0, 5).filter(g => g.precision).length) || 0}
          errors={allGames.slice(0, 5).reduce((sum, g) => sum + (g.errors || 0), 0)}
          blunders={allGames.slice(0, 5).reduce((sum, g) => sum + (g.blunders || 0), 0)}
        />
      </div>
    </div>
  {/if}
</div>
