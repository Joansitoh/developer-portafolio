import { useEffect, useRef } from "react";
import { store } from "../lib/store";
import { accentVec, type AccentName } from "../lib/themes";
import { prefersReducedMotion } from "../hooks/useReducedMotion";

/**
 * <AsciiField /> — a WebGL2 fragment shader that turns a domain-warped
 * simplex noise field into monospace glyphs, sampled from a font atlas
 * generated at runtime with the site's own font. The cursor bends the
 * field with a ripple, a few columns rain like a log tail, and the accent
 * colour follows the `theme` command live.
 *
 * Zero dependencies, one draw call per frame, paused off-screen.
 */

const RAMP = " .,:;-~=+<>*/{}[]#%$@";

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uMouseAmt;
uniform vec3 uAccent;
uniform sampler2D uAtlas;
uniform float uCell;
uniform float uGlyphs;
uniform float uScroll;
uniform float uIntensity;
uniform float uRain;
out vec4 outColor;

// Simplex 3D noise — Ian McEwan, Ashima Arts (MIT)
vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main(){
  vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 cell = floor(frag / uCell);
  vec2 local = fract(frag / uCell);
  vec2 center = (cell + 0.5) * uCell;
  vec2 p = center / uRes.y;

  float t = uTime * 0.05;
  float drift = uScroll * 0.00035;

  // domain-warped flow field
  vec2 q = vec2(snoise(vec3(p * 1.3, t)), snoise(vec3(p * 1.3 + 7.31, t)));
  float n = snoise(vec3(p * 2.1 + q * 0.85 + vec2(0.0, drift), t * 1.4));
  n = n * 0.5 + 0.5;
  float v = pow(n, 2.2) * 1.15;

  // cursor ripple
  float d = distance(center, uMouse) / uRes.y;
  float lens = smoothstep(0.22, 0.0, d) * uMouseAmt;
  float ripple = 0.5 + 0.5 * sin(d * 46.0 - uTime * 5.0);
  v += lens * (0.35 + 0.6 * ripple);

  // sparse rain columns, like a tail -f scrolling by
  float h = hash(vec2(cell.x, 3.7));
  float rows = uRes.y / uCell;
  float head = fract(uTime * (0.04 + h * 0.09) + h) * (rows + 30.0);
  float dist = head - cell.y;
  float rain = step(0.955, h) * step(0.0, dist) * exp(-dist * 0.16) * uRain;
  v = max(v, rain * 1.05);

  // occasional glyph shimmer
  float flick = step(0.985, hash(cell + floor(uTime * 6.0)));
  float gi = floor(clamp(v, 0.0, 0.999) * uGlyphs);
  gi = mix(gi, floor(hash(cell + uTime) * uGlyphs), flick * step(0.25, v));

  vec2 uv = vec2((gi + local.x) / uGlyphs, local.y);
  float glyph = texture(uAtlas, uv).a;

  float hot = smoothstep(0.55, 1.05, v) + rain * 0.8 + lens * 0.6;
  vec3 col = mix(vec3(0.30, 0.33, 0.37), uAccent, clamp(hot, 0.0, 1.0));
  float alpha = glyph * (0.10 + 0.9 * clamp(v, 0.0, 1.0)) * uIntensity;
  outColor = vec4(col * alpha, alpha);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

async function buildAtlas() {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = size * RAMP.length;
  c.height = size;
  const ctx = c.getContext("2d")!;
  try {
    await document.fonts.load(`600 ${size * 0.72}px "JetBrains Mono Variable"`);
  } catch {
    /* fall back to whatever mono is available */
  }
  ctx.font = `600 ${size * 0.72}px "JetBrains Mono Variable", ui-monospace, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  [...RAMP].forEach((ch, i) => ctx.fillText(ch, i * size + size / 2, size / 2 + 2));
  return c;
}

interface Props {
  className?: string;
  /** Overall glyph opacity multiplier. */
  intensity?: number;
  /** Cell size in CSS pixels. */
  cell?: number;
  /** 0..1 amount of falling "log" columns. */
  rain?: number;
}

export default function AsciiField({ className = "", intensity = 1, cell = 14, rain = 1 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { alpha: true, antialias: false, powerPreference: "low-power" });
    if (!gl) return; // CSS background shows through instead

    let disposed = false;
    let raf = 0;
    let visible = true;
    const reduced = prefersReducedMotion();
    const cleanups: (() => void)[] = [];

    (async () => {
      const atlas = await buildAtlas();
      if (disposed) return;

      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return;
      const prog = gl.createProgram()!;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "aPos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      const u = (name: string) => gl.getUniformLocation(prog, name);
      const uRes = u("uRes"), uTime = u("uTime"), uMouse = u("uMouse"), uMouseAmt = u("uMouseAmt");
      const uAccent = u("uAccent"), uCell = u("uCell"), uGlyphs = u("uGlyphs"), uScroll = u("uScroll");
      const uIntensity = u("uIntensity"), uRain = u("uRain");
      gl.uniform1i(u("uAtlas"), 0);
      gl.uniform1f(uGlyphs, RAMP.length);
      gl.uniform1f(uIntensity, intensity);
      gl.uniform1f(uRain, rain);

      const setAccent = (name: AccentName) => gl.uniform3fv(uAccent, accentVec(name));
      setAccent(store.get().accent);
      const onAccent = (e: Event) => setAccent((e as CustomEvent<AccentName>).detail);
      window.addEventListener("accentchange", onAccent);
      cleanups.push(() => window.removeEventListener("accentchange", onAccent));

      let dpr = 1;
      const resize = () => {
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = Math.max(1, Math.round(width * dpr));
        canvas.height = Math.max(1, Math.round(height * dpr));
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uCell, Math.round(cell * dpr));
        if (reduced) draw(8);
      };
      const ro = new ResizeObserver(resize);
      ro.observe(canvas);
      cleanups.push(() => ro.disconnect());

      // eased pointer
      const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, amt: 0, target: 0 };
      let idle = 0;
      const onMove = (e: PointerEvent) => {
        idle = 0;
        const r = canvas.getBoundingClientRect();
        mouse.tx = (e.clientX - r.left) * dpr;
        mouse.ty = (e.clientY - r.top) * dpr;
        if (mouse.x < -999) {
          mouse.x = mouse.tx;
          mouse.y = mouse.ty;
        }
        mouse.target = 1;
      };
      const onLeave = () => (mouse.target = 0);
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerleave", onLeave);
      });

      const start = performance.now();
      const draw = (time: number) => {
        mouse.x += (mouse.tx - mouse.x) * 0.12;
        mouse.y += (mouse.ty - mouse.y) * 0.12;
        mouse.amt += (mouse.target - mouse.amt) * 0.05;
        idle += 1;
        if (idle > 90) mouse.target *= 0.985; // ripple settles when the cursor rests
        gl.uniform1f(uTime, time);
        gl.uniform2f(uMouse, mouse.x, mouse.y);
        gl.uniform1f(uMouseAmt, mouse.amt);
        gl.uniform1f(uScroll, window.scrollY);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };

      const loop = () => {
        cancelAnimationFrame(raf);
        const frame = () => {
          if (disposed || !visible || document.hidden) return;
          draw((performance.now() - start) / 1000);
          raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
      };

      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !reduced) loop();
      });
      io.observe(canvas);
      const onVis = () => {
        if (!document.hidden && visible && !reduced) loop();
      };
      document.addEventListener("visibilitychange", onVis);
      cleanups.push(() => {
        io.disconnect();
        document.removeEventListener("visibilitychange", onVis);
      });

      resize();
      if (reduced) draw(8);
      else loop();

      cleanups.push(() => {
        gl.deleteProgram(prog);
        gl.deleteTexture(tex);
        gl.deleteBuffer(buf);
      });
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanups.forEach((fn) => fn());
    };
  }, [cell, intensity, rain]);

  return <canvas ref={ref} aria-hidden="true" className={`block h-full w-full ${className}`} />;
}
