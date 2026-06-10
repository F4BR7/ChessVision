<script lang="ts">
  export let precision: number = 0;
  export let errors: number = 0;
  export let blunders: number = 0;
  export let title: string = 'Última Partida';
</script>

<div class="card p-6 bg-surface-800 border border-surface-700">
  <h3 class="h3 mb-4 text-white">{title}</h3>
  <div class="grid grid-cols-3 gap-4">
    <div class="text-center">
      <div class="text-3xl font-bold text-primary-400">{precision}%</div>
      <div class="text-sm text-surface-400 mt-2">Precisión</div>
    </div>
    <div class="text-center">
      <div class="text-3xl font-bold text-warning-400">{errors}</div>
      <div class="text-sm text-surface-400 mt-2">Errores</div>
    </div>
    <div class="text-center">
      <div class="text-3xl font-bold text-error-400">{blunders}</div>
      <div class="text-sm text-surface-400 mt-2">Blunders</div>
    </div>
  </div>
</div>
