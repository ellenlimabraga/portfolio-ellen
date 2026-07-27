# portfolio-ellen

Portfólio de **Ellen Braga** — Creative Director · IA Generativa · Designer.

Projeto **Next.js 14 (App Router) + Tailwind + shadcn**, com componentes de
**React Bits**, **Aceternity UI** e **Magic UI**. Estética: preto profundo +
aurora quente (âmbar → magenta → violeta), texturas de ASCII / halftone / dither
e grão de filme, inspiradas no moodboard da Ellen.

## Stack
- **Next.js 14.2** (App Router, JavaScript/JSX)
- **Tailwind CSS 3.4** + design tokens em `app/globals.css`
- **framer-motion** e **ogl** (WebGL) para os efeitos 2D/shader
- **three.js + @react-three/fiber + drei + @react-three/rapier + meshline** para o Lanyard 3D
- **shadcn** (`components.json`) com os registries `@react-bits`, `@aceternity` e `@magicui` já configurados
- Export estático (`output: "export"`) — o `next build` gera `out/` para publicar em qualquer host

## Rodar
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # gera ./out (site estático)
```

## Componentes (em `components/`)
Escritos como *source* no projeto — o modelo shadcn é "copiar e ser dono do código".
Nesta sessão os registries oficiais estavam bloqueados pela rede, então foram
recriados fielmente (mesmos nomes/APIs) usando as dependências npm que eles usam.
Com rede aberta, `npx shadcn@latest add @react-bits/...` continua funcionando para
adicionar novos componentes.

**react-bits/**
- `Aurora` · `Galaxy` · `LightRays` (SideRays) — fundos WebGL (ogl)
- `ASCIIText` — monograma/texto em ASCII animado (canvas)
- `BlurText` — revelação palavra a palavra (framer-motion)
- `FlowingMenu` — menu com preenchimento animado (usado no mobile)
- `CircularGallery` — carrossel arrastável com curvatura
- `SpecularButton` — botão com brilho especular no cursor
- `BorderGlow` — borda cônica animada (cards de serviço)
- `Lanyard` — crachá 3D pendurado e arrastável (three.js + física rapier + banda meshline; card e banda procedurais, sem GLB externo)

**aceternity/**
- `Terminal` — bloco "sobre" com digitação
- `AsciiArtMatrix` — chuva estilo matrix (canvas)
- `DitherDuotone` — shader de dithering duotone (ogl)

**magicui/**
- `DiaTextReveal` — reveal de texto ligado ao scroll

## Deploy
- **Estático** (GitHub Pages / Netlify / S3): use a pasta `out/` gerada pelo `npm run build`.
- **Vercel**: importe o repositório (build automático).

## Estrutura
```
app/            layout, page, estilos globais e da página
components/     react-bits · aceternity · magicui
lib/utils.js    helper cn()
_legacy/        versão estática anterior (HTML único), preservada
```
