"use client";
// Adapted from Aceternity — dither-shader (duotone). ogl ordered-dither duotone (owned source).
import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

const VERT = `#version 300 es
in vec2 position;
void main(){ gl_Position = vec4(position, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uScale;
out vec4 fragColor;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));
  vec2 u=f*f*(3.-2.*f);
  return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;
}
float fbm(vec2 p){
  float v=0.0, a=0.5;
  for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.0; a*=0.5; }
  return v;
}

// 4x4 Bayer ordered dithering
float bayer(vec2 pos){
  int x=int(mod(pos.x,4.0));
  int y=int(mod(pos.y,4.0));
  int idx=x+y*4;
  float m[16];
  m[0]=0.;m[1]=8.;m[2]=2.;m[3]=10.;
  m[4]=12.;m[5]=4.;m[6]=14.;m[7]=6.;
  m[8]=3.;m[9]=11.;m[10]=1.;m[11]=9.;
  m[12]=15.;m[13]=7.;m[14]=13.;m[15]=5.;
  float v=0.0;
  for(int i=0;i<16;i++){ if(i==idx) v=m[i]; }
  return v/16.0;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = uv * uScale;
  p.x *= uResolution.x / uResolution.y;
  float n = fbm(p + vec2(uTime*0.05, uTime*0.03));
  n += 0.35 * fbm(p*2.0 - uTime*0.02);
  n = clamp(n, 0.0, 1.0);

  float threshold = bayer(gl_FragCoord.xy);
  float bw = step(threshold, n);

  vec3 col = mix(uColorA, uColorB, bw);
  // subtle vignette
  float vig = smoothstep(1.2, 0.2, length(uv-0.5));
  col *= 0.35 + 0.65*vig;
  fragColor = vec4(col, 1.0);
}`;

function hexToRGB(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export default function DitherDuotone({
  colorA = "#0a0605",
  colorB = "#ff2d78",
  scale = 4,
  className = "",
}) {
  const ctnRef = useRef(null);
  useEffect(() => {
    const ctn = ctnRef.current;
    if (!ctn) return;
    const renderer = new Renderer({ antialias: false });
    const gl = renderer.gl;
    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) delete geometry.attributes.uv;
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [1, 1] },
        uColorA: { value: hexToRGB(colorA) },
        uColorB: { value: hexToRGB(colorB) },
        uScale: { value: scale },
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
  return <div ref={ctnRef} className={className} style={{ width: "100%", height: "100%" }} />;
}
