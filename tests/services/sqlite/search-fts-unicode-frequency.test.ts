import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { Database } from 'bun:sqlite';
import { SessionStore } from '../../../src/services/sqlite/SessionStore.js';
import { SessionSearch } from '../../../src/services/sqlite/SessionSearch.js';
import { SearchManager } from '../../../src/services/worker/SearchManager.js';
import { FormattingService } from '../../../src/services/worker/FormattingService.js';
import { TimelineService } from '../../../src/services/worker/TimelineService.js';

const terms = [
  { label: 'ASCII', word: 'zebrafish' },
  { label: 'Latin accent', word: 'café' },
  { label: 'Greek accent', word: 'άλφα' },
  { label: 'Greek final sigma', word: 'κοσμος' },
  { label: 'Cyrillic breve', word: 'мой' },
  { label: 'Vietnamese compound accent', word: 'một' },
] as const;

describe('native unicode61 tokenizer controls', () => {
  for (const mode of [0, 1, 2]) {
    it(`records actual terms with remove_diacritics=${mode}`, () => {
      const db = new Database(':memory:');
      try {
        db.run(`CREATE VIRTUAL TABLE tokens USING fts5(text, tokenize='unicode61 remove_diacritics ${mode}')`);
        db.run("CREATE VIRTUAL TABLE vocabulary USING fts5vocab(tokens, 'row')");
        for (const { label, word } of terms) {
          db.run('DELETE FROM tokens');
          db.run('INSERT INTO tokens(text) VALUES (?)', [word]);
          const indexed = db.query('SELECT term, doc FROM vocabulary ORDER BY term').all();
          const matched = db.query('SELECT text FROM tokens WHERE tokens MATCH ?').all(`"${word}"`);
          console.log('UNICODE61_ORACLE', JSON.stringify({ mode, label, word, indexed }));
          expect(matched).toEqual([{ text: word }]);
          expect(indexed).toHaveLength(1);
        }
      } finally { db.close(); }
    });
  }
});

describe('long memory questions use the indexed Unicode vocabulary', () => {
  let store: SessionStore;
  let search: SessionSearch;
  let manager: SearchManager;
  let sequence = 0;

  function seed(title: string, project: string): void {
    const key = `unicode-frequency-${sequence++}`;
    const session = store.createSDKSession(key, project, 'fixture request');
    const memory = store.ensureMemorySessionIdRegistered(session, key + '-memory');
    store.storeObservation(memory, project, {
      type: 'discovery', title, subtitle: null, facts: [], narrative: null,
      concepts: [], files_read: [], files_modified: [],
    }, 1);
    store.importSessionSummary({
      memory_session_id: memory, project, request: title,
      investigated: null, learned: null, completed: null, next_steps: null,
      files_read: null, files_edited: null, notes: null, prompt_number: 1, discovery_tokens: 0,
      created_at: '2026-01-01T00:00:00.000Z', created_at_epoch: Date.UTC(2026, 0, 1),
    });
  }

  beforeAll(() => {
    store = new SessionStore(':memory:');
    for (let index = 0; index < 100; index++) seed(`Unrelated neutral background ${index}`, 'vocabulary-project');
    for (const { word } of terms) {
      seed(`Saved token ${word}`, 'vocabulary-project');
      seed(`Outside token ${word}`, 'outside-project');
    }
    search = new SessionSearch(store.db);
    manager = new SearchManager(search, store, null, new FormattingService(), new TimelineService());
  });
  afterAll(() => store.close());

  for (const category of ['observations', 'sessions'] as const) {
    for (const { label, word } of terms) {
      it(`recalls the rare ${label} ${category} term through the public long-query search`, async () => {
        const expected = [`Saved token ${word}`];
        const query = `missing ${word} absent ${'unmatched '.repeat(80)}`;
        expect([...query].length).toBeGreaterThanOrEqual(600);
        const ask = async (text: string): Promise<string[]> => {
          const response = await manager.search({
            query: text, project: 'vocabulary-project', type: category, format: 'json', limit: 50,
          });
          return category === 'observations'
            ? response.observations.map((row: { title: string }) => row.title)
            : response.sessions.map((row: { request: string }) => row.request);
        };
        const keyword = await ask(word);
        const short = await ask(`missing ${word} absent`);
        const long = await ask(query);
        console.log('UNICODE61_RECALL', JSON.stringify({ category, label, word, keyword, short, long }));
        expect(keyword).toEqual(expected);
        expect(short).toEqual(expected);
        expect(long).toEqual(expected);
      });
    }
  }
});
