const express = require('express');
const path = require('path');

const corretora = require('./shared/data/corretora.json');

const app = express();
const PORT = process.env.PORT || 5000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Assets da marca (logos, foto da Daniela), comuns a todas as landings
app.use('/shared', express.static(path.join(__dirname, 'shared'), { maxAge: '7d' }));

// Cada landing page vive em sua própria pasta: views/ + public/ (com as mídias
// do imóvel em public/media/). slug = caminho público: <empreendimento>/<código
// da ficha>. O código identifica o imóvel sem expor andar/número.
const landings = [
  {
    slug: 'maisonlegacy/ap0223',
    dir: 'maisonlegacy-ap0223',
    dados: 'ap0223.json',
    nome: 'Maison Legacy · AP0223',
    tema: 'Identidade Daniela Ribeiro · marrom #84716B',
    descricao: 'Preloader, cursor customizado, galeria em loop infinito, navegação por ambientes com crossfade e barra de CTA fixa.',
    capa: '/shared/img/06.webp',
  },
  {
    slug: 'royalpark/ca0001',
    dir: 'royalpark-ca0001',
    dados: 'ca0001.json',
    nome: 'Royal Park · CA0001',
    tema: 'Identidade Daniela Ribeiro · marrom #84716B',
    descricao: 'Versão compacta: hero, tour em vídeo, galeria em loop, ficha técnica e CTA, sem a seção de ambientes e sem accordion.',
    capa: '/royalpark/ca0001/media/fachada.webp',
  },
];

// Dados do imóvel + bloco da corretora, que é o mesmo em todas as landings
const dadosDe = (lp) => ({ ...require(`./shared/data/${lp.dados}`), corretora });

// Helpers disponíveis em todas as views
const whatsapp = (texto, imovel) => {
  const msg = encodeURIComponent(
    texto ||
      `Olá, Daniela! Tenho interesse no imóvel ${imovel.codigo} (${imovel.edificio}, ${imovel.bairro}). Podemos conversar?`
  );
  return `https://wa.me/${corretora.whatsapp}?text=${msg}`;
};

const formatBRL = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

// Mídias do imóvel moram em <landing>/public/media/ e são servidas sob o slug;
// os assets da marca continuam em /shared/img/
const assetPath = (base) => (src) => (src.startsWith('/shared/') ? src : base + src);

landings.forEach((lp) => {
  const base = `/${lp.slug}`;
  const imovel = dadosDe(lp);
  app.use(base, express.static(path.join(__dirname, lp.dir, 'public'), { redirect: false }));
  app.get(base, (req, res) => {
    res.render(path.join(__dirname, lp.dir, 'views', 'index.ejs'), {
      imovel,
      base,
      lp,
      asset: assetPath(base),
      waLink: whatsapp(null, imovel),
      whatsapp,
      formatBRL,
    });
  });
});

// Raiz: página neutra (logo + contato), sem listar imóveis. As landings são
// divulgadas só pelo link direto
app.get('/', (req, res) => {
  res.render('index', { corretora, waLink: whatsapp('Olá, Daniela! Gostaria de mais informações.') });
});

// Só sobe o servidor quando executado diretamente (build.js importa este módulo)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n✔ Servidor rodando em http://localhost:${PORT}\n`);
    landings.forEach((lp) => console.log(`  • ${lp.nome} → http://localhost:${PORT}/${lp.slug}`));
    console.log('');
  });
}

module.exports = { app, landings, corretora, dadosDe, assetPath, whatsapp, formatBRL };
