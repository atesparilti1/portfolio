// Canvas faces for the screens on the ring. Project screens show the real
// screenshot when there is one; the rest are drawn from the projects' own data,
// so every screen on the ring shows something real.
import dcf from "../data/asml_dcf.json";
import ops from "../data/discount_policy.json";
import forecast from "../data/forecast_store9_item1.json";
import filings from "../data/filings.json";

export const SCREEN_W = 1024;
export const SCREEN_H = 640;

const BG = "#0b0e14";
const GRID = "rgba(233,235,230,0.07)";
const INK = "#e9ebe6";
const INK2 = "#9aa1a9";
const ACCENT = "#3b82f6";
const ALARM = "#ff4d5e";

function canvas() {
  const c = document.createElement("canvas");
  c.width = SCREEN_W;
  c.height = SCREEN_H;
  const g = c.getContext("2d");
  g.fillStyle = BG;
  g.fillRect(0, 0, SCREEN_W, SCREEN_H);
  g.strokeStyle = GRID;
  g.lineWidth = 1;
  for (let x = 0; x <= SCREEN_W; x += 64) line(g, x, 0, x, SCREEN_H);
  for (let y = 0; y <= SCREEN_H; y += 64) line(g, 0, y, SCREEN_W, y);
  return [c, g];
}

function line(g, x1, y1, x2, y2) {
  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.stroke();
}

function header(g, left, right) {
  g.fillStyle = INK2;
  g.font = "600 22px 'JetBrains Mono', monospace";
  g.textBaseline = "top";
  g.fillText(left, 48, 40);
  if (right) {
    g.textAlign = "right";
    g.fillText(right, SCREEN_W - 48, 40);
    g.textAlign = "left";
  }
}

function big(g, text, color = INK) {
  g.fillStyle = color;
  g.font = "600 84px 'JetBrains Mono', monospace";
  g.textBaseline = "top";
  g.fillText(text, 48, 84);
}

function plot(g, series, { color, x0 = 48, y0 = 220, w = SCREEN_W - 96, h = 360, min, max, width = 3, dash } = {}) {
  const lo = min ?? Math.min(...series);
  const hi = max ?? Math.max(...series);
  g.strokeStyle = color;
  g.lineWidth = width;
  g.setLineDash(dash ?? []);
  g.beginPath();
  series.forEach((v, i) => {
    const x = x0 + (i / (series.length - 1)) * w;
    const y = y0 + h - ((v - lo) / (hi - lo || 1)) * h;
    i ? g.lineTo(x, y) : g.moveTo(x, y);
  });
  g.stroke();
  g.setLineDash([]);
}

// Daily sales against the XGBoost forecast, store 9 item 1.
function forecastFace() {
  const [c, g] = canvas();
  header(g, "STORE 9 / ITEM 1", "XGBOOST");
  big(g, "MAPE 13.6%");
  const n = Math.min(forecast.a.length, forecast.p.length);
  const all = [...forecast.a.slice(0, n), ...forecast.p.slice(0, n)];
  const min = Math.min(...all);
  const max = Math.max(...all);
  plot(g, forecast.a.slice(0, n), { color: "rgba(233,235,230,0.55)", min, max, width: 2 });
  plot(g, forecast.p.slice(0, n), { color: ACCENT, min, max, width: 4 });
  return c;
}

// The three DCF cases, discounted cash flow by year.
function dcfFace() {
  const [c, g] = canvas();
  header(g, "ASML / UFCF €M", dcf.asOf.toUpperCase());
  big(g, "€935 vs €1,611");
  const cases = ["Bear", "Base", "Bull"];
  const max = Math.max(...cases.flatMap((k) => dcf.cases[k].cf));
  const years = dcf.cases.Base.cf.length;
  const slot = (SCREEN_W - 96) / years;
  cases.forEach((k, j) => {
    g.fillStyle = j === 1 ? ACCENT : j === 0 ? "rgba(233,235,230,0.25)" : "rgba(233,235,230,0.55)";
    dcf.cases[k].cf.forEach((v, i) => {
      const h = (v / max) * 340;
      g.fillRect(48 + i * slot + j * (slot / 3.4) + 6, 580 - h, slot / 3.8, h);
    });
  });
  return c;
}

// Margin by discount band, Global Superstore.
function opsFace() {
  const [c, g] = canvas();
  header(g, "MARGIN BY DISCOUNT", `${ops.rows.toLocaleString("en-US")} LINES`);
  big(g, "−$815k above 20%", ALARM);
  const bands = ops.bands;
  const slot = (SCREEN_W - 96) / bands.length;
  const zero = 400;
  bands.forEach((b, i) => {
    const h = b.margin * 520;
    g.fillStyle = b.margin < 0 ? ALARM : ACCENT;
    g.fillRect(48 + i * slot + 14, h >= 0 ? zero - h : zero, slot - 28, Math.abs(h));
    g.fillStyle = INK2;
    g.font = "500 22px 'JetBrains Mono', monospace";
    g.fillText(b.band, 48 + i * slot + 14, 590);
  });
  g.strokeStyle = INK;
  g.lineWidth = 2;
  line(g, 48, zero, SCREEN_W - 48, zero);
  return c;
}

// A filing summary as the analyzer returns it.
function filingFace(i) {
  const f = filings[i % filings.length];
  const [c, g] = canvas();
  header(g, `${f.ticker} / ${f.form}`, f.filed);
  g.fillStyle = INK;
  g.font = "700 46px 'Archivo Variable', sans-serif";
  g.fillText(f.company, 48, 92);
  g.font = "400 25px 'Archivo Variable', sans-serif";
  g.fillStyle = INK2;
  wrap(g, f.summary, 48, 170, SCREEN_W - 96, 36, 7);
  g.fillStyle = ACCENT;
  g.fillRect(48, 548, 8, 48);
  g.fillStyle = INK;
  g.font = "600 22px 'JetBrains Mono', monospace";
  g.fillText(`${f.risks.length} RISKS · EACH BACKED BY A QUOTE`, 72, 562);
  return c;
}

function wrap(g, text, x, y, w, lh, maxLines) {
  const words = String(text).split(" ");
  let lineText = "";
  let n = 0;
  for (const word of words) {
    const test = lineText ? `${lineText} ${word}` : word;
    if (g.measureText(test).width > w && lineText) {
      g.fillText(n === maxLines - 1 ? `${lineText}…` : lineText, x, y + n * lh);
      if (++n >= maxLines) return;
      lineText = word;
    } else lineText = test;
  }
  if (lineText) g.fillText(lineText, x, y + n * lh);
}

// Monte Carlo fan: seeded random walks, a picture of the method, not a result.
function fanFace(seed) {
  const [c, g] = canvas();
  header(g, "MONTE CARLO PATHS", "ILLUSTRATIVE");
  big(g, "20,000 futures");
  let s = seed * 9301 + 49297;
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let p = 0; p < 46; p++) {
    let v = 0;
    const path = [0];
    for (let t = 1; t < 48; t++) path.push((v += (rand() - 0.5) * 2));
    plot(g, path, { color: p === 0 ? ACCENT : "rgba(233,235,230,0.14)", min: -14, max: 14, width: p === 0 ? 4 : 1.5 });
  }
  return c;
}

function stockFace() {
  const [c, g] = canvas();
  header(g, "STOCKOUT RISK", "14-DAY WINDOW");
  big(g, "178 of 500");
  const cols = 25;
  const size = (SCREEN_W - 96) / cols;
  let s = 7;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const flags = Array.from({ length: 500 }, (_, i) => i).sort(() => rand() - 0.5).slice(0, 178);
  const risk = new Set(flags);
  for (let i = 0; i < 500; i++) {
    const x = 48 + (i % cols) * size;
    const y = 220 + Math.floor(i / cols) * 19;
    g.fillStyle = risk.has(i) ? ACCENT : "rgba(233,235,230,0.16)";
    g.fillRect(x, y, size - 6, 13);
  }
  return c;
}

export const FILLERS = [forecastFace, dcfFace, opsFace, () => filingFace(0), () => fanFace(3), stockFace, () => filingFace(4), () => fanFace(11), () => filingFace(2)];
export const DRAWN = { ops: opsFace };
