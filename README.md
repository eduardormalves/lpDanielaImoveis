# Landing Pages da Daniela Ribeiro Imóveis

Landing pages de imóveis da **Daniela Ribeiro Imóveis**, construídas com **Node.js + Express + EJS**. Todas compartilham a mesma identidade visual (marrom `#84716B` + branco, fundo claro) e os mesmos assets de marca.

## Como rodar

```bash
npm install
npm start
```

Abra <http://localhost:3000>. A raiz `/` é uma página neutra (logo + WhatsApp), sem listar imóveis. Cada landing é divulgada só pelo link direto:

| Rota                    | Pasta                  | Imóvel | Interações principais |
|-------------------------|------------------------|--------|-----------------------|
| `/maisonlegacy/ap0223/` | `maisonlegacy-ap0223/` | Apartamento 183 m², Gleba Palhano | Preloader, cursor customizado, galeria em loop infinito, navegação por ambientes com crossfade, marquee, accordion, barra de CTA fixa |
| `/royalpark/ca0001/`    | `royalpark-ca0001/`    | Casa 398 m², Esperança | **Versão compacta:** preloader, cursor, hero, **tour em vídeo**, galeria em loop, ficha com destaques em grade, barra de CTA fixa |

A página tem botão flutuante e CTAs que levam ao WhatsApp **+55 43 99995-9080** (`https://wa.me/5543999959080`) com mensagem pré-preenchida.

### Sobre a versão compacta (CA0001)

Feita a partir do modelo da AP0223, com o mesmo layout e paleta, mas mais curta e direta:

- **saiu** a seção de navegação por ambientes (tela cheia com crossfade e auto-avanço);
- **saiu** o accordion de destaques, que virou uma grade com os 8 destaques visíveis de uma vez;
- **entrou** o bloco de **tour em vídeo**, em moldura vertical 9:16 sobre o marrom da marca;
- espaçamentos verticais menores (variável `--sec` no CSS).

Resultado: ~17% mais curta que a AP0223 no desktop (5.8k vs 7.1k px) e ~6% no celular.

## Estrutura

```
├── server.js                # Express: rota / + uma rota por landing
├── build.js                 # Render estático para dist/
├── views/index.ejs          # Página neutra da raiz (logo + contato)
├── shared/
│   ├── data/
│   │   ├── corretora.json   # Dados da Daniela, comuns a TODAS as landings
│   │   ├── ap0223.json      # Dados do imóvel AP0223
│   │   └── ca0001.json      # Dados do imóvel CA0001
│   └── img/                 # Assets de marca: logos, fotos da Daniela
│                            # (+ as 20 fotos da AP0223, que nasceram aqui)
├── maisonlegacy-ap0223/     # <empreendimento>-<código da ficha>
│   ├── views/index.ejs
│   └── public/{css,js}/
└── royalpark-ca0001/
    ├── views/index.ejs
    └── public/
        ├── css/ js/
        └── media/           # 18 fotos .webp + tour.mp4 + poster do vídeo
```

Cada landing recebe na view o objeto `imovel` (dados do próprio imóvel + o bloco `corretora`), `base` (o caminho público) e o helper `asset(src)`, que resolve `/media/…` para dentro da landing e deixa `/shared/…` intacto.

## Adicionando uma nova landing

1. Crie `shared/data/<codigo>.json` com os dados do imóvel (use `ca0001.json` como base).
2. Crie a pasta `<empreendimento>-<codigo>/` com `views/index.ejs` e `public/{css,js,media}/`.
3. Coloque fotos e vídeos em `public/media/` e referencie-os no JSON como `/media/arquivo.webp`. A view resolve com `asset()`.
4. Adicione a entrada no array `landings` em [server.js](server.js), apontando `dados` para o JSON criado.

O `slug` vira o caminho público (`<empreendimento>/<código>`); use o código da ficha, não o número do apartamento.

> As fotos da AP0223 continuam em `shared/img/` por serem anteriores a essa organização. Landings novas colocam as mídias em `public/media/`.

## Preparando as mídias

Fotos: converter para `.webp` (qualidade ~80) e manter a largura máxima em torno de 1024 px. Vídeos: reencodar para H.264 com áudio AAC e `-movflags +faststart` (o tour do CA0001 ficou em 480×854, ~6 MB para 1 min 22). Vale conferir o final do arquivo, que às vezes traz telefone ou marca de terceiros.

## Dependências externas (CDN)

- Google Fonts (Cormorant Garamond + Manrope)
- GSAP 3.12.5 + ScrollTrigger
- Google Maps Embed (sem chave de API)

## Deploy (GitHub Pages)

O GitHub Pages hospeda apenas arquivos estáticos, então o deploy usa `build.js`, que renderiza os EJS em HTML puro dentro de `dist/`:

```bash
npm run build                               # paths na raiz (domínio próprio)
BASE_PATH=/lpDanielaImoveis npm run build   # paths com prefixo (GitHub Pages em subpasta)
```

O workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) roda automaticamente a cada **push na `main`**: instala dependências, executa o build com `BASE_PATH=/<nome-do-repo>` e publica `dist/` no GitHub Pages.

URL publicada: <https://eduardormalves.github.io/lpDanielaImoveis/maisonlegacy/ap0223/>

> Para usar um domínio próprio, basta remover o `BASE_PATH` do workflow e configurar o domínio nas settings do Pages.

## Deploy (Cloudflare Workers)

O [wrangler.jsonc](wrangler.jsonc) publica a pasta `dist/` como site estático. No painel da Cloudflare, importe o repositório com:

- Comando da build: `npm run build`
- Comando de implantação: `npx wrangler deploy`

Não defina `BASE_PATH`: na Cloudflare o site fica na raiz do domínio.

URLs publicadas:

- <https://lp.danielaribeiroimoveis.com.br/maisonlegacy/ap0223/>
- <https://lp.danielaribeiroimoveis.com.br/royalpark/ca0001/>
