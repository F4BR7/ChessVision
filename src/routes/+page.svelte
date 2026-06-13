<script lang="ts">
  import { games } from '$lib/games';
  import { goto } from '$app/navigation';
</script>

<!-- Clean Home/Dashboard -->
<!-- Dashboard Cards -->
<main class="mx-auto max-w-7xl px-6 py-8 space-y-8">
  <!-- Hero -->
  <section
  class="rounded-3xl border border-slate-700/60 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-14 shadow-2xl shadow-black/40"
>
  <div class="flex flex-col items-center text-center">

    <h1 class="mt-4 text-6xl font-extrabold leading-tight text-slate-50">
      Tu centro de análisis y
      <br />
      entrenamiento de
      <span class="text-emerald-400">ajedrez</span>
    </h1>
  </div>

  <div class="mt-12 grid gap-8 lg:grid-cols-[1.5fr_auto] lg:items-center">
    <div>
      <p class="max-w-3xl text-xl leading-relaxed text-slate-300">
        Entrena contra Stockfish, analiza partidas PGN, revisa partidas online
        y sigue tu evolución mediante estadísticas detalladas.
      </p>

      <div class="mt-8 flex flex-wrap gap-3">
        <span
          class="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-base text-emerald-300"
        >
          ✓ Stockfish
        </span>

        <span
          class="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-base text-cyan-300"
        >
          ✓ PGN
        </span>

        <span
          class="rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-base text-violet-300"
        >
          ✓ Revisión Online
        </span>

        <span
          class="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-base text-amber-300"
        >
          ✓ Estadísticas
        </span>
      </div>
    </div>

    <div class="flex  gap-4">
      <a
        href="/play"
        class="rounded-2xl bg-emerald-500 px-8 py-4 text-center text-lg font-semibold text-white shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-400 hover:shadow-emerald-500/30"
      >
        Jugar IA
      </a>

      <a
        href="/review"
        class="rounded-2xl border border-slate-600 bg-slate-800 px-8 py-4 text-center text-lg font-semibold text-slate-100 shadow-lg shadow-black/10 transition hover:border-slate-500 hover:bg-slate-700"
      >
        Revisar partida
      </a>
    </div>
  </div>
</section>



  <section class="mt-12 space-y-8">
  <div>
    <h2 class="text-3xl font-bold text-slate-100">
      ¿Qué puedes hacer con ChessVision?
    </h2>
    <p class="mt-2 max-w-3xl text-slate-400">
      No solo puedes jugar y analizar partidas: también puedes revisar tu rendimiento,
      ver tu progreso y seguir tus resultados desde un solo lugar.
    </p>
  </div>
  <!-- Estadísticas dentro de la misma sección -->
  <div class="grid gap-6 md:grid-cols-3">
    <div class="rounded-2xl border border-slate-700 bg-slate-800/70 p-6 shadow-lg shadow-black/10">
      <p class="text-sm text-slate-400">Partidas guardadas</p>
      <p class="mt-3 text-4xl font-bold text-slate-100">
  {$games.length}
</p>
      <p class="mt-2 text-sm text-slate-500">Total en tu biblioteca</p>
    </div>

    <div class="rounded-2xl border border-slate-700 bg-slate-800/70 p-6 shadow-lg shadow-black/10">
      <p class="text-sm text-slate-400">Partidas analizadas</p>
      <p class="mt-3 text-4xl font-bold text-emerald-400">
  {$games.filter((g) => g.accuracy !== undefined).length}
</p>
      <p class="mt-2 text-sm text-slate-500">Con precisión calculada</p>
    </div>

    <div class="rounded-2xl border border-slate-700 bg-slate-800/70 p-6 shadow-lg shadow-black/10">
      <p class="text-sm text-slate-400">Precisión promedio</p>
      <p class="mt-3 text-4xl font-bold text-lime-400">
  {(() => {
    const analyzed = $games.filter((g) => g.accuracy !== undefined);

    const avg =
      analyzed.length > 0
        ? analyzed.reduce(
            (sum, g) => sum + (g.accuracy ?? 0),
            0
          ) / analyzed.length
        : 0;

    return Math.round(avg);
  })()}%
</p>
      <p class="mt-2 text-sm text-slate-500">Basada en partidas analizadas</p>
    </div>
  </div>

  <div class="rounded-2xl border border-slate-700 bg-slate-800/70 p-6">
  <h3 class="text-2xl font-bold text-slate-100">
    Tu centro de actividad
  </h3>

  <p class="mt-3 max-w-4xl text-slate-400">
    Encuentra tus partidas recientes, estadísticas y herramientas de análisis
    desde un único panel de control.
  </p>
</div>
</section>

  <!-- que se puede hacer -->
  <!-- Rendimiento + Partidas recientes -->
<section class="grid gap-6 lg:grid-cols-[220px_220px_1fr]">

  <!-- ========================= -->
  <!-- COLUMNA IZQUIERDA -->
  <!-- ========================= -->

    <!-- Tu rendimiento -->
    <div class="rounded-2xl border border-slate-700 bg-slate-800/70 p-4">
      <div class="text-4xl">📈</div>

      <h3 class="mt-5 text-2xl font-bold text-slate-100">  
        Tu rendimiento
      </h3>

     <p class="mt-4 text-base leading-relaxed text-slate-400">
        Revisa tu precisión, tus partidas analizadas y tu progreso a lo largo del tiempo.
      </p>
    </div>

    <!-- Próximamente -->
    <div class="rounded-2xl border border-slate-700 bg-slate-800/70 p-4">
      <div class="text-4xl">🚀</div>

      <h3 class="mt-5 text-2xl font-bold text-slate-100">
        Próximamente
      </h3>

     <p class="mt-4 text-base leading-relaxed text-slate-400">
        El dashboard seguirá creciendo con más herramientas.
      </p>
    </div>


  <!-- ========================= -->
  <!-- COLUMNA DERECHA -->
  <!-- ========================= -->
  <div class="h-full">

    <!-- Partidas recientes -->
    <div class="rounded-2xl border border-slate-700 bg-slate-800/70 p-4">

      <div class="flex items-center justify-between gap-4">
        <h2 class="text-2xl font-bold text-white">
          Partidas recientes
        </h2>

        <a
          href="/library"
          class="text-sm font-medium text-emerald-400 hover:text-emerald-300"
        >
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
              class="w-full rounded-xl border border-slate-700 bg-slate-900/60 p-6 text-left transition hover:border-emerald-500 hover:bg-slate-900"
            >

              <div class="flex items-start justify-between gap-3">

                <div>

                  <p class="text-lg font-semibold text-white">
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
                    <p class="mt-3 text-sm text-emerald-400 line-clamp-2">
                      {game.opening}
                    </p>
                  {/if}

                </div>

                <div class="text-right">

                  {#if game.accuracy !== undefined}

                    <div class="text-2xl font-bold text-emerald-400">
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

          <div
            class="md:col-span-2 rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-400"
          >
            Todavía no tienes partidas guardadas.
          </div>

        {/if}

      </div>

    </div>

  </div>

</section>
</main>
