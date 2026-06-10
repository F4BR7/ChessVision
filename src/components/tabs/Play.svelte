<script lang="ts">
  import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';

  let difficulty = 1;
  const playDifficulty: Writable<number> = getContext('playDifficulty');

  $: playDifficulty.set(difficulty);

  const startNewGame = () => {
    // TODO: Initialize game with selected difficulty
    // TODO: Reset board and start game with AI
  };
</script>

<div class="w-full space-y-4">
  <h2 class="h2">Jugar contra la IA</h2>

  <div class="space-y-4">
    <div>
      <label class="font-bold block mb-2">Nivel de dificultad</label>
      <RadioGroup>
        <RadioItem bind:group={difficulty} name="difficulty" value={1}>
          Nivel 1 (Principiante)
        </RadioItem>
        <RadioItem bind:group={difficulty} name="difficulty" value={2}>
          Nivel 2 (Intermedio)
        </RadioItem>
        <RadioItem bind:group={difficulty} name="difficulty" value={3}>
          Nivel 3 (Avanzado)
        </RadioItem>
        <RadioItem bind:group={difficulty} name="difficulty" value={4}>
          Nivel 4 (Experto)
        </RadioItem>
        <RadioItem bind:group={difficulty} name="difficulty" value={5}>
          Nivel 5 (Maestro)
        </RadioItem>
      </RadioGroup>
    </div>

    <button
      class="btn variant-filled-primary w-full"
      on:click={startNewGame}
    >
      Nueva partida
    </button>
  </div>
</div>
