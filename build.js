/**
 * Build estático para GitHub Pages.
 * Renderiza os EJS em HTML puro dentro de dist/ e copia os assets.
 *
 *   BASE_PATH=/lpDanielaImoveis node build.js   → paths com prefixo (GitHub Pages em subpasta)
 *   node build.js                               → paths na raiz (domínio próprio / local)
 */
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const BASE = (process.env.BASE_PATH || '').replace(/\/$/, '');

const imovel = require('./shared/data/imovel.json');
const { landings, whatsapp, formatBRL } = require('./server');

const rimraf = (p) => fs.rmSync(p, { recursive: true, force: true });
const copy = (src, dst) => fs.cpSync(src, dst, { recursive: true });
const write = (file, html) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
};

// Reescreve caminhos absolutos ("/shared/…", "/<slug>/…") para incluir o BASE_PATH
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const slugs = landings.map((lp) => esc(lp.slug)).join('|');
const rebase = (html) => {
  if (!BASE) return html;
  return html
    .replace(/(["'(])\/shared\//g, `$1${BASE}/shared/`)
    .replace(new RegExp(`(["'])/(${slugs})/`, 'g'), `$1${BASE}/$2/`)
    .replace(new RegExp(`href="/(${slugs})"`, 'g'), `href="${BASE}/$1/"`);
};

rimraf(DIST);
fs.mkdirSync(DIST, { recursive: true });

// Assets compartilhados (fotos, logos)
copy(path.join(ROOT, 'shared', 'img'), path.join(DIST, 'shared', 'img'));

// Cada landing: HTML + public/
const renderLanding = (lp) => {
  const base = `/${lp.slug}`;
  const tpl = fs.readFileSync(path.join(ROOT, lp.dir, 'views', 'index.ejs'), 'utf8');
  return rebase(ejs.render(tpl, { imovel, base, lp, waLink: whatsapp(), whatsapp, formatBRL }, {
    filename: path.join(ROOT, lp.dir, 'views', 'index.ejs'),
  }));
};
landings.forEach((lp) => {
  write(path.join(DIST, lp.slug, 'index.html'), renderLanding(lp));
  copy(path.join(ROOT, lp.dir, 'public'), path.join(DIST, lp.slug));
});

// Raiz: página neutra (logo + contato), sem listar imóveis
const indexHtml = ejs.render(fs.readFileSync(path.join(ROOT, 'views', 'index.ejs'), 'utf8'), {
  imovel, waLink: whatsapp('Olá, Daniela! Gostaria de mais informações.'),
});
write(path.join(DIST, 'index.html'), rebase(indexHtml));

// Evita o Jekyll do GitHub Pages ignorar arquivos
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');

console.log(`✔ Build concluído em dist/ (BASE_PATH="${BASE || '/'}")`);
landings.forEach((lp) => console.log(`  • ${BASE}/${lp.slug}/`));
