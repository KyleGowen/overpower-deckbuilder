import request from 'supertest';
import { app } from '../../src/test-server';

describe('Deck Editor Character Stacks Integration', () => {
  test('index page includes Character Stacks category wiring', async () => {
    const res = await request(app).get('/').expect(200);
    const html = res.text;

    expect(html).toContain("type: 'character-stacks'");
    expect(html).toContain("name: 'Character Stacks'");
    expect(html).toContain('addAllCharacterStack(');
    expect(html).toContain('character-stack-name-search');
    expect(html).toContain('filterCharacterStacksByName');
  });

  test('character stacks category is prepended ahead of existing categories', async () => {
    const res = await request(app).get('/').expect(200);
    const html = res.text;

    expect(html).toContain("results = [");
    expect(html).toContain("type: 'character-stacks'");
    expect(html).toContain("name: 'Character Stacks'");
    expect(html).toContain('...results');
  });
});
