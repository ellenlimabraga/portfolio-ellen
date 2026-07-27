"use client";
// Adapted from Aceternity/Magic UI — Terminal. Owned source in-project.
import { useEffect, useRef, useState } from "react";

export function Terminal({ title = "ellen@studio — ~/portfolio", lines = [], className = "" }) {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  const [html, setHtml] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setStarted(true);
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let cancelled = false;
    let buf = "";
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    const run = async () => {
      for (const line of lines) {
        if (cancelled) return;
        if (line.type === "cmd") {
          buf += `<span class="t-pr">ellen@studio</span>:~$ `;
          for (const ch of line.text) {
            if (cancelled) return;
            buf += ch;
            setHtml(buf);
            await sleep(22);
          }
          buf += "<br/>";
        } else {
          buf += `<span class="${line.className || "t-out"}">${line.text}</span><br/>`;
        }
        buf += "";
        setHtml(buf);
        await sleep(line.pause ?? 260);
      }
      buf += `<span class="t-pr">ellen@studio</span>:~$ <span class="t-cur"></span>`;
      setHtml(buf);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [started, lines]);

  return (
    <div ref={ref} className={`term ${className}`}>
      <div className="term-bar">
        <span className="term-dot r" />
        <span className="term-dot y" />
        <span className="term-dot g" />
        <span className="term-title">{title}</span>
      </div>
      <div className="term-body" dangerouslySetInnerHTML={{ __html: html }} />
      <style jsx global>{`
        .term {
          border: 1px solid var(--line);
          border-radius: 14px;
          overflow: hidden;
          background: #080605;
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.5);
        }
        .term-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--line);
          background: #0b0806;
        }
        .term-dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;
        }
        .term-dot.r {
          background: #ff5f56;
        }
        .term-dot.y {
          background: #ffbd2e;
        }
        .term-dot.g {
          background: #27c93f;
        }
        .term-title {
          margin-left: 8px;
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--faint);
        }
        .term-body {
          padding: 22px;
          font-family: var(--font-mono);
          font-size: 13.5px;
          line-height: 1.85;
          min-height: 280px;
        }
        .t-pr {
          color: var(--gold);
        }
        .t-out {
          color: var(--ink);
        }
        .t-cm {
          color: var(--muted);
        }
        .t-ok {
          color: #27c93f;
        }
        .t-va {
          color: var(--pink);
        }
        .t-cur {
          display: inline-block;
          width: 8px;
          height: 15px;
          background: var(--gold);
          vertical-align: middle;
          animation: t-blink 1s steps(1) infinite;
        }
        @keyframes t-blink {
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default Terminal;
