import { describe, expect } from 'bun:test';
import { nativeTest as test } from './native-prerequisite.js';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { parseFile, unfoldSymbol, formatFoldedView, type CodeSymbol } from '../../../src/services/smart-file-read/parser.js';
import { searchCodebase } from '../../../src/services/smart-file-read/search.js';

const fixture = (file: string) => readFileSync(join(import.meta.dir, 'fixtures', file), 'utf8');
const names = (symbols: CodeSymbol[]) => symbols.map(symbol => symbol.name);

describe('transparent callable value wrappers', () => {
  for (const extension of ['js', 'ts', 'tsx']) {
    test(`finds grouped variables and deeply grouped class fields in .${extension}`, () => {
      const source = fixture('wrapped-callables.mjs');
      const parsed = parseFile(source, `owned.${extension}`);
      expect(names(parsed.symbols)).toEqual([
        'parenthesizedArrow', 'parenthesizedFunction', 'parenthesizedGenerator',
        'parenthesizedAsync', 'directControl', 'WrappedStore',
      ]);
      expect(parsed.symbols.slice(0, 5).map(symbol => [symbol.kind, symbol.exported])).toEqual(
        Array.from({ length: 5 }, () => ['function', true]),
      );
      const methods = parsed.symbols.find(symbol => symbol.name === 'WrappedStore')?.children ?? [];
      expect(names(methods)).toEqual(['deep', '#hidden', '"quoted"', '[Symbol.iterator]', 'ordinary']);
      expect(methods.map(symbol => symbol.kind)).toEqual(Array(5).fill('method'));
      expect(unfoldSymbol(source, `owned.${extension}`, 'parenthesizedFunction')).toContain('return value + 2;');
      expect(unfoldSymbol(source, `owned.${extension}`, 'WrappedStore.deep')).toContain('return value + 6;');
      expect(unfoldSymbol(source, `owned.${extension}`, 'WrappedStore.#hidden')).toContain('#hidden = (((() => 7)))');
    }, 120000);
  }

  for (const extension of ['ts', 'tsx']) {
    test(`finds type-erased variable and field wrappers in .${extension}`, () => {
      const source = fixture('wrapped-callables.ts');
      const parsed = parseFile(source, `typed.${extension}`);
      expect(names(parsed.symbols)).toEqual(['Handler', 'asserted', 'satisfied', 'nonnull', 'combined', 'specialized', 'TypedStore']);
      expect(parsed.symbols.slice(1, 6).map(symbol => [symbol.kind, symbol.exported])).toEqual(
        Array.from({ length: 5 }, () => ['function', true]),
      );
      const methods = parsed.symbols.find(symbol => symbol.name === 'TypedStore')?.children ?? [];
      expect(names(methods)).toEqual(['asserted', 'satisfied', 'nonnull', 'combined', 'specialized']);
      expect(unfoldSymbol(source, `typed.${extension}`, 'combined')).toContain('value + 4');
      expect(unfoldSymbol(source, `typed.${extension}`, 'TypedStore.specialized')).toContain('function identity<T>');
    }, 120000);
  }

  test('finds TypeScript angle-bracket assertions in .ts files', () => {
    const source = fixture('wrapped-callables-angle.ts');
    const parsed = parseFile(source, 'angle.ts');
    expect(names(parsed.symbols)).toEqual(['Handler', 'angleAsserted', 'AngleStore']);
    expect(names(parsed.symbols[2].children ?? [])).toEqual(['angleAsserted']);
    expect(unfoldSymbol(source, 'angle.ts', 'angleAsserted')).toContain('<Handler>');
    expect(unfoldSymbol(source, 'angle.ts', 'AngleStore.angleAsserted')).toContain('value + 2');
  }, 120000);

  for (const extension of ['js', 'ts', 'tsx']) {
    test(`does not infer .${extension} callables from callbacks or nontransparent expressions`, () => {
      const source = [
        'const direct = () => 1;',
        'const called = (factory(() => 2));',
        'const choice = (flag ? (() => 3) : (() => 4));',
        'const sequence = ((0, () => 5));',
        'const object = ({ callback: () => 6 });',
        'const scalar = (((7)));',
        'const reference = ((direct));',
        'class Controls {',
        '  grouped = (() => 8);',
        '  called = ((factory(() => 9)));',
        '  choice = ((flag ? (() => 10) : (() => 11)));',
        '  sequence = ((0, () => 12));',
        '  object = ({ callback: () => 13 });',
        '  scalar = (((14)));',
        '  reference = ((direct));',
        '}',
      ].join('\n');
      const parsed = parseFile(source, `controls.${extension}`);
      expect(names(parsed.symbols)).toEqual(['direct', 'Controls']);
      expect(names(parsed.symbols[1].children ?? [])).toEqual(['grouped']);
    }, 120000);
  }

  for (const extension of ['ts', 'tsx']) {
    test(`does not infer .${extension} functions from types or wrapped callbacks`, () => {
      const source = [
        'type Handler = () => number;',
        'const direct = () => 1;',
        'const called = (factory(() => 2) as Handler);',
        'const choice = ((flag ? (() => 3) : (() => 4)) satisfies Handler);',
        'const sequence = ((0, () => 5) as Handler);',
        'const object = ({ callback: () => 6 } satisfies { callback: Handler });',
        'const scalar = ((7 as unknown) as Handler);',
        'const reference = (direct as Handler);',
        'class Controls {',
        '  called = (factory(() => 8) as Handler);',
        '  choice = ((flag ? (() => 9) : (() => 10)) satisfies Handler);',
        '  sequence = ((0, () => 11) as Handler);',
        '  object = ({ callback: () => 12 } satisfies { callback: Handler });',
        '  scalar = ((13 as unknown) as Handler);',
        '  reference = (direct as Handler);',
        '}',
      ].join('\n');
      const parsed = parseFile(source, `controls.${extension}`);
      expect(names(parsed.symbols)).toEqual(['Handler', 'direct', 'Controls']);
      expect(names(parsed.symbols[2].children ?? [])).toEqual([]);
    }, 120000);
  }

  test('follows arbitrary grouping depth and exact native columns', () => {
    const nested = '('.repeat(64) + '() => 17' + ')'.repeat(64);
    const source = `const marker = "🧭"; const deep = ${nested};\nclass Nested { field = ${nested}; }`;
    const parsed = parseFile(source, 'deep.js');
    expect(names(parsed.symbols)).toEqual(['deep', 'Nested']);
    expect(names(parsed.symbols[1].children ?? [])).toEqual(['field']);
    expect(unfoldSymbol(source, 'deep.js', 'deep')).toContain('() => 17');
  }, 120000);

  test('searches grouped functions and unfolds the complete selected field', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'wrapped-callable-search-'));
    const source = fixture('wrapped-callables.mjs');
    try {
      writeFileSync(join(directory, 'owned.mjs'), source);
      const result = await searchCodebase(directory, 'WrappedStore.deep');
      const selected = result.matchingSymbols.find(symbol => symbol.symbolName === 'WrappedStore.deep');
      expect(selected).toBeDefined();
      expect(formatFoldedView(parseFile(source, 'owned.mjs'))).toContain('parenthesizedArrow');
      expect(unfoldSymbol(source, 'owned.mjs', selected!.symbolName)).toContain('return value + 6;');
    } finally { rmSync(directory, { recursive: true, force: true }); }
  }, 120000);
});
