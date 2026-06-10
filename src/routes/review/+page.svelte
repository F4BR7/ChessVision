<script lang="ts">
  import Chessboard from '../../components/Chessboard.svelte';
  import EvaluationBar from '../../components/EvaluationBar.svelte';
  import AnalysisPanel from '../../components/AnalysisPanel.svelte';
  import { getContext } from 'svelte';
  import type { Readable } from 'svelte/store';
  
  const evaluation: Readable<any> = getContext('evaluation');
</script>

<!-- Review Online Games: Board + Move List + Engine Review -->
<div class="mx-auto my-6 md:my-10 max-w-[1600px] px-4">
  <div class="flex justify-center gap-8 items-start">

    <div class="flex flex-1 max-w-[800px] gap-4">
      <EvaluationBar evaluation={$evaluation} />

      <div class="flex-1">
        <Chessboard />
      </div>
    </div>

    <div class="w-[420px] shrink-0">
      <AnalysisPanel />
    </div>

  </div>
</div>
