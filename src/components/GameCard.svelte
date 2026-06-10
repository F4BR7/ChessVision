<script lang="ts">
  export let type: string = 'AI';
  export let difficulty: number | undefined = undefined;
  export let date: Date = new Date();
  export let precision: number | undefined = undefined;

  function formatDate(d: Date): string {
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'ahora';
    if (minutes < 60) return `hace ${minutes}m`;
    if (hours < 24) return `hace ${hours}h`;
    if (days < 7) return `hace ${days}d`;
    return d.toLocaleDateString();
  }

  function getTypeLabel(t: string, level?: number): string {
    if (t === 'AI') return `vs IA Nivel ${level || 1}`;
    if (t === 'PGN') return 'PGN Analizado';
    return 'Partida Live';
  }
</script>

<div class="card p-4 bg-surface-800 border border-surface-700 hover:border-primary-500 cursor-pointer transition">
  <div class="flex items-start justify-between mb-2">
    <div class="font-semibold text-white">{getTypeLabel(type, difficulty)}</div>
    <div class="text-xs text-surface-400">{formatDate(date)}</div>
  </div>
  {#if precision !== undefined}
    <div class="text-sm text-surface-400">Precisión: <span class="text-primary-400 font-semibold">{precision}%</span></div>
  {/if}
</div>
