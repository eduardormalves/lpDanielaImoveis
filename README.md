# Landing Pages — Daniela Ribeiro Imóveis

Três exemplos de landing page para o apartamento **AP0223 — Maison Legacy Residence** (Gleba Fazenda Palhano, Londrina/PR), construídos com **Node.js + Express + EJS**.

## Como rodar

```bash
npm install
npm start
```

Abra <http://localhost:3000> — a página inicial lista os três exemplos:

| Rota   | Pasta                  | Estilo                       | Interações principais |
|--------|------------------------|------------------------------|-----------------------|
| `/lp1` | `landing-01-elegance/` | Claro · editorial            | Hero com slideshow Ken Burns, contadores animados, galeria filtrável + lightbox (teclado/swipe), parallax, formulário que abre o WhatsApp já preenchido |
| `/lp2` | `landing-02-noir/`     | Escuro · cinematográfico     | Preloader, cursor customizado, título com máscara, galeria com scroll horizontal (GSAP ScrollTrigger), tour por ambientes com crossfade e auto-avanço, marquee, accordion, barra de CTA fixa |
| `/lp3` | `landing-03-story/`    | Scrollytelling · conversão   | Narrativa guiada por scroll com imagem fixa, carrossel Swiper, simulador de financiamento (Tabela Price), FAQ, mapa, barra de progresso |

Todas têm botão flutuante e CTAs que levam ao WhatsApp **+55 43 99995-9080** (`https://wa.me/5543999959080`) com mensagem pré-preenchida.

## Estrutura

```
├── server.js                # Express: rotas /, /lp1, /lp2, /lp3
├── views/index.ejs          # Índice com os 3 exemplos
├── shared/
│   ├── data/imovel.json     # Dados do imóvel, fotos, corretora (fonte única)
│   └── img/                 # 20 fotos (.webp) + logos
├── landing-01-elegance/
│   ├── views/index.ejs
│   └── public/{css,js}/
├── landing-02-noir/
│   ├── views/index.ejs
│   └── public/{css,js}/
└── landing-03-story/
    ├── views/index.ejs
    └── public/{css,js}/
```

## Personalizando

- **Dados do imóvel / fotos / telefone:** edite `shared/data/imovel.json`. Todas as três páginas leem desse arquivo.
- **Mensagem padrão do WhatsApp:** função `whatsapp()` em `server.js`.
- **Adicionar uma nova landing:** crie a pasta com `views/index.ejs` + `public/`, e adicione a entrada no array `landings` em `server.js`.

## Dependências externas (CDN)

- Google Fonts (Playfair Display/Inter, Cormorant Garamond/Manrope, Fraunces/DM Sans)
- GSAP 3.12.5 + ScrollTrigger (LP2 e LP3)
- Swiper 11.2.10 (LP3)
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
