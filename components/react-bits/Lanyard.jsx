"use client";
// Inspired by React Bits — Lanyard. Lightweight spring-physics badge
// (the original uses three.js + rapier; this keeps the interaction dep-light).
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import "./Lanyard.css";

export default function Lanyard({
  name = "ELLEN BRAGA",
  role = "Creative Director",
  tag = "IA · GEN",
  className = "",
}) {
  const areaRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 120, damping: 12, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 160, damping: 14, mass: 0.6 });
  const rot = useTransform(sx, [-160, 160], [-18, 18]);
  const cordSkew = useTransform(sx, [-160, 160], [16, -16]);

  return (
    <div className={`lanyard ${className}`} ref={areaRef}>
      <div className="lanyard-anchor" />
      <motion.div className="lanyard-cord" style={{ skewX: cordSkew }} />
      <motion.div
        className="lanyard-card"
        drag
        dragConstraints={areaRef}
        dragElastic={0.35}
        onDragEnd={() => {
          x.set(0);
          y.set(0);
        }}
        style={{ x: sx, y: sy, rotate: rot }}
        onDrag={(e, info) => {
          x.set(info.offset.x);
          y.set(info.offset.y);
        }}
        whileTap={{ cursor: "grabbing" }}
      >
        <div className="lanyard-hole" />
        <div className="lanyard-tag">{tag}</div>
        <div className="lanyard-avatar">EB</div>
        <div className="lanyard-name">{name}</div>
        <div className="lanyard-role">{role}</div>
        <div className="lanyard-barcode" />
      </motion.div>
    </div>
  );
}
