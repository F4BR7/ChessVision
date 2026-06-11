<script lang="ts">
  import Chessboard from '../../components/Chessboard.svelte';
  import EvaluationBar from '../../components/EvaluationBar.svelte';
  import AnalysisPanel from '../../components/AnalysisPanel.svelte';
  import { getContext, onMount } from 'svelte';
  import type { Readable } from 'svelte/store';

  
  const evaluation: Readable<any> = getContext('evaluation');
  const chess = getContext<any>('chess');
  const position = getContext<any>('position');
  const history = getContext<any>('history');
  const move = getContext<any>('move');
  const evaluations = getContext<any>('evaluations');

  onMount(() => {
    chess.reset();

    position.set(chess.fen());
    history.set([]);
    move.set(-1);

    if (evaluations?.set) {
        evaluations.set([]);
    }
});

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
