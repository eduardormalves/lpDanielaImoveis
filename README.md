# Landing Pages — Daniela Ribeiro Imóveis

Landing page para o apartamento **AP0223 — Maison Legacy Residence** (Gleba Fazenda Palhano, Londrina/PR), construída com **Node.js + Express + EJS**.

## Como rodar

```bash
npm install
npm start
```

Abra <http://localhost:3000> — a página inicial lista a landing page:

| Rota   | Pasta                  | Estilo                       | Interações principais |
|--------|------------------------|------------------------------|-----------------------|
| `/lp2` | `landing-02-noir/`     | Escuro · cinematográfico     | Preloader, cursor customizado, título com máscara, galeria em loop infinito, navegação por ambientes com crossfade e auto-avanço, marquee, accordion, barra de CTA fixa |

A página tem botão flutuante e CTAs que levam ao WhatsApp **+55 43 99995-9080** (`https://wa.me/5543999959080`) com mensagem pré-preenchida.

## Estrutura

```
├── server.js                # Express: rotas /, /lp2
├── views/index.ejs          # Índice das landing pages
├── shared/
│   ├── data/imovel.json     # Dados do imóvel, fotos, corretora (fonte única)
│   └── img/                 # 20 fotos (.webp) + logos
└── landing-02-noir/
    ├── views/index.ejs
    └── public/{css,js}/
```

## Personalizando

- **Dados do imóvel / fotos / telefone:** edite `shared/data/imovel.json`. A página lê desse arquivo.
- **Mensagem padrão do WhatsApp:** função `whatsapp()` em `server.js`.
- **Adicionar uma nova landing:** crie a pasta com `views/index.ejs` + `public/`, e adicione a entrada no array `landings` em `server.js`.

## Dependências externas (CDN)

- Google Fonts (Inter, Cormorant Garamond/Manrope)
- GSAP 3.12.5 + ScrollTrigger
- Google Maps Embed (sem chave de API)

## Deploy (GitHub Pages)

O GitHub Pages hospeda apenas arquivos estáticos, então o deploy usa `build.js`, que renderiza os EJS em HTML puro dentro de `dist/`:

```bash
npm run build                          # paths na raiz (domínio próprio)
BASE_PATH=/lpDanielaImoveis npm run build   # paths com prefixo (GitHub Pages em subpasta)
```

O workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) roda automaticamente a cada **push na `main`**: instala dependências, executa o build com `BASE_PATH=/<nome-do-repo>` e publica `dist/` no GitHub Pages.

URL publicada: <https://eduardormalves.github.io/lpDanielaImoveis/>

> Para usar um domínio próprio, basta remover o `BASE_PATH` do workflow e configurar o domínio nas settings do Pages.
