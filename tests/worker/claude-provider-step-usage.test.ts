import { afterAll, afterEach, beforeEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installScriptedClaudeSdk, createScriptedSession } from '../fixtures/worker/scripted-claude-sdk.js';
import * as sharedPaths from '../../src/shared/paths.js';
import { SettingsDefaultsManager } from '../../src/shared/SettingsDefaultsManager.js';
import { telemetryBuffer } from '../../src/services/telemetry/buffer.js';

const sdk = installScriptedClaudeSdk();
afterAll(() => sdk.restore());

const { ClaudeProvider } = await import('../../src/services/worker/ClaudeProvider.js');
const { SessionStore } = await import('../../src/services/sqlite/SessionStore.js');

const MEMORY_ID = 'memory-multipart-usage';
// A native SDK 0.3.172 + bundled CLI probe emits this same usage on each
// completed content block of one message.id. The finalized result separately
// reports output_tokens: 17. These fixtures exercise the live SDK contract,
// rather than the later completed snapshots in a persisted transcript.
// https://code.claude.com/docs/en/agent-sdk/cost-tracking#track-per-step-usage
const REPORTED = { input_tokens: 11, cache_creation_input_tokens: 23, cache_read_input_tokens: 101, output_tokens: 1 };

function observation(title: string): string {
  return `<observation><type>discovery</type><title>${title}</title>
<narrative>Independent evidence for ${title}.</narrative>
<facts><fact>${title} was observed.</fact></facts><concepts></concepts>
<files_read></files_read><files_modified></files_modified></observation>`;
}

function assistant(id: unknown, content: unknown, usage: Record<string, number> | null = REPORTED) {
  return {
    type: 'assistant',
    session_id: MEMORY_ID,
    message: { ...(id === undefined ? {} : { id }), content, ...(usage === null ? {} : { usage }) },
  };
}

function text(id: unknown, title: string, usage: Record<string, number> | null = REPORTED) {
  return assistant(id, [{ type: 'text', text: observation(title) }], usage);
}

function result(usage: Record<string, number> = { ...REPORTED, output_tokens: 17 }) {
  return { type: 'result', subtype: 'success', is_error: false, session_id: MEMORY_ID, usage, total_cost_usd: 0.001 };
}

type Row = { title: string; discovery_tokens: number; files_read: string };
let directory: string;
let stores: InstanceType<typeof SessionStore>[] = [];
let spies: Array<{ mockRestore(): void }> = [];
let sequence = 0;

beforeEach(() => {
  sdk.messages = [];
  sdk.capturedOptions.length = 0;
  directory = mkdtempSync(join(tmpdir(), 'claude-step-usage-'));
  const observerDirectory = join(directory, 'observer');
  mkdirSync(observerDirectory);
  const defaults = SettingsDefaultsManager.getAllDefaults();
  spies = [
    spyOn(sharedPaths.paths, 'dataDir').mockReturnValue(directory),
    spyOn(sharedPaths, 'ensureObserverSessionsDir').mockReturnValue(observerDirectory),
    spyOn(SettingsDefaultsManager, 'loadFromFile').mockReturnValue({
      ...defaults,
      CLAUDE_MEM_FOLDER_CLAUDEMD_ENABLED: 'false',
      CLAUDE_MEM_DEDUP_ENABLED: 'false',
    }),
    spyOn(telemetryBuffer, 'record').mockImplementation(() => {}),
  ];
});

afterEach(() => {
  for (const store of stores) store.close();
  stores = [];
  for (const spy of spies.reverse()) spy.mockRestore();
  spies = [];
  rmSync(directory, { recursive: true, force: true });
});

function harness() {
  const store = new SessionStore(':memory:', { syncOpsEnabled: false });
  stores.push(store);
  const contentId = `usage-content-${++sequence}`;
  const sessionDbId = store.createSDKSession(contentId, 'observer-project', 'Read the owned input', undefined, 'claude');
  const session = createScriptedSession(sessionDbId, {
    contentSessionId: contentId,
    earliestPendingTimestamp: 1700000000000,
    claimedMessageIds: [1],
  });
  let claimed = [{ type: 'observation', tool_name: 'Read', tool_input: { file_path: 'src/evidence.ts' } }];
  const confirmClaimedMessages = mock(async () => {
    const count = claimed.length;
    claimed = [];
    session.claimedMessageIds = [];
    session.earliestPendingTimestamp = null;
    return count;
  });
  const resetProcessingToPending = mock(async () => {
    session.claimedMessageIds = [];
    return 0;
  });
  const manager = {
    confirmClaimedMessages,
    resetProcessingToPending,
    getClaimedMessages: () => claimed,
    getMessageIterator: async function* () {},
  };
  const database = {
    getSessionStore: () => store,
    getChromaSync: () => null,
    getCloudSync: () => null,
  };
  return {
    session,
    store,
    confirmClaimedMessages,
    resetProcessingToPending,
    provider: new ClaudeProvider(database as never, manager as never),
    rows: () => store.db.query('SELECT title, discovery_tokens, files_read FROM observations ORDER BY id').all() as Row[],
  };
}

function expectCounters(h: ReturnType<typeof harness>, input: number, output: number, cache: number) {
  expect(h.session.cumulativeInputTokens).toBe(input);
  expect(h.session.cumulativeOutputTokens).toBe(output);
  expect(h.session.cumulativeCacheReadTokens ?? 0).toBe(cache);
}

describe('ClaudeProvider counts live step usage once per message ID', () => {
  it('carries a thinking frame usage into the text block without charging it twice', async () => {
    const h = harness();
    sdk.messages = [
      assistant('msg_step', [{ type: 'thinking', thinking: 'owned fixture reasoning', signature: 'owned-signature' }]),
      text('msg_step', 'Stored after thinking'),
      result(),
    ];

    await h.provider.startSession(h.session);

    expectCounters(h, 34, 1, 101);
    expect(h.rows().map(row => row.discovery_tokens)).toEqual([35]);
    expect(JSON.parse(h.rows()[0].files_read)).toContain('src/evidence.ts');
    expect(h.confirmClaimedMessages).toHaveBeenCalledTimes(1);
    expect(sdk.capturedOptions).toHaveLength(1);
  });

  it('stores every text block while persisting the step cost only once', async () => {
    const h = harness();
    sdk.messages = [
      text('msg_step', 'Compiler output explained'),
      text('msg_step', 'Runtime branch identified'),
      result(),
    ];

    await h.provider.startSession(h.session);

    expectCounters(h, 34, 1, 101);
    expect(h.rows().map(row => [row.title, row.discovery_tokens])).toEqual([
      ['Compiler output explained', 35],
      ['Runtime branch identified', 0],
    ]);
    expect(h.confirmClaimedMessages).toHaveBeenCalledTimes(2);
  });

  it('recognizes a repeated step even after a different step has reported usage', async () => {
    const h = harness();
    sdk.messages = [
      text('msg_a', 'First response block'),
      text('msg_b', 'Separate response step'),
      text('msg_a', 'Later first-step block'),
      result({ input_tokens: 22, cache_creation_input_tokens: 46, cache_read_input_tokens: 202, output_tokens: 34 }),
    ];

    await h.provider.startSession(h.session);

    expectCounters(h, 68, 2, 202);
    expect(h.rows().map(row => row.discovery_tokens)).toEqual([35, 35, 0]);
    expect(h.rows()).toHaveLength(3);
  });

  it('does not need a result frame to avoid duplicate accounting on an interrupted stream', async () => {
    const h = harness();
    sdk.messages = [
      assistant('msg_step', [{ type: 'thinking', thinking: 'owned fixture reasoning', signature: 'owned-signature' }]),
      text('msg_step', 'Stored before stream exit'),
    ];

    await h.provider.startSession(h.session);

    expectCounters(h, 34, 1, 101);
    expect(h.rows().map(row => row.discovery_tokens)).toEqual([35]);
    expect(h.session.abortReason).toBe('transport:sdk_eof');
    expect(sdk.capturedOptions).toHaveLength(1);
  });

  it('counts distinct message IDs independently even when their usage is identical', async () => {
    const h = harness();
    sdk.messages = [text('msg_a', 'One distinct step'), text('msg_b', 'Another distinct step'), result()];

    await h.provider.startSession(h.session);

    expectCounters(h, 68, 2, 202);
    expect(h.rows().map(row => row.discovery_tokens)).toEqual([35, 35]);
  });

  it('does not consume the message ID before a usage block arrives', async () => {
    const h = harness();
    sdk.messages = [
      text('msg_step', 'No usage supplied yet', null),
      text('msg_step', 'Usage arrives with this block'),
      result(),
    ];

    await h.provider.startSession(h.session);

    expectCounters(h, 34, 1, 101);
    expect(h.rows().map(row => row.discovery_tokens)).toEqual([0, 35]);
  });

  it('keeps the existing per-frame fallback when the gateway supplies no usable ID', async () => {
    const h = harness();
    sdk.messages = [
      text(undefined, 'Absent identity'),
      text('', 'Empty identity'),
      text(17, 'Non-string identity'),
      result(),
    ];

    await h.provider.startSession(h.session);

    expectCounters(h, 102, 3, 303);
    expect(h.rows().map(row => row.discovery_tokens)).toEqual([35, 35, 35]);
  });

  it('releases message IDs at the result boundary for the next turn', async () => {
    const h = harness();
    sdk.messages = [
      text('gateway-reused-id', 'First completed turn'),
      result(),
      text('gateway-reused-id', 'Second completed turn'),
      result(),
    ];

    await h.provider.startSession(h.session);

    expectCounters(h, 68, 2, 202);
    expect(h.rows().map(row => row.discovery_tokens)).toEqual([35, 35]);
  });

  it('retains finalized gateway backfill when repeated frames report zero input', async () => {
    const h = harness();
    const zeroInput = { input_tokens: 0, output_tokens: 1 };
    sdk.messages = [
      assistant('msg_gateway', [{ type: 'thinking', thinking: 'owned fixture reasoning', signature: 'owned-signature' }], zeroInput),
      text('msg_gateway', 'Gateway result correction', zeroInput),
      result({ input_tokens: 900, cache_creation_input_tokens: 100, cache_read_input_tokens: 50, output_tokens: 40 }),
    ];

    await h.provider.startSession(h.session);

    expectCounters(h, 1000, 1, 50);
    expect(h.rows().map(row => row.discovery_tokens)).toEqual([1040]);
    expect(h.confirmClaimedMessages).toHaveBeenCalledTimes(1);
  });

  it('does not share counted IDs between independent sessions', async () => {
    const first = harness();
    sdk.messages = [text('msg_shared', 'First session evidence'), result()];
    await first.provider.startSession(first.session);

    const second = harness();
    sdk.messages = [text('msg_shared', 'Second session evidence'), result()];
    await second.provider.startSession(second.session);

    expectCounters(first, 34, 1, 101);
    expectCounters(second, 34, 1, 101);
    expect(first.rows().map(row => row.discovery_tokens)).toEqual([35]);
    expect(second.rows().map(row => row.discovery_tokens)).toEqual([35]);
  });
});
