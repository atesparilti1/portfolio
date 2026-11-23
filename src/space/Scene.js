// The space scene behind the page: a starfield, planets, a figure on a glowing
// floor, and an open ring of screens around it. The camera follows the page
// scroll through keyframes pinned to the DOM chapters that carry `data-cam`, so
// copy and camera stay in step at any layout or viewport size. At the end the
// screens peel off into rings that form a tunnel below the floor.
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { DRAWN, FILLERS } from "./screens";

const TAU = Math.PI * 2;
const R = 14; // ring radius
const COLS = 12;
const ROWS = [4.6, 0, -4.6];
const SW = 6.4; // screen size, 16:10
const SH = 4;
let SLOTS = []; // columns of the project screens in the middle row, spread evenly
const FLOOR_Y = -7.8;
const TUNNEL = [-17, -30, -43]; // ring depths below the floor, one per row
const ACCENT = new THREE.Color("#3b82f6");
const SUN_DIR = new THREE.Vector3(-0.55, 0.42, -0.72).normalize();

const slotAngle = (k) => TAU + (k * TAU) / COLS;
const smoother = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const clamp01 = (t) => Math.min(1, Math.max(0, t));
const lerp = (a, b, t) => a + (b - a) * t;
const cyl = ({ r, a, y }, out = new THREE.Vector3()) => out.set(r * Math.sin(a), y, r * Math.cos(a));

// Shared GLSL: value noise and fbm.
const NOISE = /* glsl */ `
  float hash(vec3 p){ p = fract(p*0.3183099+.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
  float noise(vec3 x){
    vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);
    return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
               mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
  }
  float fbm(vec3 p){ float a=0.5, s=0.0; for(int i=0;i<5;i++){ s+=a*noise(p); p*=2.03; a*=0.5; } return s; }
`;
const OUT = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`;

export default class Scene {
  constructor(canvas, { projects, onChapter, onOpen, onReady, reduce }) {
    this.canvas = canvas;
    this.projects = projects;
    SLOTS = projects.slice(0, COLS).map((_, i) => Math.floor((i * COLS) / Math.min(projects.length, COLS)));
    this.onChapter = onChapter;
    this.onOpen = onOpen;
    this.reduce = reduce;
    this.clock = new THREE.Clock();
    this.mouse = new THREE.Vector2(0, 0);
    this.mouseS = new THREE.Vector2(0, 0);
    this.focusIndex = -1;
    this.focusAmt = 0;
    this.focusTarget = 0;
    this.hovered = -1;
    this.chapter = undefined;
    this.chapters = [];
    this.keyframes = [];
    this.pose = null;
    this.yaw = 0;
    this.yawVel = 0;
    this.drag = null;
    this.small = Math.min(innerWidth, innerHeight) < 700 || (navigator.hardwareConcurrency ?? 8) <= 4;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !this.small, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, this.small ? 1.25 : 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    this.renderer = renderer;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 6000);

    this.buildSky();
    this.buildStars();
    this.buildPlanets();
    this.buildRing();
    this.buildFloor();
    this.buildFigure();
    this.buildDust();

    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    // Bloom at half resolution, and not at all on small or slow devices.
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.55, 0.5, 0.86);
    this.bloom.enabled = !this.small;
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    for (const fn of ["resize", "frame", "pointerMove", "pointerDown", "pointerUp", "click"]) this[fn] = this[fn].bind(this);
    addEventListener("resize", this.resize);
    addEventListener("pointermove", this.pointerMove, { passive: true });
    addEventListener("pointerup", this.pointerUp);
    addEventListener("pointercancel", this.pointerUp);
    canvas.addEventListener("pointerdown", this.pointerDown);
    canvas.addEventListener("click", this.click);
    this.ro = new ResizeObserver(() => this.layout());
    this.ro.observe(document.body);
    this.resize();
    this.raf = requestAnimationFrame(this.frame);
    // First frame is on screen; let the page lift its loading veil.
    requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
  }

  // ---------- world ----------

  buildSky() {
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: { time: { value: 0 } },
      vertexShader: `varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `${NOISE}
        varying vec3 vDir; uniform float time;
        void main(){
          vec3 d = normalize(vDir);
          float n = fbm(d*2.1 + vec3(0.0, 0.0, time*0.004));
          float m = fbm(d*4.3 + 7.0);
          vec3 col = vec3(0.005, 0.007, 0.014);
          col += vec3(0.03, 0.07, 0.17) * smoothstep(0.48, 0.92, n);
          col += vec3(0.32, 0.03, 0.05) * pow(smoothstep(0.55, 0.95, m * n * 1.6), 2.0) * 0.55;
          col += vec3(0.75, 0.85, 1.0) * pow(max(dot(d, normalize(vec3(-0.55,0.42,-0.72))), 0.0), 80.0) * 0.4;
          gl_FragColor = vec4(col, 1.0);
          ${OUT}
        }`,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(3000, 48, 24), mat);
    this.scene.add(this.sky);

    // A distant white star with a wide glow, the light on the planets.
    const glow = document.createElement("canvas");
    glow.width = glow.height = 256;
    const g = glow.getContext("2d");
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.07, "rgba(220,232,255,0.9)");
    grd.addColorStop(0.25, "rgba(120,160,255,0.2)");
    grd.addColorStop(1, "rgba(80,120,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    const sun = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glow), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })
    );
    sun.scale.setScalar(800);
    sun.position.copy(SUN_DIR).multiplyScalar(2400);
    this.scene.add(sun);
  }

  buildStars() {
    const n = this.small ? 3500 : 7000;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const size = new Float32Array(n);
    const phase = new Float32Array(n);
    const tints = ["#ffffff", "#cfe0ff", "#ffd9cf", "#a9c4ff"].map((c) => new THREE.Color(c));
    const v = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      v.randomDirection().multiplyScalar(700 + Math.random() * 1600);
      pos.set([v.x, v.y, v.z], i * 3);
      const t = tints[Math.floor(Math.random() * tints.length)];
      const b = 0.5 + Math.random() * 0.5;
      col.set([t.r * b, t.g * b, t.b * b], i * 3);
      size[i] = Math.random() < 0.04 ? 3.2 + Math.random() * 2 : 1 + Math.random() * 1.6;
      phase[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(size, 1));
    geo.setAttribute("phase", new THREE.BufferAttribute(phase, 1));
    this.starMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { time: { value: 0 }, dpr: { value: 1 } },
      vertexShader: `
        attribute float size; attribute vec3 color; attribute float phase;
        uniform float time, dpr; varying vec3 vC; varying float vT;
        void main(){
          vec4 mv = modelViewMatrix*vec4(position,1.0);
          gl_Position = projectionMatrix*mv;
          vT = 0.6 + 0.4*sin(time*(0.5+phase*1.8) + phase*60.0);
          gl_PointSize = size*dpr*(0.8+0.2*vT);
          vC = color;
        }`,
      fragmentShader: `
        varying vec3 vC; varying float vT;
        void main(){
          float d = length(gl_PointCoord-0.5);
          float a = smoothstep(0.5, 0.0, d); a *= a;
          gl_FragColor = vec4(vC*1.6, a*vT);
        }`,
    });
    this.stars = new THREE.Points(geo, this.starMat);
    this.scene.add(this.stars);
  }

  planetMaterial(c1, c2, c3, atm, bands, turb) {
    return new THREE.ShaderMaterial({
      uniforms: {
        c1: { value: new THREE.Color(c1) },
        c2: { value: new THREE.Color(c2) },
        c3: { value: new THREE.Color(c3) },
        atm: { value: new THREE.Color(atm) },
        bands: { value: bands },
        turb: { value: turb },
        lightV: { value: new THREE.Vector3() },
        time: { value: 0 },
      },
      vertexShader: `
        varying vec3 vN; varying vec3 vP; varying vec3 vV;
        void main(){
          vP = position; vN = normalize(normalMatrix*normal);
          vec4 mv = modelViewMatrix*vec4(position,1.0); vV = normalize(-mv.xyz);
          gl_Position = projectionMatrix*mv;
        }`,
      fragmentShader: `${NOISE}
        uniform vec3 c1, c2, c3, atm, lightV; uniform float bands, turb, time;
        varying vec3 vN; varying vec3 vP; varying vec3 vV;
        void main(){
          vec3 p = normalize(vP);
          float n = fbm(p*3.2 + vec3(time*0.006, 0.0, 0.0));
          float b = sin(p.y*bands + n*turb);
          vec3 base = mix(c1, c2, smoothstep(-1.0, 1.0, b));
          base = mix(base, c3, smoothstep(0.55, 0.85, fbm(p*7.0 + 3.0)));
          float l = dot(normalize(vN), lightV);
          float diff = smoothstep(-0.2, 0.7, l);
          float fres = pow(1.0 - max(dot(normalize(vN), vV), 0.0), 2.6);
          vec3 col = base*diff*1.15 + atm*fres*(0.08 + smoothstep(-0.4, 0.6, l)*1.1);
          gl_FragColor = vec4(col, 1.0);
          ${OUT}
        }`,
    });
  }

  buildPlanets() {
    this.planets = [];
    const seg = this.small ? 48 : 96;
    const add = (radius, position, mat, spin) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(radius, seg, seg / 1.5), mat);
      m.position.set(...position);
      m.userData.spin = spin;
      this.scene.add(m);
      this.planets.push(m);
      return m;
    };
    // A red banded giant below the ring, seen on the way down.
    add(62, [-150, -165, -130], this.planetMaterial("#3a0f14", "#b0453c", "#e8b4a0", "#ff5a5a", 15, 3.2), 0.008);
    // A ringed ice planet off to the side.
    const ringed = add(26, [170, 40, -210], this.planetMaterial("#14243c", "#5f86b8", "#d6e2f2", "#7fb0ff", 22, 2.0), 0.012);
    const ringMat = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      uniforms: { inner: { value: 34 }, outer: { value: 58 } },
      vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `
        uniform float inner, outer; varying vec3 vP;
        void main(){
          float t = (length(vP.xy) - inner) / (outer - inner);
          float bands = 0.55 + 0.45*sin(t*90.0) * sin(t*23.0 + 1.3);
          float a = smoothstep(0.0, 0.06, t) * smoothstep(1.0, 0.85, t) * bands * 0.75;
          gl_FragColor = vec4(vec3(0.76, 0.82, 0.9)*1.1, a);
          ${OUT}
        }`,
    });
    const ring = new THREE.Mesh(new THREE.RingGeometry(34, 58, 160, 1), ringMat);
    ring.rotation.set(-1.15, 0.25, 0.3);
    ringed.add(ring);
    // Above the ring, for the view from underneath.
    add(44, [-90, 250, -260], this.planetMaterial("#10172e", "#3d5a9c", "#b9cdf5", "#5b8cff", 9, 4.0), 0.005);
    add(9, [70, 130, 110], this.planetMaterial("#2f3136", "#7d828b", "#c4c8cf", "#c8d8ff", 4, 6.0), 0.02);
    add(5, [-60, 10, 95], this.planetMaterial("#3a1418", "#9c3a3a", "#e09a90", "#ff6a6a", 6, 5.0), 0.03);
  }

  buildRing() {
    this.ring = new THREE.Group();
    this.scene.add(this.ring);
    this.screens = [];
    this.projectScreens = [];
    this.shotTargets = [];
    const geo = new THREE.PlaneGeometry(SW, SH);
    let filler = 0;

    const texFrom = (canvas) => {
      const t = new THREE.CanvasTexture(canvas);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      return t;
    };

    ROWS.forEach((y, row) => {
      for (let k = 0; k < COLS; k++) {
        const a = slotAngle(k);
        const pIndex = row === 1 ? SLOTS.indexOf(k) : -1;
        const project = pIndex >= 0 ? this.projects[pIndex] : null;
        const uniforms = {
          map: { value: null },
          uvT: { value: new THREE.Vector4(1, 1, 0, 0) },
          time: { value: 0 },
          power: { value: this.reduce ? 1 : 0 },
          focus: { value: 0.8 },
          flash: { value: 0 },
          seed: { value: Math.random() },
          accent: { value: project ? 1 : 0 },
          accentColor: { value: ACCENT },
        };
        if (project?.shot) {
          uniforms.map.value = texFrom(FILLERS[filler++ % FILLERS.length]());
          this.shotTargets.push({ shot: project.shot, uniforms }); // loaded lazily, see loadShots()
        } else if (project && DRAWN[project.demo]) {
          uniforms.map.value = texFrom(DRAWN[project.demo]());
        } else {
          uniforms.map.value = texFrom(FILLERS[(filler++ + row * 5) % FILLERS.length]());
        }
        const mat = new THREE.ShaderMaterial({
          side: THREE.DoubleSide,
          uniforms,
          defines: { SW: SW.toFixed(2), SH: SH.toFixed(2) },
          vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
          fragmentShader: `
            uniform sampler2D map; uniform vec4 uvT; uniform vec3 accentColor;
            uniform float time, power, focus, flash, seed, accent;
            varying vec2 vUv;
            void main(){
              // Rounded panel: signed distance to the edge, in world units.
              vec2 q = abs(vUv - 0.5) * vec2(SW, SH);
              float rad = 0.24;
              vec2 b = vec2(SW, SH) * 0.5 - rad;
              float sd = length(max(q - b, 0.0)) + min(max(q.x - b.x, q.y - b.y), 0.0) - rad;
              if (sd > 0.0) discard;
              float rim = smoothstep(-0.05, 0.0, sd);
              vec3 acc = accentColor;
              if (!gl_FrontFacing) {
                // Back of the panel: dark metal with a lit seam.
                vec3 col = vec3(0.026, 0.03, 0.04) + vec3(0.016)*step(0.5, fract(vUv.y*14.0));
                col += rim * mix(vec3(0.16), acc*1.6, accent);
                col += acc * 1.8 * step(abs(vUv.y - 0.1), 0.012) * step(0.78, vUv.x) * step(vUv.x, 0.92) * accent;
                gl_FragColor = vec4(col, 1.0);
                ${OUT}
                return;
              }
              vec2 uv = vUv * uvT.xy + uvT.zw;
              vec3 col = texture2D(map, uv).rgb;
              float scan = 0.94 + 0.06*sin(vUv.y*820.0);
              float roll = exp(-pow((fract(vUv.y*0.8 - time*0.06 + seed) - 0.5)*9.0, 2.0)) * 0.05;
              vec2 d = vUv - 0.5;
              float vig = smoothstep(0.9, 0.25, length(d*vec2(1.0, 1.25)));
              col = col*scan*mix(0.55, 1.0, vig) + roll;
              col *= mix(0.2, 1.0, focus) * mix(1.0, 0.82, accent);
              col += rim * mix(vec3(0.3), acc*2.4, accent*clamp(focus, 0.0, 1.0));
              col = mix(col, vec3(0.9, 0.95, 1.0)*1.6, flash);
              gl_FragColor = vec4(col*power, 1.0);
              ${OUT}
            }`,
        });
        const mesh = new THREE.Mesh(geo, mat);
        const home = { r: R, a, y };
        const away = { r: R * 0.82, a: a + row * 0.26, y: TUNNEL[row] };
        mesh.userData = {
          project: pIndex,
          home,
          away,
          delay: row * 0.22 + (k / COLS) * 0.18,
          bootAt: 0.6 + Math.random() * 1.8 + (row === 1 ? 0 : 0.4),
          focus: 0.8,
          scale: 1,
          bob: Math.random() * TAU,
        };
        cyl(home, mesh.position);
        mesh.lookAt(0, y, 0);
        this.ring.add(mesh);
        this.screens.push(mesh);
        if (pIndex >= 0) this.projectScreens[pIndex] = mesh;
      }
    });

    // Hoops at the open top and bottom, and struts between the columns.
    this.frameMats = [];
    const hoopMat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#c4c9d0").multiplyScalar(0.5), transparent: true });
    const glowMat = new THREE.MeshBasicMaterial({ color: ACCENT.clone().multiplyScalar(2.4), toneMapped: false, transparent: true });
    const strutMat = new THREE.MeshBasicMaterial({ color: "#363b44", transparent: true });
    this.frameMats.push(hoopMat, glowMat, strutMat);
    for (const y of [7.3, -7.3]) {
      const hoop = new THREE.Mesh(new THREE.TorusGeometry(R + 0.25, 0.09, 8, 160), hoopMat);
      hoop.rotation.x = Math.PI / 2;
      hoop.position.y = y;
      this.ring.add(hoop);
      const glow = new THREE.Mesh(new THREE.TorusGeometry(R - 0.05, 0.025, 6, 160), glowMat);
      glow.rotation.x = Math.PI / 2;
      glow.position.y = y - Math.sign(y) * 0.35;
      this.ring.add(glow);
    }
    const strutGeo = new THREE.CylinderGeometry(0.05, 0.05, 14.6, 6);
    for (let k = 0; k < COLS; k++) {
      const s = new THREE.Mesh(strutGeo, strutMat);
      cyl({ r: R + 0.1, a: slotAngle(k + 0.5), y: 0 }, s.position);
      this.ring.add(s);
    }
  }

  // Screenshots load after first paint, so the ring appears without waiting.
  loadShots() {
    const loader = new THREE.TextureLoader();
    for (const { shot, uniforms } of this.shotTargets) {
      loader.load(shot.src, (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        const ia = shot.w / shot.h;
        const sa = SW / SH;
        // Cover-fit, keeping the top of tall screenshots.
        if (ia < sa) uniforms.uvT.value.set(1, ia / sa, 0, 1 - ia / sa);
        else uniforms.uvT.value.set(sa / ia, 1, (1 - sa / ia) / 2, 0);
        uniforms.map.value.dispose();
        uniforms.map.value = t;
      });
    }
  }

  buildFloor() {
    this.floorMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: { time: { value: 0 }, radius: { value: R }, accent: { value: ACCENT }, open: { value: 0 } },
      vertexShader: `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `
        uniform float time, radius, open; uniform vec3 accent; varying vec2 vP;
        float gridLine(vec2 p, float s, float w){ vec2 g = abs(fract(p/s - 0.5) - 0.5) * s; vec2 fw = fwidth(p) * w; vec2 l = 1.0 - smoothstep(vec2(0.0), fw, g); return max(l.x, l.y); }
        void main(){
          float r = length(vP);
          float fade = smoothstep(46.0, 8.0, r) * 0.45;
          // The glowing disc the figure stands on, and its soft reflection pool.
          float disc = smoothstep(radius, radius*0.2, r);
          float core = exp(-r*r*0.05);
          float ripple = 0.5 + 0.5*sin(r*2.2 - time*1.4);
          float g = gridLine(vP, 2.0, 1.0) * 0.14 + gridLine(vP, 10.0, 1.4) * 0.28;
          float rings = (1.0 - smoothstep(0.0, fwidth(r)*1.5, abs(fract(r/8.0 - 0.5) - 0.5)*8.0)) * 0.3;
          float hoop = exp(-pow((r - radius)*1.6, 2.0)) * 1.4;
          float pulse = exp(-pow((r - mod(time*7.0, 110.0))*0.6, 2.0)) * 0.45;
          vec3 col = vec3(0.5, 0.58, 0.72) * (g + rings) * fade;
          col += accent * (disc*(0.22 + 0.06*ripple) + core*0.9 + hoop + pulse*fade);
          col *= 1.0 - open*smoothstep(radius*0.9, 0.0, r)*0.85;
          gl_FragColor = vec4(col, 1.0);
          ${OUT}
        }`,
    });
    this.floor = new THREE.Mesh(new THREE.PlaneGeometry(220, 220), this.floorMat);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = FLOOR_Y;
    this.scene.add(this.floor);
  }

  // A lone figure at the centre, lit from the floor, turning to face each project.
  buildFigure() {
    const mat = new THREE.ShaderMaterial({
      uniforms: { accent: { value: ACCENT }, red: { value: new THREE.Color("#ff4d5e") } },
      vertexShader: `
        varying vec3 vN; varying vec3 vV; varying float vH;
        void main(){
          vec4 w = modelMatrix*vec4(position,1.0); vH = w.y;
          vN = normalize(normalMatrix*normal);
          vec4 mv = viewMatrix*w; vV = normalize(-mv.xyz);
          gl_Position = projectionMatrix*mv;
        }`,
      fragmentShader: `
        uniform vec3 accent, red; varying vec3 vN; varying vec3 vV; varying float vH;
        void main(){
          float fres = pow(1.0 - max(dot(normalize(vN), vV), 0.0), 4.0);
          float under = smoothstep(${(FLOOR_Y + 2.6).toFixed(2)}, ${FLOOR_Y.toFixed(2)}, vH);
          vec3 col = vec3(0.006, 0.007, 0.01) + accent*fres*(0.55 + under*1.4) + red*fres*0.12*(1.0-under);
          gl_FragColor = vec4(col, 1.0);
          ${OUT}
        }`,
    });
    const fig = new THREE.Group();
    const part = (geo, x, y, z = 0, rz = 0) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.rotation.z = rz;
      fig.add(m);
      return m;
    };
    const leg = new THREE.CapsuleGeometry(0.15, 0.95, 6, 12);
    part(leg, -0.15, 0.62);
    part(leg, 0.15, 0.62);
    const torso = part(new THREE.CapsuleGeometry(0.25, 0.62, 6, 16), 0, 1.6);
    torso.scale.set(1.12, 1, 0.7);
    const arm = new THREE.CapsuleGeometry(0.075, 0.8, 6, 10);
    part(arm, -0.39, 1.44, 0, 0.06);
    part(arm, 0.39, 1.44, 0, -0.06);
    part(new THREE.CapsuleGeometry(0.09, 0.08, 4, 8), 0, 2.02);
    this.head = part(new THREE.SphereGeometry(0.19, 24, 16), 0, 2.26);
    fig.position.y = FLOOR_Y;
    this.figure = fig;
    this.scene.add(fig);
  }

  buildDust() {
    const n = this.small ? 500 : 1100;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 4 + Math.random() * 70;
      const a = Math.random() * TAU;
      pos.set([r * Math.sin(a), -80 + Math.random() * 180, r * Math.cos(a)], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    this.dustMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { dpr: { value: 1 }, time: { value: 0 } },
      vertexShader: `
        uniform float dpr, time;
        void main(){
          vec3 p = position; p.y += sin(time*0.2 + position.x*0.1)*0.8;
          vec4 mv = modelViewMatrix*vec4(p,1.0);
          gl_Position = projectionMatrix*mv;
          gl_PointSize = clamp(dpr*70.0/-mv.z, 0.0, 6.0);
        }`,
      fragmentShader: `void main(){ float d = length(gl_PointCoord-0.5); gl_FragColor = vec4(vec3(0.8,0.87,1.0), smoothstep(0.5,0.0,d)*0.35); }`,
    });
    this.dust = new THREE.Points(geo, this.dustMat);
    this.scene.add(this.dust);
  }

  // ---------- camera path ----------

  projectPose(i, aspect, near = 1) {
    const tanH = Math.tan(THREE.MathUtils.degToRad(46 / 2));
    const wide = aspect > 1.15;
    const share = wide ? 0.55 : 0.9;
    const d = Math.max(SH / (2 * 0.5 * tanH), SW / (share * 2 * tanH * aspect)) * near;
    const a = slotAngle(SLOTS[i]);
    const shift = wide ? (0.2 * 2 * d * tanH * aspect) / R : 0;
    return {
      pos: { r: R - d, a, y: 0 },
      look: { r: R, a: a + shift, y: wide ? 0 : -SH * 0.4 },
      fov: 46,
    };
  }

  layout() {
    const aspect = innerWidth / innerHeight;
    const far = aspect < 1 ? 1.45 : 1;
    const kf = [];
    const add = (at, pose, ease = "linear") => kf.push({ at, pose, ease });
    const P = (pr, pa, py, lr, la, ly, fov = 44) => ({ pos: { r: pr * far, a: pa, y: py * far }, look: { r: lr, a: la, y: ly }, fov });
    const last = slotAngle(SLOTS[SLOTS.length - 1]);
    this.chapters = [];
    this.tunnel = null;

    for (const el of document.querySelectorAll("[data-cam]")) {
      const key = el.dataset.cam;
      const top = el.getBoundingClientRect().top + scrollY;
      const h = el.offsetHeight;
      this.chapters.push({ key, top, bottom: top + h });
      const at = (f) => top + h * f;
      if (key === "hero") add(at(0.5), P(30, 0.5, 96, 0, 0.5, -4, 40));
      else if (key === "story-0") add(at(0.5), P(40, 1.4, 64, 0, 1.4, -2, 42));
      else if (key === "story-1") add(at(0.5), P(44, 2.4, 38, 0, 2.4, 0, 44));
      else if (key === "story-2") add(at(0.5), P(36, 3.3, 22, 0, 3.3, 0, 44));
      else if (key === "arrive") {
        add(at(0.2), P(24, 4.1, 15, 0, 4.1, -3, 46));
        // Over the open top, looking down at the figure on its disc.
        add(at(0.55), { pos: { r: 3.5, a: 4.7, y: 5 }, look: { r: 0.4, a: 4.7, y: FLOOR_Y + 1.2 }, fov: 50 }, "smooth");
        add(at(0.85), { pos: { r: 3, a: 5.4, y: 4 }, look: { r: 9, a: TAU, y: -2 }, fov: 48 }, "smooth");
      } else if (key.startsWith("project-")) {
        const i = Number(key.slice(8));
        add(at(0.3), this.projectPose(i, aspect, 1.06), "smooth");
        add(at(0.72), this.projectPose(i, aspect, 0.97));
      } else if (key === "below") {
        // The screens peel off into a tunnel and the camera drops through the floor.
        this.tunnel = { from: at(0.08), to: at(0.5) };
        const a = last + 0.7;
        // Low on the floor behind the figure, then down through the disc.
        add(at(0.22), { pos: { r: 8.5, a, y: FLOOR_Y + 1.6 }, look: { r: 2, a: a + Math.PI, y: FLOOR_Y + 2 }, fov: 50 }, "smooth");
        add(at(0.6), { pos: { r: 0.8, a: a + 0.6, y: -22 }, look: { r: 3, a: a + 0.6 + Math.PI, y: -70 }, fov: 66 });
        add(at(0.92), { pos: { r: 0.8, a: a + 1.4, y: -50 }, look: { r: 3, a: a + 1.4 + Math.PI, y: -95 }, fov: 66 });
      } else if (key === "contact") {
        // Under everything, looking back up the tunnel to the floor and the planets.
        const a = last + 2.6;
        add(at(0.5), { pos: { r: 18 * far, a, y: -78 }, look: { r: 0, a, y: -12 }, fov: 50 }, "smooth");
      }
    }
    kf.sort((x, y) => x.at - y.at);
    this.keyframes = kf;
  }

  targetPose(anchor) {
    const kf = this.keyframes;
    if (!kf.length) return null;
    if (anchor <= kf[0].at) return kf[0].pose;
    for (let i = 1; i < kf.length; i++) {
      const b = kf[i];
      if (anchor <= b.at) {
        const a = kf[i - 1];
        let t = (anchor - a.at) / (b.at - a.at || 1);
        if (b.ease === "smooth") t = smoother(t);
        const mix = (p, q) => ({ r: lerp(p.r, q.r, t), a: lerp(p.a, q.a, t), y: lerp(p.y, q.y, t) });
        return { pos: mix(a.pose.pos, b.pose.pos), look: mix(a.pose.look, b.pose.look), fov: lerp(a.pose.fov, b.pose.fov, t) };
      }
    }
    return kf[kf.length - 1].pose;
  }

  // ---------- interaction ----------

  focus(i) {
    this.focusIndex = i;
    this.focusTarget = 1;
    if (this.reduce) this.focusAmt = 1;
  }

  unfocus() {
    this.focusTarget = 0;
    if (this.reduce) this.focusAmt = 0;
  }

  pointerDown(e) {
    this.drag = { x: e.clientX, last: e.clientX, moved: 0, id: e.pointerId };
    this.yawVel = 0;
  }

  pointerMove(e) {
    this.mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    this.pointerOnCanvas = e.target === this.canvas;
    if (this.drag && e.pointerId === this.drag.id && !this.focusTarget) {
      const dx = e.clientX - this.drag.last;
      this.drag.last = e.clientX;
      this.drag.moved += Math.abs(dx);
      const k = (TAU / innerWidth) * 0.6;
      this.yaw -= dx * k;
      this.yawVel = -dx * k;
    }
  }

  pointerUp() {
    if (this.drag) this.lastDragMoved = this.drag.moved;
    this.drag = null;
  }

  click() {
    if ((this.lastDragMoved ?? 0) > 6 || this.hovered < 0 || this.focusTarget) return;
    this.onOpen?.(this.hovered);
  }

  resize() {
    const w = innerWidth;
    const h = innerHeight;
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
    this.bloom.setSize(Math.round(w / 2), Math.round(h / 2));
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    const dpr = this.renderer.getPixelRatio();
    this.starMat.uniforms.dpr.value = dpr;
    this.dustMat.uniforms.dpr.value = dpr;
    this.layout();
  }

  // ---------- loop ----------

  frame() {
    this.raf = requestAnimationFrame(this.frame);
    if (document.hidden) return;
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;
    const still = this.reduce;
    const ease = (rate) => (still ? 1 : 1 - Math.exp(-dt * rate));
    if (!this.shotsQueued && t > 0.4) {
      this.shotsQueued = true;
      this.loadShots();
    }

    // Where the page is: the middle of the viewport is the anchor.
    const anchor = scrollY + innerHeight / 2;
    const chapter = this.chapters.find((c) => anchor >= c.top && anchor < c.bottom)?.key ?? null;
    if (chapter !== this.chapter) {
      this.chapter = chapter;
      this.onChapter?.(chapter);
    }
    const active = chapter?.startsWith("project-") ? Number(chapter.slice(8)) : -1;

    let target = this.targetPose(anchor);
    if (!target) return;

    // Opening a project flies the camera into its screen.
    this.focusAmt += (this.focusTarget - this.focusAmt) * ease(2.6);
    if (this.focusIndex >= 0 && this.focusAmt > 0.001) {
      const a = slotAngle(SLOTS[this.focusIndex]);
      const f = smoother(clamp01(this.focusAmt * 1.02));
      const close = { pos: { r: R - 3.7, a, y: 0 }, look: { r: R, a, y: 0 }, fov: 46 };
      const m = (p, q) => ({ r: lerp(p.r, q.r, f), a: lerp(p.a, q.a, f), y: lerp(p.y, q.y, f) });
      target = { pos: m(target.pos, close.pos), look: m(target.look, close.look), fov: lerp(target.fov, close.fov, f) };
    }

    // Dragging spins the view around the ring; it glides, then settles back.
    if (!this.drag) {
      this.yaw += this.yawVel;
      this.yawVel *= Math.pow(0.9, dt * 60);
      this.yaw *= 1 - ease(0.9);
    }
    if (this.focusTarget) this.yaw *= 1 - ease(4);

    if (!this.pose || still) this.pose = structuredClone(target);
    else {
      const k = ease(7);
      for (const part of ["pos", "look"]) for (const c of ["r", "a", "y"]) this.pose[part][c] += (target[part][c] - this.pose[part][c]) * k;
      this.pose.fov += (target.fov - this.pose.fov) * k;
    }

    // Arrival: on load the camera drops in from much higher up.
    const intro = still ? 1 : smoother(clamp01((t - 0.3) / 2.6));
    const cam = this.camera;
    const yawed = (p) => ({ ...p, a: p.a + this.yaw });
    const look = cyl(yawed(this.pose.look));
    cyl(yawed(this.pose.pos), cam.position);
    cam.position.y += (1 - intro) * 140;
    cam.position.x += (1 - intro) * 40;
    cam.lookAt(look);

    this.mouseS.lerp(this.mouse, ease(3));
    if (!still) {
      const right = new THREE.Vector3().setFromMatrixColumn(cam.matrix, 0);
      const up = new THREE.Vector3().setFromMatrixColumn(cam.matrix, 1);
      const amp = 0.6 * (1 - this.focusAmt);
      cam.position.addScaledVector(right, this.mouseS.x * amp).addScaledVector(up, this.mouseS.y * amp * 0.6);
      cam.lookAt(look);
    }
    if (Math.abs(cam.fov - this.pose.fov) > 0.01) {
      cam.fov = this.pose.fov;
      cam.updateProjectionMatrix();
    }

    // The tunnel: 0 while the screens stand in the ring, 1 once they form rings below.
    const tun = this.tunnel ? clamp01((anchor - this.tunnel.from) / (this.tunnel.to - this.tunnel.from)) : 0;
    this.floorMat.uniforms.open.value = smoother(tun);
    for (const m of this.frameMats) m.opacity = 1 - smoother(tun) * 0.75;

    // Hover over project screens.
    this.hovered = -1;
    if (this.pointerOnCanvas && !this.focusTarget && !this.drag && tun < 0.05) {
      this.ray ??= new THREE.Raycaster();
      this.ray.setFromCamera(this.mouse, cam);
      const hit = this.ray.intersectObjects(this.projectScreens.filter(Boolean), false)[0];
      if (hit && hit.distance < 45 && hit.face && hit.face.normal.z > 0) this.hovered = hit.object.userData.project;
    }
    this.canvas.style.cursor = this.drag && this.drag.moved > 6 ? "grabbing" : this.hovered >= 0 ? "pointer" : "grab";

    // Screens: boot flicker, a slow float, focus on the active project, a flash on entry.
    const inRing = chapter === "arrive" || active >= 0;
    const tmp = { r: 0, a: 0, y: 0 };
    for (const s of this.screens) {
      const u = s.material.uniforms;
      const d = s.userData;
      const p = d.project;
      u.time.value = t;
      if (!still) {
        const age = t - d.bootAt;
        u.power.value = age < 0 ? 0.03 : age < 0.45 ? (Math.sin(age * 90 + u.seed.value * 50) > -0.2 ? 1 : 0.15) : 1;
      }
      let f = inRing ? 0.42 : 0.85;
      if (active >= 0) f = p === active ? 1 : p >= 0 ? 0.55 : 0.28;
      if (tun > 0) f = lerp(f, 0.75, tun);
      if (p >= 0 && p === this.hovered) f = 1.2;
      if (this.focusTarget || this.focusAmt > 0.01) f = p === this.focusIndex ? 1 : 0.1;
      d.focus += (f - d.focus) * ease(5);
      u.focus.value = d.focus;
      u.flash.value = p === this.focusIndex ? Math.max(0, Math.sin(clamp01(this.focusAmt) * Math.PI)) * 0.35 * this.focusTarget : 0;

      const m = smoother(clamp01((tun - d.delay) / 0.55));
      tmp.r = lerp(d.home.r, d.away.r, m);
      tmp.a = lerp(d.home.a, d.away.a, m);
      tmp.y = lerp(d.home.y, d.away.y, m) + (still ? 0 : Math.sin(t * 0.7 + d.bob) * 0.08);
      cyl(tmp, s.position);
      s.lookAt(0, s.position.y, 0);
      if (m > 0 && m < 1) s.rotateX(Math.sin(m * Math.PI) * 0.5);
      d.scale += ((p >= 0 && p === this.hovered ? 1.06 : 1) - d.scale) * ease(10);
      s.scale.setScalar(d.scale);
    }

    // The figure turns to whatever it is looking at.
    const faceA = this.focusIndex >= 0 && this.focusTarget ? slotAngle(SLOTS[this.focusIndex]) : active >= 0 ? slotAngle(SLOTS[active]) : this.pose.pos.a + this.yaw + Math.PI;
    const cur = this.figure.rotation.y;
    const diff = Math.atan2(Math.sin(faceA - cur), Math.cos(faceA - cur));
    this.figure.rotation.y = cur + diff * ease(2);
    if (!still) this.head.position.y = 2.26 + Math.sin(t * 1.1) * 0.01;

    // World drift.
    const lv = SUN_DIR.clone().transformDirection(cam.matrixWorldInverse);
    for (const pl of this.planets) {
      if (!still) pl.rotation.y += pl.userData.spin * dt;
      pl.material.uniforms.lightV.value.copy(lv);
      pl.material.uniforms.time.value = t;
    }
    if (!still) {
      this.stars.rotation.y += dt * 0.004;
      this.starMat.uniforms.time.value = t;
      this.dustMat.uniforms.time.value = t;
      this.floorMat.uniforms.time.value = t;
      this.sky.material.uniforms.time.value = t;
    }

    this.composer.render();
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    removeEventListener("resize", this.resize);
    removeEventListener("pointermove", this.pointerMove);
    removeEventListener("pointerup", this.pointerUp);
    removeEventListener("pointercancel", this.pointerUp);
    this.canvas.removeEventListener("pointerdown", this.pointerDown);
    this.canvas.removeEventListener("click", this.click);
    this.ro.disconnect();
    this.scene.traverse((o) => {
      o.geometry?.dispose();
      const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      for (const m of mats) {
        for (const v of Object.values(m.uniforms ?? {})) if (v.value?.isTexture) v.value.dispose();
        m.map?.dispose();
        m.dispose();
      }
    });
    this.composer.dispose();
    this.renderer.dispose();
  }
}
