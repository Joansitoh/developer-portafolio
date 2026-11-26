import { useEffect, useRef } from "react";
import { store } from "../lib/store";
import { accentVec, type AccentName } from "../lib/themes";
import { prefersReducedMotion } from "../hooks/useReducedMotion";

/**
 * <AsciiField /> — a WebGL2 shader that turns a domain-warped simplex noise
 * field into monospace glyphs, sampled from a font atlas generated at runtime
 * with the site's own font. The cursor bends the field with a ripple, a few
 * columns rain like a log tail, and the accent colour follows `theme` live.
 *
 * Performance notes:
 *  - Two passes. The expensive noise runs once per *character cell* into a
 *    tiny texture (~100×60), then a trivial per-pixel pass stamps the glyphs.
 *    That's ~200× fewer noise evaluations than doing it per pixel.
 *  - It only boots once it's near the viewport (and after the intro), pauses
 *    off screen / in hidden tabs, and adapts: sustained slow frames lower the
 *    resolution, then cap it at 30 fps. "Lite" mode starts there.
 */

const RAMP = " .,:;-~=+<>*/{}[]#%$@";

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

/** Pass 1: one fragment per cell → r = value, g = heat, b = glyph index. */
const FIELD = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform vec2 uGrid;
uniform float uCell;
uniform float uTime;
uniform vec2 uMouse;
uniform float uMouseAmt;
uniform float uScroll;
uniform float uGlyphs;
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
  // cell coordinates with row 0 at the top of the screen
  vec2 cell = vec2(floor(gl_FragCoord.x), uGrid.y - 1.0 - floor(gl_FragCoord.y));
  vec2 center = (cell + 0.5) * uCell;
  vec2 p = center / uRes.y;

  float t = uTime * 0.05;
  float drift = uScroll * 0.00035;

  vec2 q = vec2(snoise(vec3(p * 1.3, t)), snoise(vec3(p * 1.3 + 7.31, t)));
  float n = snoise(vec3(p * 2.1 + q * 0.85 + vec2(0.0, drift), t * 1.4));
  n = n * 0.5 + 0.5;
  float v = pow(n, 2.2) * 1.15;

  float d = distance(center, uMouse) / uRes.y;
  float lens = smoothstep(0.22, 0.0, d) * uMouseAmt;
  float ripple = 0.5 + 0.5 * sin(d * 46.0 - uTime * 5.0);
  v += lens * (0.35 + 0.6 * ripple);

  float h = hash(vec2(cell.x, 3.7));
  float head = fract(uTime * (0.04 + h * 0.09) + h) * (uGrid.y + 30.0);
  float dist = head - cell.y;
  float rain = step(0.955, h) * step(0.0, dist) * exp(-dist * 0.16) * uRain;
  v = max(v, rain * 1.05);

  float flick = step(0.985, hash(cell + floor(uTime * 6.0)));
  float gi = floor(clamp(v, 0.0, 0.999) * uGlyphs);
  gi = mix(gi, floor(hash(cell + uTime) * uGlyphs), flick * step(0.25, v));

  float hot = clamp(smoothstep(0.55, 1.05, v) + rain * 0.8 + lens * 0.6, 0.0, 1.0);
  outColor = vec4(clamp(v, 0.0, 1.0), hot, (gi + 0.5) / uGlyphs, 1.0);
}`;

/** Pass 2: per pixel, look the cell up and stamp its glyph. Cheap. */
const DRAW = `#version 300 es
precision mediump float;
uniform vec2 uRes;
uniform vec2 uGrid;
uniform float uCell;
uniform vec3 uAccent;
uniform float uGlyphs;
uniform float uIntensity;
uniform sampler2D uAtlas;
uniform sampler2D uField;
out vec4 outColor;

void main(){
  vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 cell = floor(frag / uCell);
  vec2 local = fract(frag / uCell);
  vec4 f = texelFetch(uField, ivec2(int(cell.x), int(uGrid.y - 1.0 - cell.y)), 0);
  float gi = floor(f.b * uGlyphs);
  float glyph = texture(uAtlas, vec2((gi + local.x) / uGlyphs, local.y)).a;
  vec3 col = mix(vec3(0.30, 0.33, 0.37), uAccent, f.g);
  float alpha = glyph * (0.10 + 0.9 * f.r) * uIntensity;
  outColor = vec4(col * alpha, alpha);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(sh));
    return null;
  }
  return sh;
}

function program(gl: WebGL2RenderingContext, frag: string) {
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return null;
  const p = gl.createProgram()!;
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.bindAttribLocation(p, 0, "aPos");
  gl.linkProgram(p);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
}

async function buildAtlas() {
  const size = 48;
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

const waitFor = (cond: () => boolean) =>
  new Promise<void>((resolve) => {
    if (cond()) return resolve();
    const off = store.subscribe(() => {
      if (cond()) {
        off();
        resolve();
      }
    });
  });

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

    let disposed = false;
    let raf = 0;
    let visible = false;
    let started = false;
    let restartLoop: (() => void) | null = null;
    const reduced = prefersReducedMotion();
    const cleanups: (() => void)[] = [];

    const start = async () => {
      started = true;
      // let the boot log and the hero intro have the main thread first
      await waitFor(() => store.get().booted);
      await new Promise((r) => setTimeout(r, 350));
      const atlasCanvas = await buildAtlas();
      if (disposed) return;

      const gl = canvas.getContext("webgl2", { alpha: true, antialias: false, depth: false, powerPreference: "low-power" });
      if (!gl) return;
      const fieldProg = program(gl, FIELD);
      const drawProg = program(gl, DRAW);
      if (!fieldProg || !drawProg) return;

      // fullscreen triangle
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

      const texture = (filter: number) => {
        const t = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return t;
      };
      const atlas = texture(gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasCanvas);
      const field = texture(gl.NEAREST);
      const fbo = gl.createFramebuffer();

      const U = (p: WebGLProgram) => (name: string) => gl.getUniformLocation(p, name);
      const uf = U(fieldProg);
      const ud = U(drawProg);
      const F = {
        res: uf("uRes"), grid: uf("uGrid"), cell: uf("uCell"), time: uf("uTime"), mouse: uf("uMouse"),
        mouseAmt: uf("uMouseAmt"), scroll: uf("uScroll"), glyphs: uf("uGlyphs"), rain: uf("uRain"),
      };
      const D = {
        res: ud("uRes"), grid: ud("uGrid"), cell: ud("uCell"), accent: ud("uAccent"), glyphs: ud("uGlyphs"),
        intensity: ud("uIntensity"), atlas: ud("uAtlas"), field: ud("uField"),
      };
      gl.useProgram(fieldProg);
      gl.uniform1f(F.glyphs, RAMP.length);
      gl.uniform1f(F.rain, rain);
      gl.useProgram(drawProg);
      gl.uniform1f(D.glyphs, RAMP.length);
      gl.uniform1f(D.intensity, intensity);
      gl.uniform1i(D.atlas, 0);
      gl.uniform1i(D.field, 1);

      // quality: resolution scale + frame cap, adapted at runtime
      let scale = store.get().lite ? 0.75 : Math.min(window.devicePixelRatio || 1, 1.5);
      let frameMs = store.get().lite ? 1000 / 30 : 0;
      let grid = [1, 1];

      // eased pointer
      const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, amt: 0, target: 0 };
      let idle = 0;

      const draw = (time: number) => {
        mouse.x += (mouse.tx - mouse.x) * 0.12;
        mouse.y += (mouse.ty - mouse.y) * 0.12;
        mouse.amt += (mouse.target - mouse.amt) * 0.05;
        if (++idle > 90) mouse.target *= 0.985;

        // pass 1 → field texture (one fragment per cell)
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.viewport(0, 0, grid[0], grid[1]);
        gl.useProgram(fieldProg);
        gl.uniform1f(F.time, time);
        gl.uniform2f(F.mouse, mouse.x, mouse.y);
        gl.uniform1f(F.mouseAmt, mouse.amt);
        gl.uniform1f(F.scroll, window.scrollY);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        // pass 2 → screen
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.useProgram(drawProg);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, atlas);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, field);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };

      const resize = () => {
        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        const cellPx = Math.max(6, Math.round(cell * scale));
        grid = [Math.ceil(canvas.width / cellPx), Math.ceil(canvas.height / cellPx)];
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, field);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, grid[0], grid[1], 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, field, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        for (const [p, u] of [[fieldProg, F], [drawProg, D]] as const) {
          gl.useProgram(p);
          gl.uniform2f(u.res, canvas.width, canvas.height);
          gl.uniform2f(u.grid, grid[0], grid[1]);
          gl.uniform1f(u.cell, cellPx);
        }
        if (reduced || !raf) draw(8);
      };

      const onMove = (e: PointerEvent) => {
        idle = 0;
        const r = canvas.getBoundingClientRect();
        mouse.tx = (e.clientX - r.left) * scale;
        mouse.ty = (e.clientY - r.top) * scale;
        if (mouse.x < -999) {
          mouse.x = mouse.tx;
          mouse.y = mouse.ty;
        }
        mouse.target = 1;
      };
      const onLeave = () => (mouse.target = 0);
      if (!reduced) {
        window.addEventListener("pointermove", onMove, { passive: true });
        document.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          window.removeEventListener("pointermove", onMove);
          document.removeEventListener("pointerleave", onLeave);
        });
      }

      const setAccent = (name: AccentName) => {
        gl.useProgram(drawProg);
        gl.uniform3fv(D.accent, accentVec(name));
        if (reduced || !raf) draw(8);
      };
      const onAccent = (e: Event) => setAccent((e as CustomEvent<AccentName>).detail);
      window.addEventListener("accentchange", onAccent);
      cleanups.push(() => window.removeEventListener("accentchange", onAccent));

      const t0 = performance.now();
      let last = 0;
      let slow = 0;
      let samples = 0;
      const frame = (now: number) => {
        raf = 0;
        if (disposed || !visible || document.hidden) return;
        raf = requestAnimationFrame(frame);
        const dt = now - last;
        if (last && dt < frameMs - 1) return; // frame cap
        // adapt: sustained slow frames → lower resolution, then cap at 30 fps
        if (last && dt < 250) {
          samples++;
          if (dt > 24) slow++;
          if (samples >= 90) {
            if (slow > 45) {
              if (scale > 0.6) {
                scale = Math.max(0.5, scale * 0.7);
                resize();
              } else frameMs = 1000 / 30;
            }
            samples = slow = 0;
          }
        }
        last = now;
        draw((now - t0) / 1000);
      };
      const loop = () => {
        if (!raf && !reduced && !disposed) {
          last = 0;
          raf = requestAnimationFrame(frame);
        }
      };

      cleanups.push(
        store.subscribe(() => {
          if (store.get().lite && scale > 0.75) {
            scale = 0.75;
            frameMs = 1000 / 30;
            resize();
          }
        }),
      );

      const ro = new ResizeObserver(resize);
      ro.observe(canvas);
      const onVis = () => {
        if (!document.hidden && visible) loop();
      };
      document.addEventListener("visibilitychange", onVis);
      cleanups.push(() => {
        ro.disconnect();
        document.removeEventListener("visibilitychange", onVis);
      });

      setAccent(store.get().accent);
      resize();
      canvas.style.opacity = "1";
      if (!reduced && visible) loop();
      restartLoop = loop;

      cleanups.push(() => {
        gl.deleteProgram(fieldProg);
        gl.deleteProgram(drawProg);
        gl.deleteTexture(atlas);
        gl.deleteTexture(field);
        gl.deleteFramebuffer(fbo);
        gl.deleteBuffer(buf);
        gl.deleteVertexArray(vao);
      });
    };

    // nothing happens until the canvas is actually near the viewport
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !started) start();
        else if (visible) restartLoop?.();
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(canvas);

    return () => {
      disposed = true;
      io.disconnect();
      cancelAnimationFrame(raf);
      cleanups.forEach((fn) => fn());
    };
  }, [cell, intensity, rain]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`block h-full w-full opacity-0 transition-opacity duration-[1500ms] ${className}`}
    />
  );
}
