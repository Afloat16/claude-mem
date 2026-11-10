import { createHash } from 'node:crypto';
const root = process.argv[2] ?? new URL('../claude-mem', import.meta.url).pathname;
const { SessionStore } = await import(root + '/src/services/sqlite/SessionStore.ts');
const { configureToolUseIndex, searchToolUses } = await import(root + '/src/services/sqlite/tool-use-search.ts');

const store = new SessionStore(':memory:');
const terms = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const response = terms.map(term => 'x'.repeat(6000) + '🧪'.repeat(30) + term).join('');
for (let id = 0; id < 10; id++) store.upsertToolUse({
  toolUseId: 'memory-benchmark-' + id, contentSessionId: 'benchmark', project: 'benchmark', toolName: 'Bash',
  toolInput: null, toolResponse: response, createdAtEpoch: id,
});
configureToolUseIndex(store.db, true);
const query = terms.join(' ');
const digest = (result: unknown) => createHash('sha256').update(JSON.stringify(result)).digest('hex');
const result = searchToolUses(store.db, query, { limit: 10 });
const measurements: number[] = [];
for (let iteration = 0; iteration < 25; iteration++) {
  const start = performance.now();
  const next = searchToolUses(store.db, query, { limit: 10 });
  measurements.push(performance.now() - start);
  if (digest(next) !== digest(result)) throw new Error('Search output changed');
}
measurements.sort((a,b) => a-b);
console.log(JSON.stringify({ runtime: Bun.version, rows: result.toolUses.length, bodyBytes: Buffer.byteLength(response),
  queries: measurements.length, medianMs: measurements[12], p95Ms: measurements[23], maxRssKiB: process.resourceUsage().maxRSS,
  outputSha256: digest(result) }));
store.close();
