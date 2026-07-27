"use client";
// Adapted from React Bits — BlurText. Owned source in-project.
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

const buildKeyframes = (from, steps) => {
  const keys = new Set([...Object.keys(from), ...steps.flatMap((s) => Object.keys(s))]);
  const out = {};
  keys.forEach((k) => {
    out[k] = [from[k], ...steps.map((s) => s[k])];
  });
  return out;
};

export default function BlurText({
  text = "",
  delay = 120,
  className = "",
  animateBy = "words", // "words" | "letters"
  direction = "top",
  threshold = 0.1,
  rootMargin = "0px",
  stepDuration = 0.35,
  onAnimationComplete,
}) {
  const elements = animateBy === "words" ? text.split(" ") : text.split("");
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin]);

  const defaultFrom = useMemo(
    () =>
      direction === "top"
        ? { filter: "blur(10px)", opacity: 0, y: -50 }
        : { filter: "blur(10px)", opacity: 0, y: 50 },
    [direction]
  );

  const defaultTo = useMemo(
    () => [
      { filter: "blur(5px)", opacity: 0.5, y: direction === "top" ? 5 : -5 },
      { filter: "blur(0px)", opacity: 1, y: 0 },
    ],
    [direction]
  );

  return (
    <p ref={ref} className={className} style={{ display: "flex", flexWrap: "wrap" }}>
      {elements.map((seg, i) => {
        const anim = buildKeyframes(defaultFrom, defaultTo);
        return (
          <motion.span
            key={i}
            initial={defaultFrom}
            animate={inView ? anim : defaultFrom}
            transition={{
              duration: stepDuration * 2,
              delay: (i * delay) / 1000,
              ease: "easeOut",
            }}
            onAnimationComplete={i === elements.length - 1 ? onAnimationComplete : undefined}
            style={{ display: "inline-block", willChange: "transform, filter, opacity" }}
          >
            {seg === " " ? " " : seg}
            {animateBy === "words" && i < elements.length - 1 && " "}
          </motion.span>
        );
      })}
    </p>
  );
}
