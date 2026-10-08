import { defineConfig } from 'vite';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pieces, billets, SITE } from './src/data.js';

const root = import.meta.dirname;
const pages = readdirSync(root).filter((f) => f.endsWith('.html'));

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const coinGlyph = `<svg class="mq-glyph" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="12" cy="12" r="6.5" fill="none" stroke="currentColor" stroke-width=".7" stroke-dasharray="1.2 1.6"/><path d="M12 8.2v7.6M9.6 10.4c.7-.8 1.6-1.2 2.4-1.2s1.8.4 2.4 1.2" fill="none" stroke="currentColor" stroke-width=".9" stroke-linecap="round"/></svg>`;
const noteGlyph = `<svg class="mq-glyph" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="1.5" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width=".8"/><path d="M5 9.5h2M17 14.5h2" stroke="currentColor" stroke-width=".9" stroke-linecap="round"/></svg>`;

function marquee(kind, attrs) {
  const items = kind === 'billets' ? billets : pieces;
  const glyph = kind === 'billets' ? noteGlyph : coinGlyph;
  const group = (hidden) =>
    `<ul class="mq-group"${hidden ? ' aria-hidden="true"' : ''}>${items
      .map((i) => `<li class="mq-item">${glyph}<span class="mq-name">${esc(i.name)}</span><span class="mq-est">${esc(i.est)}</span></li>`)
      .join('')}</ul>`;
  const label = kind === 'billets' ? 'Billets rares d’exception' : 'Pièces d’exception';
  return `<div class="marquee ${attrs.includes('reverse') ? 'is-reverse' : ''}" role="region" aria-label="${label} — estimations indicatives"><div class="mq-track">${group(false)}${group(true)}</div></div>`;
}

function includes() {
  return {
    name: 'html-includes',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const file = ctx.filename.split('/').pop();
        const active = file.replace('.html', '');
        const read = (n) => readFileSync(resolve(root, 'src/partials', n + '.html'), 'utf8');
        return html
          .replace(/<!--#include (\w+)-->/g, (_, n) => read(n))
          .replace(/<!--#marquee (\w+)([^>]*)-->/g, (_, k, a) => marquee(k, a))
          .replace(/\{\{SITE\}\}/g, SITE)
          .replace(/\{\{PAGE\}\}/g, active)
          .replace(new RegExp(`data-nav="${active}"`, 'g'), `data-nav="${active}" aria-current="page"`);
      }
    }
  };
}

export default defineConfig({
  plugins: [includes()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((p) => [p.replace('.html', ''), resolve(root, p)]))
    }
  }
});
