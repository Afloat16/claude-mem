import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { parseAgentXml } from '../../src/sdk/parser.js';
import { ModeManager } from '../../src/services/domain/ModeManager.js';

describe('skip markers quoted in saved observer content', () => {
  const manager = ModeManager.getInstance();
  const state = manager as unknown as { activeMode: unknown; activeModeId: unknown };
  let previousMode: unknown;
  let previousModeId: unknown;
  beforeAll(() => {
    previousMode = state.activeMode;
    previousModeId = state.activeModeId;
    manager.loadMode('code');
  });
  afterAll(() => {
    state.activeMode = previousMode;
    state.activeModeId = previousModeId;
  });

  it('keeps an observation describing a skip marker', () => {
    const narrative = 'The old prompt returned <skip_summary reason="noise" /> and omitted the useful change.';
    const result = parseAgentXml(`<observation><type>bugfix</type><title>Keep useful results</title><narrative>${narrative}</narrative></observation>`);
    expect(result.valid).toBe(true);
    if (!result.valid) return;
    expect(result.observations).toHaveLength(1);
    expect(result.observations[0].narrative).toBe(narrative);
    expect(result.summary).toBeNull();
  });

  it('keeps summary fields that explain the sentinel syntax', () => {
    const result = parseAgentXml('<summary><completed>Fixed empty observations</completed><notes>Use <skip_summary /> for noise.</notes></summary>');
    expect(result.valid && result.summary?.completed).toBe('Fixed empty observations');
    expect(result.valid && result.summary?.notes).toBe('Use <skip_summary /> for noise.');
    expect(result.valid && result.summary?.skipped).not.toBe(true);
  });

  it('does not let a separate skip marker discard a complete observation', () => {
    const result = parseAgentXml('<skip_summary reason="first event was noise" />\n<observation><type>discovery</type><title>The next event matters</title></observation>');
    expect(result.valid && result.observations.map(observation => observation.title)).toEqual(['The next event matters']);
  });

  it('keeps standalone skips, including a root tag quoted in the reason', () => {
    for (const raw of [
      '<skip_summary />',
      '<skip_summary reason="no <observation> worth storing" />',
      "```xml\n<skip_summary reason = 'noise' />\n```",
      '<skip_summary reason="noise" />\n<observation><type>change</type><title>Unfinished',
    ]) {
      const result = parseAgentXml(raw);
      expect(result.valid && result.summary?.skipped).toBe(true);
      expect(result.valid && result.observations).toEqual([]);
    }
  });
});
