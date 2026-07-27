"use client";
// Adapted from Aceternity — ascii-art / matrix demo. Canvas matrix rain (owned source).
import { useEffect, useRef } from "react";

export default function AsciiArtMatrix({
  color = "#f5b642",
  accent = "#ff2d78",
  fontSize = 14,
  className = "",
  chars = "01アイウエオカキ*#%+=EBIA",
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, cols, drops;

    const init = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.floor(w / fontSize);
      drops = new Array(cols).fill(0).map(() => Math.random() * -50);
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
    };
    init();
    window.addEventListener("resize", init);

    let raf = 0;
    let frame = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      frame++;
      if (frame % 2 !== 0) return; // slow it down a touch
      ctx.fillStyle = "rgba(5,4,3,0.10)";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < cols; i++) {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillStyle = Math.random() > 0.97 ? accent : color;
        ctx.globalAlpha = 0.15 + Math.random() * 0.5;
        ctx.fillText(ch, x, y);
        if (y > h && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 1;
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", init);
    };
  }, [color, accent, fontSize, chars]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
