import { defineConfig } from 'vite';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pieces, billets, SITE } from './src/data.js';

const root = import.meta.dirname;
const pages = readdirSync(root).filter((f) => f.endsWith('.html'));

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function marquee(kind, attrs) {
  const items = kind === 'billets' ? billets : pieces;
  const group = (hidden) =>
    `<ul class="mq-group"${hidden ? ' aria-hidden="true"' : ''}>${items
      .map((i) => {
        const ext = i.img.startsWith('ref/') || i.img.startsWith('billets-') ? 'jpg' : 'jpg';
        const lazy = hidden ? ' loading="lazy"' : '';
        return `<li class="mq-item"><span class="mq-pic${i.fit === 'contain' ? ' is-note' : ''}"><img src="/img/${i.img}.${ext}" alt="${hidden ? '' : esc(i.name)}" width="260" height="170" decoding="async"${lazy} style="${i.pos ? `object-position:${i.pos}` : ''}"></span><span class="mq-name">${esc(i.name)}</span><span class="mq-est">${esc(i.est)}</span></li>`;
      })
      .join('')}</ul>`;
  const label = kind === 'billets' ? 'Billets rares d’exception' : 'Pièces d’exception';
  return `<div class="marquee ${attrs.includes('reverse') ? 'is-reverse' : ''}" role="region" aria-label="${label} — estimations indicatives"><div class="mq-track">${group(false)}${group(true)}</div></div>`;
}

function highlights() {
  const pick = [...pieces.slice(0, 3).map((i) => ({ ...i, href: '/pieces.html' })), ...billets.slice(0, 3).map((i) => ({ ...i, href: '/billets.html' }))];
  return `<ul class="hl-grid">${pick
    .map(
      (i, n) =>
        `<li class="mq-item reveal" style="--i:${n % 3}"><a href="${i.href}" class="hl-link"><span class="mq-pic${i.fit === 'contain' ? ' is-note' : ''}"><img src="/img/${i.img}.jpg" alt="${esc(i.name)}" width="260" height="170" loading="lazy" decoding="async" style="${i.pos ? `object-position:${i.pos}` : ''}"></span><span class="mq-name">${esc(i.name)}</span><span class="mq-est">${esc(i.est)}</span></a></li>`
    )
    .join('')}</ul>`;
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
          .replace(/<!--#include ([\w-]+)-->/g, (_, n) => read(n))
          .replace(/<!--#marquee (\w+)([^>]*)-->/g, (_, k, a) => marquee(k, a))
          .replace(/<!--#highlights-->/g, () => highlights())
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
