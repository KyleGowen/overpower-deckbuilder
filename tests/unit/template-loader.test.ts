/** @jest-environment jsdom */

import fs from 'fs';
import path from 'path';

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
};

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function loadTemplateLoader(): void {
  const filePath = path.join(__dirname, '../../public/js/template-loader.js');
  const code = fs.readFileSync(filePath, 'utf-8');
  new Function(code)();
}

describe('TemplateLoader', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="target"></div>';
    jest.spyOn(document, 'addEventListener').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (window as any).templateLoader;
    delete (global as any).fetch;
  });

  it('requests all templates before waiting for any template body', async () => {
    const responses = [
      deferred<{ text: () => Promise<string> }>(),
      deferred<{ text: () => Promise<string> }>(),
      deferred<{ text: () => Promise<string> }>(),
    ];
    (global as any).fetch = jest
      .fn()
      .mockReturnValueOnce(responses[0].promise)
      .mockReturnValueOnce(responses[1].promise)
      .mockReturnValueOnce(responses[2].promise);

    loadTemplateLoader();
    const loadPromise = (window as any).templateLoader.loadTemplates();

    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(global.fetch).toHaveBeenNthCalledWith(1, '/templates/deck-editor-template.html');
    expect(global.fetch).toHaveBeenNthCalledWith(2, '/templates/modal-templates.html');
    expect(global.fetch).toHaveBeenNthCalledWith(3, '/templates/database-view-complete.html');

    responses[0].resolve({ text: async () => '<div>deck</div>' });
    responses[1].resolve({ text: async () => '<div>modals</div>' });
    responses[2].resolve({ text: async () => '<div>dbv</div>' });
    await loadPromise;

    expect((window as any).templateLoader.templates.get('deck-editor')).toBe('<div>deck</div>');
    expect((window as any).templateLoader.templates.get('modals')).toBe('<div>modals</div>');
    expect((window as any).templateLoader.templates.get('database-view')).toBe('<div>dbv</div>');
    expect((window as any).templateLoader.loaded).toBe(true);
  });

  it('does not mark templates loaded when any request fails', async () => {
    (global as any).fetch = jest
      .fn()
      .mockResolvedValueOnce({ text: async () => '<div>deck</div>' })
      .mockRejectedValueOnce(new Error('modal failed'))
      .mockResolvedValueOnce({ text: async () => '<div>dbv</div>' });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    loadTemplateLoader();
    await (window as any).templateLoader.loadTemplates();

    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect((window as any).templateLoader.loaded).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('❌ Error loading templates:', expect.any(Error));
  });
});
