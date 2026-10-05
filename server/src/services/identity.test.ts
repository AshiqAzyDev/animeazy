import { describe, expect, it } from 'vitest';
import { parseCatalogIdentity } from '../streaming/types.js';

describe('catalog identity mapping', () => {
  it('parses shikimori / mal / kitsu prefixes', () => {
    expect(parseCatalogIdentity('shiki-42').shikimoriId).toBe('42');
    expect(parseCatalogIdentity('anime-21').malId).toBe('21');
    expect(parseCatalogIdentity('kitsu-9').kitsuId).toBe('9');
    expect(parseCatalogIdentity('123').malId).toBe('123');
  });
});
