import { afterEach, beforeEach, expect, it } from 'bun:test';
import { Database } from 'bun:sqlite';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { SessionStore } from '../../src/services/sqlite/SessionStore.js';
import { MediaStore } from '../../src/services/media/store.js';

let dir: string;
let db: Database;
let media: MediaStore;
let temporary: string;

beforeEach(() => {
  const scratch = join(import.meta.dir, '../../.scratch');
  mkdirSync(scratch, { recursive: true });
  dir = realpathSync(mkdtempSync(join(scratch, 'media-cleanup-stages-')));
  db = new Database(':memory:');
  new SessionStore(db);
  media = new MediaStore(db, dir);
  temporary = join(media.root, '.tmp');
  mkdirSync(temporary, { recursive: true });
});
afterEach(() => { db.close(); rmSync(dir, { recursive: true, force: true }); });

function stage(id: string): string {
  const name = id + '-' + randomUUID();
  mkdirSync(join(temporary, name));
  writeFileSync(join(temporary, name, 'viewer.webp'), 'retained image bytes');
  return name;
}

function queue(id: string): void {
  db.prepare(`INSERT INTO media_attachments(id,replay_key,provenance,recipe,state,created_at)
    VALUES(?,?,?,'screenshot-v1','deleted',0)`).run(id, id, '{}');
  db.prepare('INSERT INTO media_cleanup_jobs(attachment_id,directory,queued_at) VALUES(?,?,0)').run(id, id);
}

it('finds the deleted attachment after more than 128 unrelated staging entries', () => {
  for (let i = 0; i < 130; i++) stage(randomUUID());
  // Use the filesystem's actual order rather than assume directory sorting.
  const names = readdirSync(temporary);
  const target = names[129];
  const id = target.slice(0, 36);
  queue(id);

  media.reconcile();

  expect(existsSync(join(temporary, target))).toBe(false);
  expect(readdirSync(temporary).sort()).toEqual(names.filter(name => name !== target).sort());
  expect(db.prepare('SELECT 1 FROM media_cleanup_jobs WHERE attachment_id=?').get(id)).toBeNull();
});

it('keeps the cleanup job until every stage is removed across bounded passes', () => {
  const id = randomUUID();
  for (let i = 0; i < 130; i++) stage(id);
  const unrelated = stage(randomUUID());
  queue(id);

  media.reconcile();
  expect(readdirSync(temporary).filter(name => name.startsWith(id + '-'))).toHaveLength(2);
  expect(db.prepare('SELECT 1 FROM media_cleanup_jobs WHERE attachment_id=?').get(id)).not.toBeNull();

  media.reconcile();
  expect(readdirSync(temporary)).toEqual([unrelated]);
  expect(db.prepare('SELECT 1 FROM media_cleanup_jobs WHERE attachment_id=?').get(id)).toBeNull();
});
