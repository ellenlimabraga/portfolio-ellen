"use client";
// Adapted from Magic UI — dia-text-reveal. Scroll-linked word reveal (owned source).
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function DiaTextReveal({ text = "", className = "", gradient = false, style = {} }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.35"],
  });
  const words = text.split(" ");

  return (
    <p
      ref={ref}
      className={className}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.28em",
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        letterSpacing: "-0.02em",
        lineHeight: 1.1,
        fontSize: "clamp(2rem,5vw,3.4rem)",
        ...style,
      }}
    >
      {words.map((w, i) => {
        const start = i / words.length;
        const end = Math.min(1, start + 1 / words.length);
        return <Word key={i} progress={scrollYProgress} range={[start, end]} text={w} gradient={gradient} />;
      })}
    </p>
  );
}

function Word({ progress, range, text, gradient }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const blur = useTransform(progress, range, [8, 0]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);
  const y = useTransform(progress, range, [10, 0]);
  const gradStyle = gradient
    ? {
        background: "var(--aurora)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }
    : {};
  return (
    <motion.span style={{ opacity, filter, y, display: "inline-block", ...gradStyle }}>
      {text}
    </motion.span>
  );
}
