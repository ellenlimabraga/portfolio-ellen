"use client";
// Adapted from React Bits — Galaxy (JS/CSS). Owned source in-project.
import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";
import "./Galaxy.css";

const VERT = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uDensity;
uniform float uGlow;
uniform float uHueShift;
uniform float uTwinkle;
uniform float uRotation;
uniform float uSaturation;
uniform float uMouseInteraction;
out vec4 fragColor;

float hash21(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
vec3 hsv2rgb(vec3 c){
  vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float layer(vec2 uv, float sc, float seed){
  uv *= sc;
  vec2 id = floor(uv);
  vec2 gv = fract(uv) - 0.5;
  float col = 0.0;
  for (int y = -1; y <= 1; y++){
    for (int x = -1; x <= 1; x++){
      vec2 off = vec2(float(x), float(y));
      float h = hash21(id + off + seed);
      if (h < 0.965) continue;
      vec2 pos = off + vec2(hash21(id+off+seed+1.3), hash21(id+off+seed+2.7)) - 0.5 - gv;
      float d = length(pos);
      float tw = 0.6 + 0.4 * sin(uTime * (1.0 + h * 3.0) * uTwinkle + h * 40.0);
      col += smoothstep(0.06, 0.0, d) * tw * (0.6 + h);
    }
  }
  return col;
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  float a = uTime * uRotation * 0.05;
  uv = mat2(cos(a), -sin(a), sin(a), cos(a)) * uv;

  vec3 col = vec3(0.0);
  float d = uDensity;
  for (float i = 0.0; i < 3.0; i++){
    float depth = fract(i * 0.37);
    float sc = mix(6.0, 20.0, i / 3.0) * d;
    float b = layer(uv + vec2(uTime * 0.005 * (i + 1.0), 0.0), sc, i * 11.7);
    float hue = fract(uHueShift / 360.0 + i * 0.12 + 0.02);
    col += hsv2rgb(vec3(hue, uSaturation, 1.0)) * b * uGlow;
  }

  vec2 m = (uMouse - 0.5 * uResolution) / uResolution.y;
  float md = length(uv - m);
  col += hsv2rgb(vec3(fract(uHueShift / 360.0 + 0.55), uSaturation, 1.0))
         * smoothstep(0.55, 0.0, md) * 0.12 * uMouseInteraction;

  fragColor = vec4(col, 1.0);
}`;

export default function Galaxy({
  density = 1.0,
  glowIntensity = 0.5,
  hueShift = 20,
  twinkleIntensity = 1.0,
  rotationSpeed = 0.6,
  saturation = 0.7,
  mouseInteraction = 1.0,
  className = "",
}) {
  const ctnRef = useRef(null);
  const mouse = useRef([0, 0]);

  useEffect(() => {
    const ctn = ctnRef.current;
    if (!ctn) return;

    const renderer = new Renderer({ alpha: true, antialias: true });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) delete geometry.attributes.uv;

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [1, 1] },
        uMouse: { value: [0, 0] },
        uDensity: { value: density },
        uGlow: { value: glowIntensity },
        uHueShift: { value: hueShift },
        uTwinkle: { value: twinkleIntensity },
        uRotation: { value: rotationSpeed },
        uSaturation: { value: saturation },
        uMouseInteraction: { value: mouseInteraction },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const w = ctn.offsetWidth, h = ctn.offsetHeight;
      renderer.setSize(w, h);
      program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height];
    };
    window.addEventListener("resize", resize);

    const onMove = (e) => {
      const r = ctn.getBoundingClientRect();
      mouse.current = [(e.clientX - r.left) * (gl.canvas.width / r.width), (r.height - (e.clientY - r.top)) * (gl.canvas.height / r.height)];
    };
    window.addEventListener("pointermove", onMove);

    ctn.appendChild(gl.canvas);
    resize();

    let raf = 0;
    const update = (t) => {
      raf = requestAnimationFrame(update);
      program.uniforms.uTime.value = t * 0.001;
      program.uniforms.uMouse.value = mouse.current;
      renderer.render({ scene: mesh });
    };
    raf = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      if (gl.canvas.parentNode === ctn) ctn.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={ctnRef} className={`galaxy-container ${className}`} />;
}
