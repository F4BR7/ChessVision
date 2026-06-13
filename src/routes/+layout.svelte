<script lang="ts">
  import '../app.postcss';
  import 'cm-chessboard/assets/chessboard.css';

  import { initializeStores, Modal, type ModalComponent } from '@skeletonlabs/skeleton';
  import EngineHelp from '../components/tabs/modals/EngineHelp.svelte';
  import ChessComGameSelection from '../components/tabs/modals/ChessComGameSelection.svelte';
  import TopNav from '../components/TopNav.svelte';
  import { onMount, setContext } from 'svelte';
  import { writable, readonly, derived } from 'svelte/store';
  import { preloadAudio } from '$lib/media';
  import posthog from 'posthog-js';
  import * as Sentry from '@sentry/browser';
  import { Chess, DEFAULT_POSITION, type Move } from 'chess.js';
  import { init } from '$lib/engine';
  import type { Evaluation } from '$models/Evaluation';
  import Label from '$models/Label';
  import type { Settings as SettingsType } from '$models/Settings';
  import { browser } from '$app/environment';
  import {
    PUBLIC_POSTHOG_TOKEN,
    PUBLIC_POSTHOG_URL,
    PUBLIC_SENTRY_DSN,
    PUBLIC_SENTRY_ORG,
    PUBLIC_SENTRY_PROJECT_ID
  } from '$env/static/public';

  initializeStores();

  // Setup all chess game contexts
  setContext('chess', new Chess());
  const history = writable<Move[]>([]);
  setContext('history', history);
  const position = writable(DEFAULT_POSITION);
  setContext('position', position);
  const move = writable(-1);
  setContext('move', move);
  const evaluations = writable<Evaluation[]>([]);
  setContext('evaluations', evaluations);
  const engine = writable<Worker>();
  const exposedEngine = readonly(engine);
  setContext('engine', exposedEngine);
  const evaluation = derived([evaluations, move], ([$evaluations, $move]) => {
    if ($move >= 0 && $evaluations.length > $move) return $evaluations[$move];
    else
      return {
        score: 0,
        type: 'cp',
        pv: '',
        label: Label.UNDEFINED
      } as Evaluation;
  });
  setContext('evaluation', evaluation);
  const settings = writable<SettingsType>({
    orientation: 'w',
    depth: 15,
    engine: 'lite-single'
  });
  setContext('settings', settings);
  const settingsEngine = derived(settings, ($settings) => $settings.engine);

  // Setup playDifficulty context for Play mode
  const playDifficulty = writable<number>(3);
  setContext('playDifficulty', playDifficulty);

  const registry: Record<string, ModalComponent> = {
    engineHelp: { ref: EngineHelp },
    chessComGameSelection: { ref: ChessComGameSelection }
  };

  onMount(() => {
    if (PUBLIC_POSTHOG_URL && PUBLIC_POSTHOG_TOKEN) {
      posthog.init(PUBLIC_POSTHOG_TOKEN, {
        api_host: PUBLIC_POSTHOG_URL,
        person_profiles: 'identified_only'
      });
    }

    if (PUBLIC_SENTRY_DSN && PUBLIC_SENTRY_ORG && PUBLIC_SENTRY_PROJECT_ID) {
      Sentry.init({
        dsn: PUBLIC_SENTRY_DSN,
        tracesSampleRate: 1.0,
        integrations: [
          posthog.sentryIntegration({
            organization: PUBLIC_SENTRY_ORG,
            projectId: parseInt(PUBLIC_SENTRY_PROJECT_ID),
            severityAllowList: ['error', 'info']
          })
        ]
      });
    }

    let cleanupEngine = () => {};

    // Recreate the Stockfish worker whenever the selected engine changes.
    if (browser) {
      let currentWorker: Worker | undefined;
      const unsubscribe = settingsEngine.subscribe((eng) => {
        currentWorker?.terminate();
        init(eng).then((worker) => {
          currentWorker = worker;
          engine.set(worker);
        });
      });

      cleanupEngine = () => {
        unsubscribe();
        currentWorker?.terminate();
      };
    }

    preloadAudio('sfx-move', '/media/move.webm');
    preloadAudio('sfx-capture', '/media/capture.webm');
    preloadAudio('sfx-check', '/media/check.webm');
    preloadAudio('sfx-promotion', '/media/promotion.webm');
    preloadAudio('sfx-checkmate', '/media/checkmate.webm');

    return cleanupEngine;
  });
</script>

<TopNav />
<slot />
<Modal components={registry} />

<style>
  :global(body) {
    background-color: #1a1a2e;
  }
</style>
