# Criativart · Landing page

Landing page da loja física Criativart (personalizados, Campina Grande — PB).
Objetivo: apresentar a marca e levar o visitante ao WhatsApp ou ao Instagram.

Stack: Vite + HTML/CSS/JS puro, GSAP (ScrollTrigger) e Lenis para o movimento,
Inter (self-hosted via Fontsource).

```bash
npm install
npm run dev       # desenvolvimento
npm run build     # gera dist/ (site estático)
npm run preview   # serve o dist/
npm run media     # regenera public/media a partir de assets/
```

## Antes de publicar

Defina o domínio definitivo em `url` ([src/data/site.js](src/data/site.js)).

Todo texto variável (telefone, WhatsApp, Instagram, mensagens prontas do
WhatsApp, campanha atual) mora nesse arquivo e é injetado no `index.html`
durante o build pelo plugin em [vite.config.js](vite.config.js).

## Campanha atual

A seção "Novidades" está montada para o Dia do Professor (15/10). Para trocar:
`campaign` e `messages.campanha` em `site.js`, e o texto/vídeo da seção
`#novidades` no `index.html`. A contagem de dias some sozinha depois da data.

## Mídias

`assets/` guarda os originais (Instagram e catálogo — o catálogo é só
referência e não vai para o site). O script `scripts/build-media.mjs`:

- converte as fotos para WebP em 480/960/1440 px;
- corta os vídeos em trechos **sem legenda gravada**, remove o áudio e
  comprime (H.264, `faststart`), gerando um pôster `.webp` para cada um;
- extrai fotos dos vídeos para a seção da loja;
- gera favicon, logo rasterizado e imagem de compartilhamento.

Os cortes de cada vídeo estão em `CLIPS` no script. Ele só gera o que ainda
não existe; apague o arquivo em `public/media` para regenerar.

## Preloader

Fica inline no `index.html` (CSS no `<head>`, marcação e script no início do
`<body>`) para aparecer antes do bundle. Dura no mínimo 3 s contados do
início da navegação e espera o DOM, o bundle e a fonte; nunca passa de 7 s.
O anel de progresso e a porcentagem seguem o tempo e param em 97% se a
página ainda não estiver pronta.
Ao sair, dispara o evento `preloader:done`, que libera a rolagem e inicia a
entrada do hero (`onPreloaderDone` em `src/js/motion.js`).

A fonte Inter é servida de `public/fonts` e pré-carregada no `<head>`
(copiada de `node_modules` pelo `npm run media`).

## Acessibilidade e desempenho

- Com "reduzir movimento" ativado no sistema, as animações, o pin do showcase
  e o autoplay dos vídeos ficam desligados; o conteúdo aparece direto.
- Vídeos fora do hero só carregam perto da tela e só tocam quando visíveis.
- Se o JS demorar mais de 5 s, a página segue no modo estático.
