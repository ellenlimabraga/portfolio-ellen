// Web Animations API helper that reproduces the FlowingMenu enter/leave motion
// (the React Bits original uses GSAP; this keeps the same easing/behavior dep-free).
const EASE = "cubic-bezier(0.76, 0, 0.24, 1)";
const DUR = 600;

export function gsapLikeFlow(marquee, inner, edge, mode) {
  if (!marquee || !inner) return;
  const fromTop = edge === "top";
  if (mode === "in") {
    marquee.style.transform = fromTop ? "translateY(-101%)" : "translateY(101%)";
    inner.style.transform = fromTop ? "translateY(101%)" : "translateY(-101%)";
    // force reflow so the starting transform applies
    void marquee.offsetHeight;
    marquee.animate(
      [{ transform: marquee.style.transform }, { transform: "translateY(0%)" }],
      { duration: DUR, easing: EASE, fill: "forwards" }
    );
    inner.animate(
      [{ transform: inner.style.transform }, { transform: "translateY(0%)" }],
      { duration: DUR, easing: EASE, fill: "forwards" }
    );
    marquee.style.transform = "translateY(0%)";
    inner.style.transform = "translateY(0%)";
  } else {
    const mTo = fromTop ? "translateY(-101%)" : "translateY(101%)";
    const iTo = fromTop ? "translateY(101%)" : "translateY(-101%)";
    marquee.animate(
      [{ transform: "translateY(0%)" }, { transform: mTo }],
      { duration: DUR, easing: EASE, fill: "forwards" }
    );
    inner.animate(
      [{ transform: "translateY(0%)" }, { transform: iTo }],
      { duration: DUR, easing: EASE, fill: "forwards" }
    );
    marquee.style.transform = mTo;
    inner.style.transform = iTo;
  }
}
