<script lang="ts">
  import Chessboard from '../../components/Chessboard.svelte';
  import EvaluationBar from '../../components/EvaluationBar.svelte';
  import AnalysisPanel from '../../components/AnalysisPanel.svelte';
  import { getContext, onMount } from 'svelte';
  import type { Readable, Writable } from 'svelte/store';
  import type { Chess, Move } from 'chess.js';
  import type { Evaluation } from '$models/Evaluation';

  const evaluation: Readable<Evaluation> = getContext('evaluation');
  const chess: Chess = getContext('chess');
  const position: Writable<string> = getContext('position');
  const history: Writable<Move[]> = getContext('history');
  const move: Writable<number> = getContext('move');
  const evaluations: Writable<Evaluation[]> = getContext('evaluations');

  onMount(() => {
    chess.reset();

    position.set(chess.fen());
    history.set([]);
    move.set(-1);

    evaluations.set([]);
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
