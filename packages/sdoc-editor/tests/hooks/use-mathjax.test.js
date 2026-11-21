import React, { act } from 'react';
import fs from 'fs';
import path from 'path';
import { createRoot } from 'react-dom/client';
import useMathJax from '../../src/hooks/use-mathjax';
import SDocViewer from '../../src/views/sdoc-viewer';

jest.mock('../../src/android/outline-module', () => ({}));
jest.mock('../../src/context', () => ({ api: {}, getSetting: () => false }));
jest.mock('../../src/extension', () => ({ createDefaultEditor: () => ({}) }));
jest.mock('../../src/hooks/use-collaborators', () => ({ CollaboratorsProvider: ({ children }) => children }));
jest.mock('../../src/hooks/use-color-context', () => ({ ColorProvider: ({ children }) => children }));
jest.mock('../../src/hooks/use-plugins', () => ({ PluginsProvider: ({ children }) => children }));
jest.mock('../../src/layout', () => ({
  EditorContainer: ({ children }) => children,
  EditorContent: ({ children }) => children,
}));
jest.mock('../../src/node-id', () => editor => editor);
jest.mock('../../src/utils/document-utils', () => ({}));
jest.mock('../../src/views/readonly-article', () => ({ slateValue }) => (
  <div className='formula' dangerouslySetInnerHTML={{ __html: global.window.MathJax.tex2svg(slateValue[0].data.formula).outerHTML }} />
));

const mathJaxSource = fs.readFileSync(path.resolve(__dirname, '../../../example/public/media/js/mathjax/tex-svg.js'), 'utf8');
const formulaDocument = { elements: [{ type: 'formula', data: { formula: 'x^2' } }] };

function Preview({ source = '/mathjax.js', formula = 'add' }) {
  const { isLoadingMathJax } = useMathJax(source);
  if (isLoadingMathJax) return <span>Loading</span>;
  if (!source) return <span>Disabled</span>;
  return <div className='formula' dangerouslySetInnerHTML={{ __html: window.MathJax.tex2svg(formula).outerHTML }} />;
}

describe('MathJax lifecycle', () => {
  let container;
  let root;
  let previousActEnvironment;

  beforeEach(() => {
    previousActEnvironment = global.IS_REACT_ACT_ENVIRONMENT;
    global.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    document.getElementById('MJX-SVG-styles')?.remove();
    document.getElementById('MJX-SVG-global-cache')?.remove();
    document.getElementById('mathjax')?.remove();
    delete window.MathJax;
    global.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
  });

  const loadScript = async () => {
    const script = document.getElementById('mathjax');
    await act(async () => {
      // eslint-disable-next-line no-eval -- Execute the bundled browser script as a real script load.
      window.eval(mathJaxSource);
      await window.MathJax.startup.promise;
      script.dispatchEvent(new Event('load'));
    });
  };

  const expectGlyphs = () => {
    const uses = [...container.querySelectorAll('.formula use')];
    expect(uses.length).toBeGreaterThan(0);
    for (const use of uses) {
      expect(document.getElementById(use.getAttribute('xlink:href').slice(1))).not.toBeNull();
    }
  };

  test('removes the script and glyph cache before the next editor loads', async () => {
    await act(async () => root.render(<Preview />));
    await loadScript();
    expectGlyphs();

    await act(async () => root.render(null));
    expect(document.getElementById('mathjax')).toBeNull();
    expect(document.getElementById('MJX-SVG-global-cache')).toBeNull();

    await act(async () => root.render(<Preview formula='x^2' />));
    await loadScript();
    expectGlyphs();
  });

  test('cleans up a cache created before any formula was rendered', async () => {
    await act(async () => root.render(<Preview formula='' />));
    await loadScript();
    await act(async () => root.render(null));
    await act(async () => root.render(<Preview />));
    await loadScript();
    expectGlyphs();
  });

  test('preserves MathJax and glyphs while another viewer still uses them', async () => {
    await act(async () => root.render(<><Preview key='first' /></>));
    await loadScript();
    const mathJax = window.MathJax;
    const script = document.getElementById('mathjax');
    const cache = document.getElementById('MJX-SVG-global-cache');

    await act(async () => root.render(<><Preview key='first' /><Preview key='second' formula='x^2' /></>));
    expect(window.MathJax).toBe(mathJax);
    expect(document.querySelectorAll('#mathjax')).toHaveLength(1);
    expectGlyphs();

    await act(async () => root.render(<><Preview key='second' formula='x^2' /></>));
    expect(document.getElementById('mathjax')).toBe(script);
    expect(document.getElementById('MJX-SVG-global-cache')).toBe(cache);
    expectGlyphs();

    await act(async () => root.render(null));
    expect(document.getElementById('mathjax')).toBeNull();
    expect(document.getElementById('MJX-SVG-global-cache')).toBeNull();
  });

  test('waits for the shared script when multiple editors mount during loading', async () => {
    await act(async () => root.render(<><Preview key='first' /><Preview key='second' formula='x^2' /></>));
    expect(document.querySelectorAll('#mathjax')).toHaveLength(1);
    expect(container.textContent).toBe('LoadingLoading');
    await loadScript();
    expect(container.querySelectorAll('.formula')).toHaveLength(2);
    expectGlyphs();
  });

  test('keeps the pending script when one of its users unmounts', async () => {
    await act(async () => root.render(<><Preview key='first' /><Preview key='second' /></>));
    const script = document.getElementById('mathjax');
    await act(async () => root.render(<><Preview key='second' /></>));
    expect(document.getElementById('mathjax')).toBe(script);
    await loadScript();
    expectGlyphs();
  });

  test('loads MathJax for a viewer without an enable flag', async () => {
    await act(async () => root.render(<SDocViewer document={formulaDocument} />));
    expect(document.getElementById('mathjax').getAttribute('src')).toBe('/media/js/mathjax/tex-svg.js');
    expect(container.querySelector('.formula')).toBeNull();
    await loadScript();
    expectGlyphs();
  });

  test.each([false, true])('preserves viewer glyphs after the original loader unmounts (already loaded: %s)', async (alreadyLoaded) => {
    await act(async () => root.render(<><Preview key='editor' /></>));
    if (alreadyLoaded) await loadScript();
    const script = document.getElementById('mathjax');

    await act(async () => root.render(
      <>
        <Preview key='editor' />
        <SDocViewer key='viewer' document={formulaDocument} mathJaxSource='/mathjax.js' />
      </>
    ));
    expect(document.querySelectorAll('#mathjax')).toHaveLength(1);
    if (!alreadyLoaded) {
      expect(container.querySelector('.formula')).toBeNull();
      await loadScript();
    }
    expect(container.querySelectorAll('.formula')).toHaveLength(2);
    expectGlyphs();
    const cache = document.getElementById('MJX-SVG-global-cache');

    await act(async () => root.render(
      <>
        <SDocViewer key='viewer' document={formulaDocument} mathJaxSource='/mathjax.js' />
      </>
    ));
    expect(document.getElementById('mathjax')).toBe(script);
    expect(document.getElementById('MJX-SVG-global-cache')).toBe(cache);
    expectGlyphs();

    await act(async () => root.render(null));
    expect(document.getElementById('mathjax')).toBeNull();
    expect(document.getElementById('MJX-SVG-global-cache')).toBeNull();
  });

  test('does not manage MathJax when no script source is supplied', async () => {
    const cache = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    cache.id = 'MJX-SVG-global-cache';
    document.body.appendChild(cache);
    const mathJax = { tex2svg: () => {} };
    window.MathJax = mathJax;
    await act(async () => root.render(<Preview source={null} />));
    expect(container.textContent).toBe('Disabled');
    await act(async () => root.render(null));
    expect(window.MathJax).toBe(mathJax);
    expect(document.getElementById('MJX-SVG-global-cache')).toBe(cache);
  });

  test('reloads correctly after StrictMode runs effect cleanup during mounting', async () => {
    await act(async () => root.render(<React.StrictMode><Preview /></React.StrictMode>));
    expect(document.querySelectorAll('#mathjax')).toHaveLength(1);
    await loadScript();
    expectGlyphs();
    await act(async () => root.render(null));
    expect(document.getElementById('mathjax')).toBeNull();
    expect(document.getElementById('MJX-SVG-global-cache')).toBeNull();
  });
});
