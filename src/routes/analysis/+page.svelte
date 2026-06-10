<script lang="ts">
  import Chessboard from '../../components/Chessboard.svelte';
  import EvaluationBar from '../../components/EvaluationBar.svelte';
  import AnalysisPanel from '../../components/AnalysisPanel.svelte';
  import { getContext } from 'svelte';
  import type { Readable } from 'svelte/store';
  
  const evaluation: Readable<any> = getContext('evaluation');
</script>

<!-- Analysis Layout: Board + Side Panel -->
<div class="flex flex-wrap justify-center my-6 md:my-16 gap-6 px-4">
  <div class="size-4/5 md:size-3/5 lg:size-5/12 flex gap-x-4">
    <EvaluationBar evaluation={$evaluation} />
    <div class="grow">
      <Chessboard />
    </div>
  </div>
  <div class="w-4/5 md:w-1/4">
    <AnalysisPanel />
  </div>
</div>
