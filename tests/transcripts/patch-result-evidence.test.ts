import { afterEach, beforeEach, expect, it, spyOn } from 'bun:test';
import { Database } from 'bun:sqlite';
import { fileEditHandler } from '../../src/cli/handlers/file-edit.js';
import { SessionStore } from '../../src/services/sqlite/SessionStore.js';
import { TranscriptEventProcessor } from '../../src/services/transcripts/processor.js';
import type { TranscriptSchema } from '../../src/services/transcripts/types.js';
import { extractObservationFileEvidence } from '../../src/services/worker/agents/ResponseProcessor.js';
import { setIngestContext } from '../../src/services/worker/http/shared.js';

const patch = '*** Begin Patch\n*** Update File: src/a.ts\n@@\n-old\n+new\n*** End Patch';
const schema: TranscriptSchema = { name: 'patch-result', sessionIdPath: 'session', events: [
  { name: 'use', match: { path: 'type', equals: 'use' }, action: 'tool_use', fields: {
    toolId: 'id', toolName: 'name', toolInput: 'input', toolResponse: 'output',
  } },
  { name: 'result', match: { path: 'type', equals: 'result' }, action: 'tool_result', fields: {
    toolId: 'id', toolResponse: 'output',
  } },
] };
const watch = { name: 'codex', path: '/unused', workspace: '/repo', schema };
let store: SessionStore;
let processor: TranscriptEventProcessor;
let queued: any[];
let edits: ReturnType<typeof spyOn>;

beforeEach(() => {
  queued = [];
  store = new SessionStore(new Database(':memory:'));
  processor = new TranscriptEventProcessor();
  edits = spyOn(fileEditHandler, 'execute').mockResolvedValue({ continue: true });
  setIngestContext({
    sessionManager: { queueObservation: (_id: number, message: any) => { queued.push(message); } } as any,
    dbManager: { getSessionStore: () => store } as any,
    eventBroadcaster: { broadcastObservationQueued: () => {} } as any,
    ensureGeneratorRunning: async () => {},
  });
});
afterEach(() => { edits.mockRestore(); store.close(); });

const use = () => processor.processEntry({ session: 's', type: 'use', id: 'patch-call', name: 'apply_patch', input: patch }, watch, schema);
const result = (output: unknown) => processor.processEntry({ session: 's', type: 'result', id: 'patch-call', output }, watch, schema);
const evidence = () => extractObservationFileEvidence(queued.map(message => ({ ...message, type: 'observation' })));

it('does not invent a successful file edit for an uncompleted patch call', async () => {
  await use();
  expect(edits).not.toHaveBeenCalled();
  expect(queued).toEqual([]);
});

it('keeps one completed patch result and its actual modified-file evidence', async () => {
  await use();
  await result({ success: true });
  expect(edits).not.toHaveBeenCalled();
  expect(queued).toHaveLength(1);
  expect(queued[0]).toMatchObject({ tool_name: 'apply_patch', toolUseId: 'patch-call' });
  expect(evidence()).toEqual({ files_read: [], files_modified: ['src/a.ts'] });
  await result({ success: true });
  expect(queued).toHaveLength(1);
});

it('retains a failed result without claiming its attempted file was modified', async () => {
  await use();
  await result({ is_error: true, error: 'Patch was rejected' });
  expect(edits).not.toHaveBeenCalled();
  expect(queued).toHaveLength(1);
  expect(JSON.parse(queued[0].tool_response)).toEqual({ is_error: true, error: 'Patch was rejected' });
  expect(evidence()).toEqual({ files_read: [], files_modified: [] });
});

it('keeps file evidence when a schema carries the result on the tool-use record', async () => {
  await processor.processEntry({ session: 's', type: 'use', id: 'complete-patch', name: 'apply_patch', input: patch, output: { success: true } }, watch, schema);
  expect(edits).not.toHaveBeenCalled();
  expect(queued).toHaveLength(1);
  expect(evidence()).toEqual({ files_read: [], files_modified: ['src/a.ts'] });
});
