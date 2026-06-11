<script lang="ts">
  import { games } from '$lib/games';
  import { goto } from '$app/navigation';

</script>

<!-- Clean Home/Dashboard -->
<!-- Dashboard Cards -->
<main class="mx-auto max-w-7xl px-6 py-8 space-y-8">
  <!-- Hero -->
  <section class="rounded-3xl border border-slate-700/60 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 shadow-lg">
    <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-sm font-medium tracking-wide text-slate-400">ChessVision</p>
        <h1 class="mt-2 text-4xl font-bold text-white">Tu centro de análisis y entrenamiento</h1>
        <p class="mt-3 max-w-2xl text-slate-400">
          Juega contra IA, revisa tus partidas y sigue tu progreso desde un solo lugar.
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <a
          href="/play"
          class="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-400"
        >
          Jugar IA
        </a>
        <a
          href="/review"
          class="rounded-xl border border-slate-600 bg-slate-800 px-5 py-3 font-semibold text-white transition hover:border-slate-500 hover:bg-slate-700"
        >
          Revisar partida
        </a>
      </div>
    </div>
  </section>

  <!-- Stats -->
  <section class="grid grid-cols-1 gap-6 md:grid-cols-3">
    <div class="rounded-2xl border border-slate-700 bg-slate-800/70 p-6">
      <p class="text-sm text-slate-400">Partidas guardadas</p>
      <p class="mt-3 text-4xl font-bold text-white">{$games.length}</p>
      <p class="mt-2 text-sm text-slate-500">Total en tu biblioteca</p>
    </div>

    <div class="rounded-2xl border border-slate-700 bg-slate-800/70 p-6">
      <p class="text-sm text-slate-400">Partidas analizadas</p>
      <p class="mt-3 text-4xl font-bold text-emerald-400">
        {$games.filter((g) => g.accuracy !== undefined).length}
      </p>
      <p class="mt-2 text-sm text-slate-500">Con precisión calculada</p>
    </div>

    <div class="rounded-2xl border border-slate-700 bg-slate-800/70 p-6">
      <p class="text-sm text-slate-400">Precisión promedio</p>
      <p class="mt-3 text-4xl font-bold text-lime-400">
        {(() => {
          const analyzed = $games.filter((g) => g.accuracy !== undefined)
          const avg =
            analyzed.length > 0
              ? analyzed.reduce((sum, g) => sum + (g.accuracy ?? 0), 0) / analyzed.length
              : 0
          return Math.round(avg)
        })()}%
      </p>
      <p class="mt-2 text-sm text-slate-500">Basada en partidas analizadas</p>
    </div>
  </section>

  <!-- Main content -->
  <section class="grid grid-cols-1 gap-6 lg:grid-cols-12">
    <!-- Quick actions -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:col-span-5">
      <a
        href="/play"
        class="rounded-2xl border border-slate-700 bg-slate-800/70 p-6 transition hover:border-emerald-400 hover:bg-slate-800"
      >
        <div class="text-3xl">🎮</div>
        <h2 class="mt-4 text-xl font-semibold text-white">Nueva partida</h2>
        <p class="mt-2 text-slate-400">Juega contra Stockfish y prueba tu nivel.</p>
      </a>

      <a
        href="/review"
        class="rounded-2xl border border-slate-700 bg-slate-800/70 p-6 transition hover:border-cyan-400 hover:bg-slate-800"
      >
        <div class="text-3xl">🔍</div>
        <h2 class="mt-4 text-xl font-semibold text-white">Analizar partida</h2>
        <p class="mt-2 text-slate-400">Importa PGN, revisa errores y ve tus mejores jugadas.</p>
      </a>
    </div>

    <!-- Recent games -->
    <div class="lg:col-span-7">
      <div class="rounded-2xl border border-slate-700 bg-slate-800/70 p-6">
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-2xl font-bold text-white">Partidas recientes</h2>
          <a href="/library" class="text-sm font-medium text-emerald-400 hover:text-emerald-300">
            Ver biblioteca →
          </a>
        </div>

        <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {#if $games.length > 0}
            {#each $games.slice(0, 2) as game}
              <button
                on:click={() => {
                    sessionStorage.setItem('selectedGameId', String(game.id));
                    goto('/library');
                }}
                class="w-full rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-left transition hover:border-emerald-500 hover:bg-slate-900"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="font-semibold text-white">
                      {#if game.white && game.black}
                        {game.white} vs {game.black}
                      {:else if game.type === 'AI'}
                        Jugador vs IA Nivel {game.difficulty ?? '?'}
                      {:else}
                        Jugador vs Jugador
                      {/if}
                    </p>
                  
                    <p class="mt-1 text-sm text-slate-400">
                      {#if game.type === 'AI'}
                        Partida IA
                      {:else if game.type === 'Online'}
                        Revisión Online
                      {:else if game.type === 'PGN'}
                        Importada
                      {:else}
                        Partida
                      {/if}
                    </p>
                  
                    <p class="text-xs text-slate-500">
                      {game.date.toLocaleDateString('es-PY')}
                    </p>
                  
                    {#if game.opening}
                      <p class="mt-2 text-xs text-emerald-400 line-clamp-2">
                        {game.opening}
                      </p>
                    {/if}
                  </div>
                  <div class="text-right">
                    {#if game.accuracy !== undefined}
                      <div class="font-bold text-emerald-400">
                        {Math.round(game.accuracy)}%
                      </div>
                      <div class="text-xs text-slate-500">
                        Precisión
                      </div>
                    {:else}
                      <div class="text-xs text-slate-500">
                        Sin revisar
                      </div>
                    {/if}
                  </div>
                </div>
              </button>
            {/each}
          {:else}
            <div class="md:col-span-2 rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
              Todavía no tienes partidas guardadas.
            </div>
          {/if}
        </div>
      </div>
    </div>
  </section>
</main>