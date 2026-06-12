<script lang="ts">
  import { TabGroup, Tab } from '@skeletonlabs/skeleton';
  import Load from './tabs/Load.svelte';
  import ButtonFooter from './tabs/footers/ButtonFooter.svelte';
  import NavigationFooter from './tabs/footers/NavigationFooter.svelte';
  import Report from './tabs/Report.svelte';
  import Settings from './tabs/Settings.svelte';
  import { getContext, onMount } from 'svelte';
  import { Chess as ChessClass, type Chess, type Move } from 'chess.js';
  import type { Readable, Writable } from 'svelte/store';
  import { analyze_game } from '$lib/engine';
  import type { Evaluation } from '$models/Evaluation';
  import type { Settings as SettingsType } from '$models/Settings';
  import { log } from '$lib/log';
  import { page } from '$app/stores';
  import { games } from '$lib/games';
  import { buildGameRecord } from '$lib/pgn';
  import { computeAccuracy, countMistakes, countPlayerMistakes } from '$lib/evaluation';
  import { consumePendingPgn } from '$lib/library';

  let currentTab: string = 'load';

  // dsiplay names for players, not necessarily the ones from the PGN tags
  let whitePlayer = 'Blancas';
  let blackPlayer = 'Negras';

  // Load
  let strPgn: string = '';
  let initialPgn: string = '';
  let isLoading: boolean = false;
  let progress = 0;


// Si el análisis se realizó desde la ruta "Revisar".
  $: isReview = $page.url.pathname.startsWith('/review');

  // Persist a finished analysis into the local game library.
const saveAnalyzedGame = (
  pgn: string,
  report: Evaluation[],
  moves: Move[]
) => {
  try {
    const recordChess = new ChessClass();
    recordChess.loadPgn(pgn);

    // Accuracy general (Online / PGN)
    const accuracy = computeAccuracy(report, moves);

    // Buscar si corresponde a una partida AI guardada
    const existingGame = games.all().find(
      (g) => g.type === 'AI' && g.pgn === pgn
    );

    // Errores
    let inaccuracies: number;
    let mistakes: number;
    let blunders: number;

    if (existingGame?.playerColor) {
      // Solo errores del jugador
      ({
        inaccuracies,
        mistakes,
        blunders
      } = countPlayerMistakes(
        report,
        moves,
        existingGame.playerColor
      ));
    } else {
      // Online / PGN
      ({
        inaccuracies,
        mistakes,
        blunders
      } = countMistakes(report));
    }

    const record = buildGameRecord(
      recordChess,
      recordChess.history({ verbose: true }),
      {
        type: isReview ? 'Online' : 'PGN',

        // Accuracy global para Online/PGN
        accuracy: accuracy.overall,

        inaccuracies,
        mistakes,
        blunders,

        event: isReview
          ? 'Revisión online'
          : 'Análisis'
      }
    );

    // Actualizar partida AI existente
    if (existingGame) {
      existingGame.accuracy =
        existingGame.playerColor === 'black'
          ? accuracy.black
          : accuracy.white;

      existingGame.inaccuracies = inaccuracies;
      existingGame.mistakes = mistakes;
      existingGame.blunders = blunders;

      games.updateGame(existingGame);
    } else {
      // Guardar análisis Online / PGN
      games.addGame(record);
    }
  } catch (e) {
    log(`No se pudo guardar la partida analizada: ${e}`);
  }
};

  onMount(() => {
    const pending = consumePendingPgn();
    if (pending) {
      initialPgn = pending;
      strPgn = pending;
    }
  });

  const setProgress = (n: number) => {
    progress = n;
  };

  const onChangeStrPgn = (newPgn: string) => {
    strPgn = newPgn;
  };

  const analyze = async () => {
    isLoading = true;

    // add a line break after last comment for chess.com mobile PGN export
    strPgn = strPgn.replace(/](?![\s\S]*\])(?!\n\n)/, ']\n');

    log(strPgn);
    try {
      chess.loadPgn(strPgn);
      const headers = chess.header();
      whitePlayer = headers.White ?? 'Blancas';
      blackPlayer = headers.Black ?? 'Negras';
      history.set(chess.history({ verbose: true }));
      move.set(-1);
      position.set($history[0].before);
      const report = await analyze_game($engine, $history, chess, $settings.depth, setProgress);
      log(report);
      evaluations.set(report);
      saveAnalyzedGame(strPgn, report, $history);
      currentTab = 'report';
    } catch (e) {
      alert('Se produjo un error, inténtalo de nuevo.');
      throw e;
    } finally {
      isLoading = false;
      progress = 0;
    }
  };

  const chess: Chess = getContext('chess');
  const position: Writable<string> = getContext('position');
  const move: Writable<number> = getContext('move');
  const history: Writable<Move[]> = getContext('history');
  const engine: Readable<Worker> = getContext('engine');
  const evaluations: Writable<Evaluation[]> = getContext('evaluations');
  const settings: Writable<SettingsType> = getContext('settings');
</script>

<div class="card p-4 h-full flex flex-col">
  <section class="mb-4 grow">
  <div class="mb-3 flex justify-between text-sm text-surface-300">
    <span>Blancas: {whitePlayer}</span>
    <span>Negras: {blackPlayer}</span>
  </div>
    <TabGroup justify="justify-center">
      <Tab bind:group={currentTab} name="load" value="load">💾 Carga</Tab>
      <Tab bind:group={currentTab} name="report" value="report">📊 Informe</Tab>
      <Tab bind:group={currentTab} name="settings" value="settings">🛠️ Ajustes</Tab>
      <svelte:fragment slot="panel">
        {#if currentTab === 'load'}
          <Load onChange={onChangeStrPgn} {analyze} {isLoading} {initialPgn} />
        {:else if currentTab === 'report'}
          <Report />
        {:else if currentTab === 'settings'}
          <Settings />
        {/if}
      </svelte:fragment>
    </TabGroup>
  </section>
  <footer class="card-footer">
    {#if currentTab === 'load' || currentTab === 'settings'}
      <ButtonFooter onClick={analyze} {isLoading} {progress} />
    {:else if currentTab === 'report'}
      <NavigationFooter />
    {/if}
  </footer>
</div>
