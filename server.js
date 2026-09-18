const express = require('express');
const path = require('path');

const imovel = require('./shared/data/imovel.json');

const app = express();
const PORT = process.env.PORT || 5000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Assets compartilhados (fotos, logo, dados)
app.use('/shared', express.static(path.join(__dirname, 'shared'), { maxAge: '7d' }));

// Cada landing page vive em sua própria pasta: views/ + public/
const landings = [
  {
    slug: 'lp2',
    dir: 'landing-02-noir',
    nome: 'Noir',
    tema: 'Escuro · Cinematográfico',
    descricao: 'Preloader, cursor customizado, galeria em loop infinito, navegação por ambientes com crossfade e barra de CTA fixa.',
    capa: '/shared/img/06.webp',
  },
];

// Helpers disponíveis em todas as views
const whatsapp = (texto) => {
  const msg = encodeURIComponent(
    texto || `Olá, Daniela! Tenho interesse no apartamento ${imovel.codigo} (${imovel.edificio}, ${imovel.bairro}). Podemos conversar?`
  );
  return `https://wa.me/${imovel.corretora.whatsapp}?text=${msg}`;
};

const formatBRL = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

landings.forEach((lp) => {
  const base = `/${lp.slug}`;
  app.use(base, express.static(path.join(__dirname, lp.dir, 'public'), { redirect: false }));
  app.get(base, (req, res) => {
    res.render(path.join(__dirname, lp.dir, 'views', 'index.ejs'), {
      imovel,
      base,
      lp,
      waLink: whatsapp(),
      whatsapp,
      formatBRL,
    });
  });
});

// Índice das landing pages
app.get('/', (req, res) => {
  res.render('index', { landings, imovel });
});

// Só sobe o servidor quando executado diretamente (build.js importa este módulo)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n✔ Servidor rodando em http://localhost:${PORT}\n`);
    landings.forEach((lp) => console.log(`  • ${lp.nome.padEnd(9)} → http://localhost:${PORT}/${lp.slug}`));
    console.log('');
  });
}

module.exports = { app, landings, whatsapp, formatBRL };
