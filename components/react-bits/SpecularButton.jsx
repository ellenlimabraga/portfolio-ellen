"use client";
// SpecularButton — a button with a specular highlight that tracks the cursor.
import { useRef } from "react";
import "./SpecularButton.css";

export default function SpecularButton({
  children,
  as = "button",
  variant = "solid", // "solid" | "ghost"
  className = "",
  ...props
}) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  const Cmp = as;
  return (
    <Cmp
      ref={ref}
      onPointerMove={onMove}
      className={`spec-btn ${variant === "ghost" ? "spec-ghost" : ""} ${className}`}
      {...props}
    >
      <span className="spec-label">{children}</span>
    </Cmp>
  );
}
