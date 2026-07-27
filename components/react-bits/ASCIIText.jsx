"use client";
// Adapted from React Bits — ASCIIText. Canvas implementation (owned source).
import { useEffect, useRef } from "react";
import "./ASCIIText.css";

const CHARS = " .:-=+*#%@";

export default function ASCIIText({
  text = "ELLEN",
  asciiFontSize = 10,
  className = "",
  enableWaves = true,
  colorStops = ["#f5b642", "#ff2d78", "#a855f7"],
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");

    // offscreen canvas to rasterize the text into a brightness map
    const off = document.createElement("canvas");
    const octx = off.getContext("2d");

    let cell = asciiFontSize;
    let cols = 0;
    let rows = 0;
    let map = [];
    let W = 0;
    let H = 0;

    const build = () => {
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${cell}px "JetBrains Mono", monospace`;
      ctx.textBaseline = "top";

      cols = Math.floor(W / cell);
      rows = Math.floor(H / cell);
      off.width = cols;
      off.height = rows;
      octx.fillStyle = "#000";
      octx.fillRect(0, 0, cols, rows);
      octx.fillStyle = "#fff";
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      // fit font size to the grid
      let fs = rows;
      octx.font = `700 ${fs}px "Space Grotesk", sans-serif`;
      while (octx.measureText(text).width > cols * 0.92 && fs > 4) {
        fs -= 1;
        octx.font = `700 ${fs}px "Space Grotesk", sans-serif`;
      }
      octx.fillText(text, cols / 2, rows / 2);
      const data = octx.getImageData(0, 0, cols, rows).data;
      map = new Array(cols * rows);
      for (let i = 0; i < cols * rows; i++) map[i] = data[i * 4] / 255;
    };

    build();
    const onResize = () => build();
    window.addEventListener("resize", onResize);

    let t = 0;
    let raf = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      t += 0.03;
      ctx.clearRect(0, 0, W, H);
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          let b = map[j * cols + i] || 0;
          if (b < 0.04) continue;
          if (enableWaves) {
            b += 0.12 * Math.sin(i * 0.4 - t * 2) * Math.sin(j * 0.5 + t);
          }
          b = Math.max(0, Math.min(1, b));
          const ci = Math.min(CHARS.length - 1, Math.floor(b * CHARS.length));
          const ch = CHARS[ci];
          if (ch === " ") continue;
          const fx = i / cols;
          let col;
          if (fx < 0.5) col = colorStops[0];
          else if (fx < 0.78) col = colorStops[1];
          else col = colorStops[2];
          ctx.fillStyle = col;
          ctx.globalAlpha = 0.4 + b * 0.6;
          ctx.fillText(ch, i * cell, j * cell);
        }
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, asciiFontSize, enableWaves]);

  return (
    <div ref={wrapRef} className={`ascii-text ${className}`}>
      <canvas ref={canvasRef} />
    </div>
  );
}
