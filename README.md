# portfolio-ellen

Portfólio de **Ellen Braga** — Creative Director · IA Generativa · Designer.

Site estático de página única (`index.html`), sem etapa de build — pronto para publicar no GitHub Pages ou qualquer host estático.

## Estética
Preto profundo + aurora quente (âmbar → magenta → violeta), com texturas de ASCII / halftone e grão de filme, inspiradas no moodboard da Ellen.

## Efeitos (tudo em JS/CSS/canvas puro, self-contained)
- **Aurora** — fundo animado em canvas com blobs de cor
- **Galaxy / Side Rays** — partículas e raios de luz laterais
- **ASCII Flower** — flor generativa em ASCII no hero (canvas)
- **Halftone / Duotone Dither** — thumbnails de projeto geradas em canvas
- **Border Glow** — bordas cônicas animadas nos cards de serviço
- **Specular Button** — botões com brilho que segue o cursor
- **Blur Text Reveal** — texto que revela palavra a palavra
- **Flowing Menu** — navegação com preenchimento animado
- **Circular / Draggable Gallery** — carrossel de trabalhos
- **Terminal** — bloco "sobre" com digitação animada

## Rodar localmente
Basta abrir `index.html` no navegador (ou servir a pasta):

```bash
python3 -m http.server 8000
# http://localhost:8000
```
