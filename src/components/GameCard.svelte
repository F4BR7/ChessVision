<script lang="ts">
  export let type: string = 'AI';
  export let difficulty: number | undefined = undefined;
  export let date: Date = new Date();
  export let precision: number | undefined = undefined;

  export let white: string | undefined = undefined;
  export let black: string | undefined = undefined;
  export let opening: string | undefined = undefined;

  function formatDate(d: Date): string {
    return d.toLocaleDateString('es-PY');
  }

  function getTitle(): string {
    if (white && black) {
      return `${white} vs ${black}`;
    }

    if (type === 'AI') {
      return `Jugador vs IA Nivel ${difficulty || 1}`;
    }

    return 'Jugador vs Jugador';
  }

  function getCategory(): string {
    if (type === 'AI') return 'Partida IA';
    if (type === 'PGN') return 'Importada';
    if (type === 'Online') return 'Revisión Online';
    if (type === 'Live') return 'Partida Live';

    return 'Partida';
  }
</script>

<div
  class="card p-4 bg-surface-800 border border-surface-700 hover:border-primary-500 cursor-pointer transition"
>
  <div class="flex justify-between items-start gap-3">
    <div>
      <h3 class="font-semibold text-white text-base">
        {getTitle()}
      </h3>

      <p class="text-sm text-surface-400 mt-1">
        {getCategory()}
      </p>

      <p class="text-sm text-surface-500">
        {formatDate(date)}
      </p>

      {#if opening}
        <p class="text-sm text-primary-300 mt-2">
          ♟ {opening}
        </p>
      {/if}
    </div>

    {#if precision !== undefined}
      <div class="text-right">
        <div class="text-primary-400 font-bold">
          {precision}%
        </div>
        <div class="text-xs text-surface-500">Precisión</div>
      </div>
    {:else}
      <div class="text-xs text-surface-500">Sin revisar</div>
    {/if}
  </div>
</div>
