import { afterAll, afterEach, beforeEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { appendFileSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { zstdCompressSync } from 'node:zlib';
import type { NormalizedHookInput } from '../../src/cli/types.js';
import type { TranscriptSchema, WatchTarget } from '../../src/services/transcripts/types.js';
import * as realSessionInit from '../../src/cli/handlers/session-init.js';

const snapshot = { ...realSessionInit };
const prompts: NormalizedHookInput[] = [];
const recordPrompt = async (input: NormalizedHookInput) => {
  prompts.push(input);
  return { continue: true, suppressOutput: true };
};
mock.module('../../src/cli/handlers/session-init.js', () => ({
  ...snapshot,
  recordSessionPrompt: recordPrompt,
}));
afterAll(() => mock.module('../../src/cli/handlers/session-init.js', () => snapshot));

import { TranscriptWatcher } from '../../src/services/transcripts/watcher.js';
import { logger } from '../../src/utils/logger.js';

const sessionId = 'session-725f4822-87e2-461f-a5d2-f2ee7296fb10';
const cwd = '/projects/项目';
const schema: TranscriptSchema = {
  name: 'dsh',
  sessionIdPath: 'id',
  events: [
    { name: 'header', match: { path: 'type', equals: 'session' }, action: 'session_context',
      fields: { sessionId: 'id', cwd: 'cwd' } },
    { name: 'prompt', match: { path: 'type', equals: 'user/message' }, action: 'session_init',
      fields: { prompt: 'text' } },
  ],
};
const frame = (text: string | Buffer) => zstdCompressSync(Buffer.from(text));
const prompt = (text: string) => frame(`${JSON.stringify({ type: 'user/message', text })}\n`);

function splitHeader(): Buffer[] {
  const header = Buffer.from(`${JSON.stringify({ type: 'session', id: sessionId, cwd,
    createdAt: Date.now() - 60 * 60 * 1000 })}\n`);
  // An independent compressed write can end even inside one UTF-8 character.
  const split = header.indexOf(Buffer.from('项')) + 1;
  return [frame(header.subarray(0, split)), frame(header.subarray(split))];
}

describe('a resumed compressed transcript with a header spanning frames', () => {
  let root: string;
  let file: string;
  let state: string;
  let watcher: TranscriptWatcher | undefined;
  let spies: ReturnType<typeof spyOn>[];

  beforeEach(() => {
    prompts.length = 0;
    root = mkdtempSync(join(tmpdir(), 'cmem-zstd-header-'));
    file = join(root, `${sessionId}.jsonl.zstd`);
    state = join(root, 'state.json');
    spies = (['info', 'debug', 'warn', 'error'] as const)
      .map(level => spyOn(logger, level).mockImplementation(() => {}));
  });

  afterEach(() => {
    watcher?.stop();
    watcher = undefined;
    spies.forEach(spy => spy.mockRestore());
    rmSync(root, { recursive: true, force: true });
  });

  for (const savedCheckpoint of [false, true]) {
    it(`restores identity and cwd without replaying history, saved checkpoint=${savedCheckpoint}`, async () => {
      writeFileSync(file, Buffer.concat([...splitHeader(), prompt('historical prompt')]));
      if (savedCheckpoint) {
        writeFileSync(state, JSON.stringify({ offsets: { [file]: statSync(file).size } }));
      }
      const watch: WatchTarget = { name: 'dsh', path: file, schema, startAtEnd: true };
      watcher = new TranscriptWatcher({ version: 1, watches: [watch] }, state);
      await (watcher as any).addTailer(file, watch, schema);
      const tailer = (watcher as any).tailers.get(file);
      await tailer.readTask;
      tailer.watcher?.close();
      tailer.watcher = null;
      expect(prompts).toEqual([]);

      appendFileSync(file, prompt('live follow-up'));
      tailer.poke();
      await tailer.readTask;

      expect(prompts).toHaveLength(1);
      expect(prompts[0]).toMatchObject({ sessionId, cwd, prompt: 'live follow-up' });
    });
  }

  it('recognizes an old copied session even when its timestamp is in a later frame', async () => {
    const watch: WatchTarget = { name: 'dsh', path: file, schema, startAtEnd: true };
    watcher = new TranscriptWatcher({ version: 1, watches: [] }, state);
    await watcher.start();
    // A newly written copy has a fresh mtime, but its own header is historical.
    writeFileSync(file, Buffer.concat([...splitHeader(), prompt('old copied prompt')]));
    await (watcher as any).addTailer(file, watch, schema, true);
    await (watcher as any).tailers.get(file).readTask;
    expect(prompts).toEqual([]);
    expect((watcher as any).state.offsets[file]).toBe(statSync(file).size);
  });

  it('does not borrow a header suffix beyond the resume position', async () => {
    const parts = splitHeader();
    writeFileSync(file, Buffer.concat(parts));
    const watch: WatchTarget = { name: 'dsh', path: file, schema };
    watcher = new TranscriptWatcher({ version: 1, watches: [watch] }, state);
    const context: Record<string, unknown> = {};
    await (watcher as any).primeFromFirstLine(file, parts[0].length, watch, schema, null, context);
    expect(context.cwd).toBeUndefined();
    expect(context.sessionId).toBeUndefined();
  });
});
