"use client";
// BorderGlow — animated conic glowing border wrapper.
import "./BorderGlow.css";

export default function BorderGlow({
  children,
  className = "",
  radius = 18,
  speed = 6,
  colors = ["var(--gold)", "var(--magenta)"],
}) {
  const style = {
    "--bg-radius": `${radius}px`,
    "--bg-speed": `${speed}s`,
    "--bg-c1": colors[0],
    "--bg-c2": colors[1],
  };
  return (
    <div className={`border-glow ${className}`} style={style}>
      <div className="border-glow-inner">{children}</div>
    </div>
  );
}
