"use client";
// Adapted from React Bits — LightRays / SideRays (JS/CSS). Owned source in-project.
import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";
import "./LightRays.css";

const VERT = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor;
uniform float uSpread;
uniform float uSpeed;
uniform vec2 uOrigin;
out vec4 fragColor;

float noise(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }

void main(){
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 dir = uv - uOrigin;
  float ang = atan(dir.y, dir.x);
  float dist = length(dir);

  float rays = 0.0;
  for (float i = 1.0; i <= 5.0; i++){
    float phase = uTime * uSpeed * (0.2 + i * 0.05);
    float band = sin(ang * (6.0 * uSpread) + phase + i) * 0.5 + 0.5;
    band = pow(band, 6.0);
    rays += band / i;
  }
  float falloff = smoothstep(1.2, 0.0, dist);
  float intensity = rays * falloff * 0.6;
  intensity *= 0.85 + 0.15 * noise(uv * 3.0 + uTime);

  fragColor = vec4(uColor * intensity, intensity);
}`;

function hexToRGB(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export default function LightRays({
  raysColor = "#ff9838",
  raysSpeed = 1.0,
  raysSpread = 1.0,
  raysOrigin = "top-center", // top-center | left | right
  className = "",
}) {
  const ctnRef = useRef(null);

  useEffect(() => {
    const ctn = ctnRef.current;
    if (!ctn) return;

    const renderer = new Renderer({ alpha: true, antialias: true });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const origins = {
      "top-center": [0.5, 1.0],
      left: [0.0, 0.7],
      right: [1.0, 0.7],
    };

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) delete geometry.attributes.uv;
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [1, 1] },
        uColor: { value: hexToRGB(raysColor) },
        uSpread: { value: raysSpread },
        uSpeed: { value: raysSpeed },
        uOrigin: { value: origins[raysOrigin] || origins["top-center"] },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      renderer.setSize(ctn.offsetWidth, ctn.offsetHeight);
      program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height];
    };
    window.addEventListener("resize", resize);
    ctn.appendChild(gl.canvas);
    resize();

    let raf = 0;
    const update = (t) => {
      raf = requestAnimationFrame(update);
      program.uniforms.uTime.value = t * 0.001;
      renderer.render({ scene: mesh });
    };
    raf = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      if (gl.canvas.parentNode === ctn) ctn.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={ctnRef} className={`lightrays-container ${className}`} />;
}
