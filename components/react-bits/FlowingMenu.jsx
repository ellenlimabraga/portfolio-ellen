"use client";
// Adapted from React Bits — FlowingMenu. Owned source in-project.
import { useRef } from "react";
import { gsapLikeFlow } from "./flow-helpers";
import "./FlowingMenu.css";

function MenuItem({ link, text, marquee }) {
  const itemRef = useRef(null);
  const marqueeRef = useRef(null);
  const marqueeInnerRef = useRef(null);

  const findEdge = (ev) => {
    const rect = itemRef.current.getBoundingClientRect();
    const y = ev.clientY - rect.top;
    return y < rect.height / 2 ? "top" : "bottom";
  };

  const onEnter = (ev) => {
    const edge = findEdge(ev);
    gsapLikeFlow(marqueeRef.current, marqueeInnerRef.current, edge, "in");
  };
  const onLeave = (ev) => {
    const edge = findEdge(ev);
    gsapLikeFlow(marqueeRef.current, marqueeInnerRef.current, edge, "out");
  };

  const repeated = Array.from({ length: 4 }).map((_, idx) => (
    <span key={idx} className="fm-mq-text">
      {marquee || text}
      <span className="fm-mq-star">✳</span>
    </span>
  ));

  return (
    <div className="fm-item" ref={itemRef}>
      <a
        className="fm-link"
        href={link}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        {text}
      </a>
      <div className="fm-marquee" ref={marqueeRef}>
        <div className="fm-marquee-inner" ref={marqueeInnerRef}>
          <div className="fm-marquee-track">
            {repeated}
            {repeated}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FlowingMenu({ items = [] }) {
  return (
    <div className="fm-wrap">
      {items.map((it, i) => (
        <MenuItem key={i} {...it} />
      ))}
    </div>
  );
}
