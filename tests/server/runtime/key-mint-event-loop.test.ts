import { describe, expect, it } from 'bun:test';
import type { Application, Request, RequestHandler, Response } from 'express';
import { ServerV1PostgresRoutes } from '../../../src/server/routes/v1/ServerV1PostgresRoutes.js';
import { DisabledServerQueueManager } from '../../../src/server/runtime/types.js';
import { verifyRawKeyAgainstStoredHashAsync } from '../../../src/server/auth/api-key-hash.js';

// Exercise the actual registered handler and crypto. Database writes are
// captured at the query boundary; no external service or key is needed.
describe('server API key issuance', () => {
  it('lets other I/O run while deriving a newly issued key', async () => {
    let handler: RequestHandler | undefined;
    let savedHash = '';
    const pool = {
      async query(sql: string, values: unknown[]) {
        if (!sql.includes('INSERT INTO api_keys')) throw new Error(`Unexpected query: ${sql}`);
        savedHash = String(values[1]);
        return { rows: [{
          id: values[0], key_hash: values[1], key_prefix: values[2], team_id: values[3],
          project_id: values[4], actor_id: values[5], scopes: JSON.parse(String(values[6])),
          expires_at: values[7], revoked_at: null, created_at: new Date(), updated_at: new Date(),
        }] };
      },
    };
    const app = {
      use() {}, get() {}, delete() {},
      post(path: string, ...handlers: RequestHandler[]) {
        if (path === '/v1/keys') handler = handlers.at(-1);
      },
    };
    new ServerV1PostgresRoutes({ pool: pool as never,
      queueManager: new DisabledServerQueueManager('test') }).setupRoutes(app as unknown as Application);
    expect(handler).toBeDefined();
    const req = { body: { expiresInDays: 1 }, protocol: 'http', get: () => 'localhost',
      authContext: { teamId: 'team', projectId: null, apiKeyId: 'writer' } } as unknown as Request;

    let timerRan = false;
    const timer = setTimeout(() => { timerRan = true; }, 0);
    let issued: { apiKey: string; scopes: string[]; expiresAt: string };
    try {
      issued = await new Promise((resolve, reject) => {
        const res = { status(code: number) { expect(code).toBe(201); return this; }, json: resolve };
        handler!(req, res as unknown as Response, reject);
      });
      expect(timerRan).toBe(true);
    } finally {
      clearTimeout(timer);
    }
    expect(savedHash).toMatch(/^scrypt\$/);
    expect(await verifyRawKeyAgainstStoredHashAsync(issued.apiKey, savedHash)).toBe(true);
    expect(issued.scopes).toEqual(['memories:read']);
    expect(Date.parse(issued.expiresAt)).toBeGreaterThan(Date.now());
  });
});
