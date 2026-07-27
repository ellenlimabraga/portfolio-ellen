"use client";
// Adapted from React Bits — CircularGallery. DOM + drag/inertia with a curved bend.
import { useEffect, useRef } from "react";
import "./CircularGallery.css";

export default function CircularGallery({
  items = [],
  bend = 2,
  textColor = "#f4ede2",
  borderRadius = 0.05,
  scrollSpeed = 2,
  scrollEase = 0.06,
}) {
  const trackRef = useRef(null);
  const state = useRef({
    scroll: 0,
    target: 0,
    isDown: false,
    startX: 0,
    startScroll: 0,
    cardW: 340,
    total: 0,
    v: 0,
    lastX: 0,
  });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const s = state.current;
    const cards = Array.from(track.children);
    const gap = 24;

    const measure = () => {
      const first = cards[0];
      s.cardW = (first ? first.offsetWidth : 320) + gap;
      s.total = s.cardW * items.length;
    };
    measure();
    window.addEventListener("resize", measure);

    const mod = (n, m) => ((n % m) + m) % m;

    const layout = () => {
      const half = track.offsetWidth / 2;
      cards.forEach((card, i) => {
        let x = i * s.cardW - mod(s.scroll, s.total);
        // wrap around for infinite feel
        if (x > s.total - s.cardW) x -= s.total;
        if (x < -s.cardW * 1.5) x += s.total;
        const center = x + s.cardW / 2 - half + s.cardW / 2;
        const dist = center / half; // -1..1 range roughly
        const rotateY = -dist * 8 * bend;
        const translateZ = -Math.abs(dist) * 40 * bend;
        const scale = 1 - Math.min(Math.abs(dist) * 0.08, 0.22);
        card.style.transform = `translateX(${x}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
        card.style.opacity = String(1 - Math.min(Math.abs(dist) * 0.35, 0.55));
        card.style.zIndex = String(1000 - Math.round(Math.abs(dist) * 100));
      });
    };

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!s.isDown) s.target += s.v;
      s.v *= 0.92;
      s.scroll += (s.target - s.scroll) * scrollEase;
      layout();
    };
    raf = requestAnimationFrame(loop);

    const onDown = (e) => {
      s.isDown = true;
      s.startX = e.clientX;
      s.lastX = e.clientX;
      s.startScroll = s.target;
      track.classList.add("dragging");
    };
    const onMove = (e) => {
      if (!s.isDown) return;
      const dx = e.clientX - s.startX;
      s.target = s.startScroll - dx * scrollSpeed;
      s.v = (s.lastX - e.clientX) * scrollSpeed * 0.6;
      s.lastX = e.clientX;
    };
    const onUp = () => {
      s.isDown = false;
      track.classList.remove("dragging");
    };
    const onWheel = (e) => {
      s.target += (e.deltaY + e.deltaX) * 0.6 * scrollSpeed;
    };

    track.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    track.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      track.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      track.removeEventListener("wheel", onWheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, bend, scrollSpeed, scrollEase]);

  return (
    <div className="cg-viewport">
      <div className="cg-track" ref={trackRef}>
        {items.map((it, i) => (
          <div
            className="cg-card"
            key={i}
            style={{ borderRadius: `${borderRadius * 300}px` }}
          >
            <div className="cg-media">
              {it.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.image} alt={it.text || ""} draggable="false" />
              ) : (
                it.node
              )}
              <div className="cg-badge">{String(i + 1).padStart(2, "0")}</div>
            </div>
            {it.text && (
              <div className="cg-caption" style={{ color: textColor }}>
                <span className="cg-cat">{it.cat}</span>
                <span className="cg-title">{it.text}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="cg-hint">arraste ↔ ou use a rodinha</div>
    </div>
  );
}
