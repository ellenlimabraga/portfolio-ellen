"use client";
import { useEffect, useRef, useState } from "react";
import "./page.css";

import Aurora from "@/components/react-bits/Aurora";
import Galaxy from "@/components/react-bits/Galaxy";
import LightRays from "@/components/react-bits/LightRays";
import ASCIIText from "@/components/react-bits/ASCIIText";
import BlurText from "@/components/react-bits/BlurText";
import FlowingMenu from "@/components/react-bits/FlowingMenu";
import CircularGallery from "@/components/react-bits/CircularGallery";
import SpecularButton from "@/components/react-bits/SpecularButton";
import BorderGlow from "@/components/react-bits/BorderGlow";
import Lanyard from "@/components/react-bits/Lanyard";
import Terminal from "@/components/aceternity/Terminal";
import AsciiArtMatrix from "@/components/aceternity/AsciiArtMatrix";
import DitherDuotone from "@/components/aceternity/DitherDuotone";
import DiaTextReveal from "@/components/magicui/DiaTextReveal";

const WORKS = [
  { cat: "IA · Fotografia", text: "Clone Visual", pal: [[245, 182, 66], [255, 45, 120]] },
  { cat: "Music · Design", text: "Capas Musicais", pal: [[255, 45, 120], [168, 85, 247]] },
  { cat: "Vídeo · Motion", text: "Vídeos Comerciais", pal: [[255, 152, 56], [168, 85, 247]] },
  { cat: "Branding", text: "Design Gráfico", pal: [[168, 85, 247], [255, 95, 162]] },
  { cat: "IA · Natureza", text: "Orgânico × Digital", pal: [[245, 182, 66], [168, 85, 247]] },
];

const MENU_ITEMS = [
  { link: "#trabalhos", text: "Trabalhos" },
  { link: "#sobre", text: "Sobre" },
  { link: "#processo", text: "Processo" },
  { link: "#servicos", text: "Serviços" },
  { link: "#contato", text: "Contato" },
];

/* generative halftone/duotone flower thumbnail -> data URL */
function makeThumb(pal, seed) {
  const W = 380, H = 475;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d");
  x.fillStyle = "#080605";
  x.fillRect(0, 0, W, H);
  const cx = W / 2, cy = H / 2, maxR = (Math.min(W, H) / 2) * 0.92;
  const step = 7;
  let rnd = seed * 99 + 1;
  const rand = () => { rnd = (rnd * 9301 + 49297) % 233280; return rnd / 233280; };
  for (let py = 0; py < H; py += step) {
    for (let px = 0; px < W; px += step) {
      const dx = px - cx, dy = py - cy;
      const r = Math.sqrt(dx * dx + dy * dy) / maxR;
      const ang = Math.atan2(dy, dx);
      const petal = Math.abs(Math.cos(2.5 * ang)) * 0.6 + 0.2;
      let v = (petal - r) / petal + (1 - r) * 0.4;
      v += 0.15 * Math.sin(ang * 8 + r * 14);
      v = Math.max(0, Math.min(1, v));
      if (v < 0.05) continue;
      const rad = v * step * 0.62 * (0.8 + rand() * 0.4);
      const mix = Math.min(1, r * 1.2);
      const col = pal[0].map((cc, i) => Math.round(cc * (1 - mix) + pal[1][i] * mix));
      x.beginPath();
      x.arc(px, py, rad, 0, 7);
      x.fillStyle = `rgba(${col.join(",")},${(0.35 + v * 0.55).toFixed(2)})`;
      x.fill();
    }
  }
  const im = x.getImageData(0, 0, W, H), d = im.data;
  for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - 0.5) * 22; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  x.putImageData(im, 0, 0);
  const vg = x.createRadialGradient(cx, cy, 0, cx, cy, maxR * 1.1);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(5,4,3,.75)");
  x.fillStyle = vg;
  x.fillRect(0, 0, W, H);
  return c.toDataURL("image/png");
}

export default function Page() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [galleryItems, setGalleryItems] = useState([]);
  const progressRef = useRef(null);

  useEffect(() => {
    setGalleryItems(
      WORKS.map((w, i) => ({ image: makeThumb(w.pal, i), text: w.text, cat: w.cat }))
    );
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
      if (progressRef.current) progressRef.current.style.width = `${p * 100}%`;
      setScrolled(h.scrollTop > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.15 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [galleryItems]);

  return (
    <>
      {/* fixed backgrounds */}
      <div className="bg-fixed"><Aurora colorStops={["#ff9838", "#ff2d78", "#a855f7"]} amplitude={1.0} blend={0.55} speed={0.7} /></div>
      <div className="bg-vignette" />
      <div className="progress" ref={progressRef} />

      {/* NAV */}
      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-inner">
          <a href="#top" className="brand">ELLEN<b>*</b>BRAGA</a>
          <div className="nav-menu">
            {MENU_ITEMS.map((m) => <a key={m.link} href={m.link}>{m.text}</a>)}
          </div>
          <a href="#contato" className="nav-cta">Iniciar projeto →</a>
          <button className="burger" aria-label="Menu" onClick={() => setMenuOpen(true)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* MOBILE FLOWING MENU */}
      <div className={`mobile-overlay ${menuOpen ? "open" : ""}`}>
        <button className="mobile-close" onClick={() => setMenuOpen(false)}>fechar ✕</button>
        <div className="mobile-menu-height" onClick={() => setMenuOpen(false)}>
          <FlowingMenu items={MENU_ITEMS} />
        </div>
      </div>

      {/* HERO */}
      <header className="hero" id="top">
        <div className="hero-galaxy"><Galaxy density={1.1} glowIntensity={0.5} hueShift={18} twinkleIntensity={1.1} rotationSpeed={0.5} saturation={0.75} mouseInteraction={1} /></div>
        <div className="hero-rays"><LightRays raysColor="#ff9838" raysSpeed={0.8} raysSpread={1.1} raysOrigin="top-center" /></div>
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow reveal">Creative Director · IA Generativa · Designer</span>
            <h1>
              <BlurText text="Real ou" className="hero-line" delay={70} />
              <BlurText text="gerado?" className="hero-line grad-line" delay={110} />
              <BlurText text="Você decide." className="hero-line" delay={90} />
            </h1>
            <p className="sub reveal">Crio visuais audaciosos onde <b>não dá pra saber o que é real e o que é IA</b>. Conceitual radical, execução perfeita.</p>
            <p className="kicker reveal">// ensaios · capas · vídeo · branding — pronto pra ir ao ar</p>
            <div className="cta-row reveal">
              <SpecularButton as="a" href="#trabalhos">Ver trabalhos</SpecularButton>
              <SpecularButton as="a" href="#contato" variant="ghost">Vamos criar →</SpecularButton>
            </div>
          </div>
          <div className="reveal">
            <div className="hero-ascii-wrap">
              <ASCIIText text="EB" asciiFontSize={9} />
              <span className="ascii-badge">orgânico × generativo</span>
            </div>
          </div>
        </div>
      </header>

      {/* MARQUEE STRIP */}
      <div className="strip">
        <div className="track">
          {[0, 1].map((k) => (
            <span key={k} style={{ display: "inline-flex", gap: 44 }}>
              <span><b>*</b> Fotorrealismo IA</span><span><b>*</b> Direção de Arte</span>
              <span><b>*</b> Capas Musicais</span><span><b>*</b> Vídeo Generativo</span>
              <span><b>*</b> Branding</span><span><b>*</b> Retoque Avançado</span>
              <span><b>*</b> Conceitual Radical</span><span><b>*</b> Motion</span>
            </span>
          ))}
        </div>
      </div>

      {/* WORKS */}
      <section className="sec" id="trabalhos">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">01 — Portfólio</span>
            <h2>Trabalhos <span className="gradient-text">recentes</span></h2>
            <p>Uma seleção de projetos onde o generativo encontra o fotográfico.</p>
          </div>
        </div>
        <div className="wrap">
          {galleryItems.length > 0 && (
            <CircularGallery items={galleryItems} bend={2.2} textColor="#f4ede2" borderRadius={0.06} scrollSpeed={1.4} scrollEase={0.06} />
          )}
        </div>
      </section>

      {/* ABOUT + TERMINAL */}
      <section className="sec" id="sobre">
        <div className="wrap about-grid">
          <div className="about-copy reveal">
            <span className="eyebrow">02 — Sobre</span>
            <h2 style={{ fontSize: "clamp(2rem,5vw,3.2rem)", margin: "16px 0 22px" }}>
              Direção criativa na fronteira do <span className="gradient-text">real</span>
            </h2>
            <p><b>Ellen Braga</b> é diretora criativa focada em IA generativa. Transformo briefings em sistemas visuais que confundem — no melhor sentido — a linha entre fotografia e síntese.</p>
            <p>Trabalho com marcas, artistas e labels que querem se diferenciar com imagem: da concepção conceitual ao frame final entregue, pronto pra publicar.</p>
            <div className="stats">
              <div className="stat"><div className="n gradient-text">+120</div><div className="l">projetos entregues</div></div>
              <div className="stat"><div className="n gradient-text">+40</div><div className="l">marcas & artistas</div></div>
              <div className="stat"><div className="n gradient-text">100%</div><div className="l">pronto pra ir ao ar</div></div>
            </div>
          </div>
          <div className="reveal">
            <Terminal
              lines={[
                { type: "cmd", text: "whoami" },
                { type: "out", className: "t-va", text: "Creative Director · IA Generativa · Designer" },
                { type: "cmd", text: "cat skills.txt" },
                { type: "out", className: "t-cm", text: "// direção de arte · fotorrealismo IA" },
                { type: "out", className: "t-cm", text: "// retoque · color grading · motion" },
                { type: "out", className: "t-cm", text: "// branding · tipografia · concept" },
                { type: "cmd", text: "ls ./ferramentas" },
                { type: "out", text: "midjourney  flux  runway  photoshop  after_effects" },
                { type: "cmd", text: "./deploy --projeto novo" },
                { type: "out", className: "t-ok", text: "✓ pronto pra ir ao ar." },
              ]}
            />
          </div>
        </div>
      </section>

      {/* MANIFESTO — dither duotone band */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="manifesto reveal">
            <div className="dither"><DitherDuotone colorA="#0a0605" colorB="#ff2d78" scale={4.5} /></div>
            <p className="quote">
              “A melhor imagem é a que faz você <span className="gradient-text">duvidar</span> se é real.”
            </p>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="sec" id="processo">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">03 — Como trabalho</span>
            <DiaTextReveal gradient text="Do conceito ao frame final." />
            <p style={{ marginTop: 14 }}>Um processo enxuto, colaborativo e obsessivo com o detalhe.</p>
          </div>
          <div className="steps reveal">
            <div className="step"><div className="k">01</div><h4>Conceito</h4><p>Mergulho no briefing, referências e território visual. Direção antes do pixel.</p></div>
            <div className="step"><div className="k">02</div><h4>Geração</h4><p>Exploração generativa com os modelos certos para cada estética.</p></div>
            <div className="step"><div className="k">03</div><h4>Refino</h4><p>Retoque, composição e color grading até o fotorrealismo impecável.</p></div>
            <div className="step"><div className="k">04</div><h4>Entrega</h4><p>Arquivos finalizados, nos formatos certos, prontos pra ir ao ar.</p></div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="sec" id="servicos">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">04 — Serviços</span>
            <h2>Pacotes & <span className="gradient-text">investimento</span></h2>
            <p>Escopos claros. Sem surpresa. Projetos sob medida também são bem-vindos.</p>
          </div>
          <div className="grid-3 reveal">
            <BorderGlow>
              <div className="svc">
                <span className="tier">Áudio-visual</span>
                <h3>Capas + Visualizer</h3>
                <div className="price gradient-text">R$ 3.500</div>
                <ul><li>5 peças de arte visual</li><li>1 vídeo comercial / visualizer</li><li>Variações para feed & stories</li><li>2 rodadas de ajustes</li></ul>
              </div>
            </BorderGlow>
            <BorderGlow colors={["var(--magenta)", "var(--violet)"]} speed={5}>
              <div className="svc feat">
                <span className="pop">Mais pedido</span>
                <span className="tier">Assinatura Ellen</span>
                <h3>Campanha Visual</h3>
                <div className="price gradient-text">R$ 4.500</div>
                <ul><li>Direção de arte completa</li><li>Sistema visual + consultoria</li><li>Ensaio IA + peças de vídeo</li><li>Kit de aplicação da marca</li></ul>
              </div>
            </BorderGlow>
            <BorderGlow>
              <div className="svc">
                <span className="tier">Conceitual</span>
                <h3>Clone IA</h3>
                <div className="price gradient-text">R$ 2.500</div>
                <ul><li>Ensaio fotográfico conceitual</li><li>Fotorrealismo com IA</li><li>Retoque avançado</li><li>10 imagens finais</li></ul>
              </div>
            </BorderGlow>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="sec" id="contato">
        <div className="wrap">
          <div className="contact-wrap reveal">
            <div className="contact-matrix"><AsciiArtMatrix color="#f5b642" accent="#ff2d78" /></div>
            <div className="contact-grid">
              <div>
                <span className="eyebrow">05 — Contato</span>
                <DiaTextReveal gradient text="Pronto para criar algo audacioso?" style={{ marginTop: 10, fontSize: "clamp(2rem,6vw,3.6rem)" }} />
                <p style={{ marginTop: 18 }}>Me conta sua visão. Transformo em imagem que diferencia sua marca — e que ninguém vai saber se é real ou IA.</p>
                <div className="cta-row">
                  <SpecularButton as="a" href="mailto:contato@ellenbraga.com">Enviar briefing</SpecularButton>
                  <SpecularButton as="a" href="#" variant="ghost">Ver Instagram →</SpecularButton>
                </div>
                <div className="contact-links">
                  <a href="mailto:contato@ellenbraga.com">contato@ellenbraga.com</a>
                  <a href="#">@ellenbraga</a>
                  <a href="#">behance</a>
                </div>
              </div>
              <div>
                <Lanyard name="ELLEN BRAGA" role="Creative Director" tag="IA · GEN" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="wrap foot">
          <a href="#top" className="brand">ELLEN<b>*</b>BRAGA</a>
          <div className="soc">
            <a href="#">Instagram</a><a href="#">Behance</a><a href="#">TikTok</a><a href="mailto:contato@ellenbraga.com">Email</a>
          </div>
          <div className="cr">© 2026 Ellen Braga · Creative Director</div>
        </div>
      </footer>
    </>
  );
}
