import { useEffect, useRef } from "react";

/*
  A small discrete-event value stream: items arrive from "Raw data", queue in front
  of three stations, get processed one at a time, and are delivered to "You".
  Finance is the bottleneck by design. Hovering (or tapping) a station runs a kaizen
  that cuts its cycle time, the queue drains, and the timeline ladder re-computes.
*/

const STATIONS = [
  { name: "Industrial Eng.", short: "IE", ct: 0.7 },
  { name: "Finance", short: "Finance", ct: 1.45 },
  { name: "Full-stack", short: "Stack", ct: 0.65 },
];
const ARRIVAL = 0.9; // seconds between released items
const WIP_CAP = 26;
const KAIZEN_CUT = 0.7; // share of cycle time removed at full boost

function readTokens() {
  const s = getComputedStyle(document.documentElement);
  const v = (n) => s.getPropertyValue(n).trim();
  return {
    ink: v("--ink"),
    ink3: v("--ink-3"),
    sheet: v("--sheet"),
    ground: v("--ground"),
    flow: v("--flow"),
    kaizen: v("--kaizen"),
    kaizenInk: v("--kaizen-ink"),
    shadow: v("--shadow"),
  };
}

function createSim() {
  return {
    t: 0,
    nextArrival: 0.2,
    items: [],
    stations: STATIONS.map((s) => ({
      ...s,
      queue: [],
      busy: null,
      boost: 0,
      hold: 0,
      latched: false,
      wait: 2.4,
    })),
    delivered: 0,
    lead: 9,
    hover: -1,
  };
}

function effCt(st) {
  return st.ct * (1 - KAIZEN_CUT * st.boost);
}

function layout(W, H) {
  const compact = W < 640;
  const pad = Math.max(16, W * 0.025);
  const x0 = pad + (compact ? 22 : 34);
  const xc = W - pad - (compact ? 22 : 34);
  const span = xc - x0;
  const lineY = compact ? H * 0.36 : H * 0.38;
  const bw = compact ? Math.min(52, span * 0.15) : Math.min(156, span * 0.17);
  const bh = compact ? 42 : Math.min(84, H * 0.22);
  const stations = [0.26, 0.52, 0.78].map((f) => x0 + span * f);
  const tris = stations.map((sx, i) => {
    const prevRight = i === 0 ? x0 + 30 : stations[i - 1] + bw / 2;
    return (prevRight + (sx - bw / 2)) / 2;
  });
  return { compact, pad, x0, xc, lineY, bw, bh, stations, tris, W, H };
}

function step(sim, dt, L) {
  sim.t += dt;
  const speed = Math.max(120, L.W * 0.2);

  // Kaizen boost rises fast while held, then decays slowly back to the old process.
  sim.stations.forEach((st, i) => {
    const target = sim.hover === i || st.hold > 0 || st.latched ? 1 : 0;
    st.hold = Math.max(0, st.hold - dt);
    const rate = target > st.boost ? 5 : 0.16;
    st.boost += (target - st.boost) * Math.min(1, rate * dt);
  });

  // Release new work while WIP is under the cap.
  const wip = sim.items.length;
  if (sim.t >= sim.nextArrival) {
    sim.nextArrival = sim.t + ARRIVAL * (0.85 + Math.random() * 0.3);
    if (wip < WIP_CAP) {
      sim.items.push({
        x: L.x0 + 26,
        y: L.lineY,
        dy: 0,
        stage: 0,
        state: "move",
        born: sim.t,
        enq: 0,
        pEnd: 0,
      });
    }
  }

  for (const it of sim.items) {
    if (it.state !== "move") continue;
    const tx = it.stage < 3 ? L.tris[it.stage] : L.xc - 20;
    it.x += speed * dt;
    if (it.x >= tx) {
      it.x = tx;
      if (it.stage < 3) {
        it.state = "queue";
        it.enq = sim.t;
        sim.stations[it.stage].queue.push(it);
      } else {
        it.state = "done";
        sim.delivered += 1;
        const lt = sim.t - it.born;
        sim.lead += (lt - sim.lead) * 0.18;
      }
    }
  }
  sim.items = sim.items.filter((it) => it.state !== "done");

  sim.stations.forEach((st, i) => {
    if (st.busy && sim.t >= st.busy.pEnd) {
      const it = st.busy;
      it.state = "move";
      it.stage = i + 1;
      it.x = L.stations[i] + L.bw / 2 - 4;
      st.busy = null;
    }
    if (!st.busy && st.queue.length) {
      const it = st.queue.shift();
      const w = sim.t - it.enq;
      st.wait += (w - st.wait) * 0.2;
      it.state = "proc";
      it.pStart = sim.t;
      it.pEnd = sim.t + effCt(st);
      st.busy = it;
    }
  });

  // What a job released now would experience: the work queued ahead of it at each
  // station times that station's current cycle time, plus its own processing and travel.
  let lead = (L.xc - L.x0) / speed;
  sim.stations.forEach((st) => {
    const ahead = st.queue.length + (st.busy ? Math.max(0, st.busy.pEnd - sim.t) / effCt(st) : 0);
    st.waitNow = ahead * effCt(st);
    lead += st.waitNow + effCt(st);
  });
  sim.leadNow = lead;
}

function burstPath(ctx, cx, cy, r, spikes = 11) {
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.62;
    const px = cx + Math.cos(a) * rr * 1.25;
    const py = cy + Math.sin(a) * rr;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function factory(ctx, cx, baseY, w, h, c) {
  const x = cx - w / 2;
  const teeth = 3;
  const tw = w / teeth;
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.lineTo(x, baseY - h * 0.55);
  for (let i = 0; i < teeth; i++) {
    ctx.lineTo(x + tw * i + tw, baseY - h);
    ctx.lineTo(x + tw * i + tw, baseY - h * 0.55);
  }
  ctx.lineTo(x + w, baseY);
  ctx.closePath();
  ctx.fillStyle = c.sheet;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = c.ink;
  ctx.stroke();
}

function draw(ctx, sim, L, c, pointer) {
  const { W, H, lineY, bw, bh, compact } = L;
  ctx.clearRect(0, 0, W, H);
  const fs = compact ? 11 : 13;

  // Information flow: the demand signal travels from You back to the source.
  const infoY = compact ? 18 : 26;
  ctx.strokeStyle = c.flow;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(L.xc, lineY - 40);
  ctx.lineTo(L.xc, infoY);
  const mid = (L.x0 + L.xc) / 2;
  ctx.lineTo(mid + 14, infoY);
  ctx.lineTo(mid + 4, infoY + 9);
  ctx.lineTo(mid - 4, infoY - 3);
  ctx.lineTo(mid - 14, infoY + 6);
  ctx.lineTo(L.x0, infoY + 6);
  ctx.lineTo(L.x0, lineY - 44);
  ctx.stroke();
  ctx.fillStyle = c.flow;
  ctx.beginPath();
  ctx.moveTo(L.x0 - 5, lineY - 50);
  ctx.lineTo(L.x0 + 5, lineY - 50);
  ctx.lineTo(L.x0, lineY - 42);
  ctx.fill();
  if (!compact) {
    ctx.font = `600 ${fs - 1}px "JetBrains Mono", monospace`;
    ctx.fillText("demand signal", mid + 22, infoY - 6);
  }

  // Striped push arrows between every pair of nodes.
  const segs = [
    [L.x0 + (compact ? 20 : 30), L.stations[0] - bw / 2],
    [L.stations[0] + bw / 2, L.stations[1] - bw / 2],
    [L.stations[1] + bw / 2, L.stations[2] - bw / 2],
    [L.stations[2] + bw / 2, L.xc - (compact ? 20 : 30)],
  ];
  const band = compact ? 5 : 8;
  const head = compact ? 6 : 9;
  segs.forEach(([a, b]) => {
    ctx.strokeStyle = c.ink3;
    ctx.lineWidth = band;
    ctx.setLineDash([compact ? 3 : 4, compact ? 3 : 4]);
    ctx.beginPath();
    ctx.moveTo(a + 4, lineY);
    ctx.lineTo(b - head - 4, lineY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = c.ink3;
    ctx.beginPath();
    ctx.moveTo(b - head - 4, lineY - band);
    ctx.lineTo(b - 3, lineY);
    ctx.lineTo(b - head - 4, lineY + band);
    ctx.fill();
  });

  // Source and customer
  const fw = compact ? 36 : 54;
  const fh = compact ? 28 : 40;
  factory(ctx, L.x0, lineY + fh / 2, fw, fh, c);
  factory(ctx, L.xc, lineY + fh / 2, fw, fh, c);
  ctx.fillStyle = c.ink;
  ctx.textAlign = "center";
  ctx.font = `700 ${fs}px "Archivo Variable", sans-serif`;
  ctx.fillText("Raw data", L.x0, lineY + fh / 2 + fs + 8);
  ctx.fillText("You", L.xc, lineY + fh / 2 + fs + 8);
  ctx.font = `500 ${fs - 1}px "JetBrains Mono", monospace`;
  ctx.fillStyle = c.ink3;
  ctx.fillText(`${sim.delivered} in`, L.xc, lineY + fh / 2 + fs * 2 + 12);

  // Inventory triangles and their queues
  sim.stations.forEach((st, i) => {
    const tx = L.tris[i];
    const ts = compact ? 9 : 18;
    ctx.beginPath();
    ctx.moveTo(tx, lineY - ts);
    ctx.lineTo(tx + ts, lineY + ts * 0.75);
    ctx.lineTo(tx - ts, lineY + ts * 0.75);
    ctx.closePath();
    ctx.fillStyle = c.sheet;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = c.ink;
    ctx.stroke();
    ctx.fillStyle = c.ink;
    ctx.font = `800 ${compact ? 8 : 12}px "Archivo Variable", sans-serif`;
    ctx.fillText("I", tx, lineY + ts * 0.55);

    const s = compact ? 5 : 7;
    const g = compact ? 2 : 3;
    const cols = 4;
    st.queue.forEach((it, k) => {
      const col = k % cols;
      const row = Math.floor(k / cols);
      const qx = tx - ((cols * (s + g)) - g) / 2 + col * (s + g);
      const qy = lineY - ts - 6 - s - row * (s + g);
      it.x = qx;
      ctx.fillStyle = c.flow;
      ctx.fillRect(qx, qy, s, s);
    });
  });

  // Stations
  sim.stations.forEach((st, i) => {
    const sx = L.stations[i];
    const top = lineY - bh / 2;
    const hovered = sim.hover === i;
    const lift = st.boost * 3;

    ctx.save();
    ctx.shadowColor = `rgb(${c.shadow} / ${0.18 + st.boost * 0.14})`;
    ctx.shadowBlur = 16 + st.boost * 10;
    ctx.shadowOffsetY = 6 + lift;
    ctx.fillStyle = c.sheet;
    ctx.fillRect(sx - bw / 2, top - lift, bw, bh);
    ctx.restore();
    ctx.lineWidth = hovered ? 3 : 2;
    ctx.strokeStyle = c.ink;
    ctx.strokeRect(sx - bw / 2, top - lift, bw, bh);
    // title bar
    const tb = compact ? 16 : 22;
    ctx.fillStyle = c.ink;
    ctx.fillRect(sx - bw / 2, top - lift, bw, tb);
    ctx.fillStyle = c.ground;
    ctx.font = `700 ${compact ? 8 : 12}px "Archivo Variable", sans-serif`;
    ctx.fillText(compact ? st.short : st.name, sx, top - lift + tb - (compact ? 5 : 7));

    // job in process + progress
    if (st.busy) {
      const p = Math.min(1, (sim.t - st.busy.pStart) / (st.busy.pEnd - st.busy.pStart));
      const s = compact ? 7 : 10;
      ctx.fillStyle = c.flow;
      ctx.fillRect(sx - s / 2 + (p - 0.5) * (bw * 0.5), top - lift + tb + (bh - tb) / 2 - s / 2, s, s);
      ctx.fillStyle = st.boost > 0.05 ? c.kaizen : c.flow;
      ctx.fillRect(sx - bw / 2 + 2, top - lift + bh - 5, (bw - 4) * p, 3);
    }

    // data box
    if (!compact) {
      const dy = top + bh + 12;
      const rows = [
        ["C/T", `${effCt(st).toFixed(2)} s`],
        ["Queue", `${st.queue.length}`],
        ["Wait", `${(st.waitNow ?? 0).toFixed(1)} s`],
      ];
      const rh = 17;
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = c.ink;
      ctx.fillStyle = c.sheet;
      ctx.fillRect(sx - bw / 2, dy, bw, rows.length * rh + 8);
      ctx.strokeRect(sx - bw / 2, dy, bw, rows.length * rh + 8);
      rows.forEach(([k, v], r) => {
        ctx.textAlign = "left";
        ctx.fillStyle = c.ink3;
        ctx.font = `500 11px "JetBrains Mono", monospace`;
        ctx.fillText(k, sx - bw / 2 + 9, dy + 17 + r * rh);
        ctx.textAlign = "right";
        ctx.fillStyle = r === 0 && st.boost > 0.05 ? c.kaizen : c.ink;
        ctx.font = `600 12px "JetBrains Mono", monospace`;
        ctx.fillText(v, sx + bw / 2 - 9, dy + 17 + r * rh);
      });
      ctx.textAlign = "center";
    } else {
      ctx.fillStyle = c.ink;
      ctx.font = `600 10px "JetBrains Mono", monospace`;
      ctx.fillText(`${effCt(st).toFixed(2)}s`, sx, top + bh + 14);
    }

    // kaizen burst
    if (st.boost > 0.04) {
      const r = (compact ? 11 : 16) * (0.6 + st.boost * 0.5);
      const cy = top - lift - r - 4;
      burstPath(ctx, sx + bw * 0.28, cy, r);
      ctx.fillStyle = c.kaizen;
      ctx.globalAlpha = Math.min(1, st.boost * 1.6);
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = c.ink;
      ctx.stroke();
      ctx.fillStyle = c.kaizenInk;
      ctx.font = `800 ${compact ? 8 : 10}px "Archivo Variable", sans-serif`;
      ctx.fillText(`-${Math.round(KAIZEN_CUT * st.boost * 100)}%`, sx + bw * 0.28, cy + 3.5);
      ctx.globalAlpha = 1;
    }
  });

  // Moving items, nudged away from the pointer.
  const s = compact ? 6 : 8;
  for (const it of sim.items) {
    if (it.state !== "move") continue;
    let target = 0;
    if (pointer.active) {
      const dx = it.x - pointer.x;
      const dy = lineY - pointer.y;
      const d = Math.hypot(dx, dy);
      if (d < 70) target = (dy > 0 ? 1 : -1) * (70 - d) * 0.5;
    }
    it.dy += (target - it.dy) * 0.18;
    ctx.fillStyle = c.flow;
    ctx.fillRect(it.x - s / 2, lineY - s / 2 + it.dy, s, s);
  }

  // Timeline ladder: waiting on top, value-adding time below.
  const ly = H - (compact ? 30 : 40);
  const up = ly - (compact ? 10 : 14);
  ctx.lineWidth = 2;
  ctx.strokeStyle = c.ink;
  ctx.beginPath();
  ctx.moveTo(L.x0, up);
  let totalWait = 0;
  let totalCt = 0;
  sim.stations.forEach((st, i) => {
    const sx = L.stations[i];
    ctx.lineTo(sx - bw / 2, up);
    ctx.lineTo(sx - bw / 2, ly);
    ctx.lineTo(sx + bw / 2, ly);
    ctx.lineTo(sx + bw / 2, up);
    totalWait += st.waitNow ?? 0;
    totalCt += effCt(st);
  });
  const ladderEnd = compact ? L.stations[2] + bw / 2 + 6 : L.stations[2] + bw / 2 + (L.xc - L.stations[2] - bw / 2) * 0.35;
  ctx.lineTo(ladderEnd, up);
  ctx.stroke();

  ctx.font = `500 ${compact ? 9 : 11}px "JetBrains Mono", monospace`;
  ctx.fillStyle = c.ink3;
  sim.stations.forEach((st, i) => {
    const sx = L.stations[i];
    const prev = i === 0 ? L.x0 : L.stations[i - 1] + bw / 2;
    ctx.textAlign = "center";
    ctx.fillText(`${(st.waitNow ?? 0).toFixed(1)}s`, (prev + sx - bw / 2) / 2, up - 6);
    if (!compact) ctx.fillText(`${effCt(st).toFixed(2)}s`, sx, ly + 15);
  });

  ctx.textAlign = "right";
  ctx.fillStyle = c.ink;
  ctx.font = `700 ${compact ? 10 : 12}px "JetBrains Mono", monospace`;
  ctx.fillText(`lead ${(sim.leadNow ?? 0).toFixed(1)}s`, W - L.pad, up - 4);
  ctx.fillStyle = c.ink3;
  ctx.font = `500 ${compact ? 9 : 11}px "JetBrains Mono", monospace`;
  ctx.fillText(`value-add ${totalCt.toFixed(1)}s`, W - L.pad, ly + (compact ? 12 : 15));
  ctx.textAlign = "center";
  void totalWait;
}

export default function FlowSim({ simRef: externalRef }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const simRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sim = createSim();
    simRef.current = sim;
    if (externalRef) externalRef.current = sim;
    let L = null;
    let colors = readTokens();
    const pointer = { x: 0, y: 0, active: false };
    let raf = 0;
    let last = 0;
    let visible = true;

    const resize = () => {
      const W = wrap.clientWidth;
      const H = W < 640 ? 250 : Math.round(Math.min(430, Math.max(330, W * 0.29)));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      L = layout(W, H);
      if (reduce) draw(ctx, sim, L, colors, pointer);
    };

    const warm = (seconds) => {
      for (let i = 0; i < seconds * 30; i++) step(sim, 1 / 30, L);
    };

    const hitStation = (x, y) => {
      if (!L) return -1;
      return L.stations.findIndex(
        (sx) => Math.abs(x - sx) < L.bw / 2 + 8 && Math.abs(y - L.lineY) < L.bh / 2 + 26
      );
    };

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = true;
      if (e.pointerType === "mouse") {
        sim.hover = hitStation(pointer.x, pointer.y);
        canvas.style.cursor = sim.hover >= 0 ? "pointer" : "default";
      }
    };
    const onLeave = () => {
      pointer.active = false;
      sim.hover = -1;
    };
    const onDown = (e) => {
      const r = canvas.getBoundingClientRect();
      const i = hitStation(e.clientX - r.left, e.clientY - r.top);
      if (i >= 0) sim.toggle(i);
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      step(sim, dt, L);
      draw(ctx, sim, L, colors, pointer);
    };

    resize();
    warm(34);
    const start = () => {
      if (reduce) {
        draw(ctx, sim, L, colors, pointer);
      } else {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
    else start();

    // Reduced motion: kaizen buttons re-run the model instantly and redraw a still frame.
    // Tapping a station (or its button) latches a kaizen on or off.
    sim.toggle = (i) => {
      sim.stations[i].latched = !sim.stations[i].latched;
      sim.onChange?.();
      sim.redraw?.();
    };
    sim.redraw = () => {
      if (!reduce) return;
      warm(8);
      draw(ctx, sim, L, colors, pointer);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      last = performance.now();
    });
    io.observe(wrap);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      colors = readTokens();
      if (reduce) draw(ctx, sim, L, colors, pointer);
    };
    mq.addEventListener("change", onScheme);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerdown", onDown);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mq.removeEventListener("change", onScheme);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
    };
  }, [externalRef]);

  return (
    <div ref={wrapRef} className="relative w-full">
      <canvas
        ref={canvasRef}
        className="block w-full touch-pan-y"
        role="img"
        aria-label="Live value stream simulation. Work items flow from raw data through Industrial Engineering, Finance and Full-stack stations to you. Finance is the bottleneck; running a kaizen on a station shortens its cycle time and the lead time drops."
      />
    </div>
  );
}

export { STATIONS };
