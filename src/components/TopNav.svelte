<script lang="ts">
  import { page } from '$app/stores';
</script>

<nav class="bg-surface-900 border-b border-surface-700 sticky top-0 z-50">
  <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
    <!-- Logo/Title -->
    <div class="flex items-center gap-2">
      <span class="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
        ChessVision
      </span>
    </div>

    
    <!-- Navigation Links -->
    <div class="flex items-center gap-1 flex-wrap justify-center">
      <a
        href="/"
        class="px-4 py-2 rounded-lg transition {$page.url.pathname === '/'
            ? 'bg-primary-600 text-white'
            : 'text-surface-300 hover:bg-surface-800'}"
    >
        🏠 Inicio
      </a>
      {#if $page.url.pathname !== '/play'}

    <a
        href="/library"
        class="px-4 py-2 rounded-lg transition {$page.url.pathname === '/library'
            ? 'bg-primary-600 text-white'
            : 'text-surface-300 hover:bg-surface-800'}"
    >
        📚 Biblioteca
    </a>

    <a
        href="/stats"
        class="px-4 py-2 rounded-lg transition {$page.url.pathname === '/stats'
            ? 'bg-primary-600 text-white'
            : 'text-surface-300 hover:bg-surface-800'}"
    >
        📈 Estadísticas
    </a>
    {/if}
</div>
  </div>
</nav>

<style>
  nav {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
</style>
