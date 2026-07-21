/**
 * Renders the shareable Taste Test result card to a canvas and hands back a PNG
 * blob. Pure Canvas 2D — no html-to-image dependency, no network, nothing the
 * artifact CSP or the bundle would object to. One draw function is the single
 * source of truth for both the on-screen preview and the exported/shared image.
 */

import type { DnaBar } from "./taste-insights";

export interface ShareCardData {
  archetypeLabel: string;
  emoji: string;
  accent: string;
  secondaryLabel: string;
  bars: DnaBar[];
  heroTitle: string | null;
}

// Portrait 4:5 — reads well in feeds and stories without cropping.
const W = 1080;
const H = 1350;
const PAD = 84;
const BG = "#09090f";
const INK = "#F5F5F0";
const MUTED = "#8b8b9a";

const MONO = "'SFMono-Regular', ui-monospace, Menlo, monospace";
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, 'Segoe UI', Roboto, sans-serif";

/** Draw the card onto an existing canvas (used for the live preview). */
export function drawShareCard(canvas: HTMLCanvasElement, data: ShareCardData): void {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Backdrop + an accent glow anchored top-centre.
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, H * 0.16, 40, W / 2, H * 0.16, W * 0.9);
  glow.addColorStop(0, hexWithAlpha(data.accent, 0.32));
  glow.addColorStop(1, hexWithAlpha(data.accent, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";
  let y = PAD + 24;

  // Kicker.
  ctx.fillStyle = hexWithAlpha(data.accent, 0.85);
  ctx.font = `600 26px ${MONO}`;
  ctx.fillText(spaced("CINEROLL · TASTE TEST"), W / 2, y);
  y += 96;

  // Emoji.
  ctx.font = `140px ${SANS}`;
  ctx.fillText(data.emoji, W / 2, y + 40);
  y += 150;

  // "I'M A"
  ctx.fillStyle = MUTED;
  ctx.font = `600 28px ${MONO}`;
  ctx.fillText(spaced("I'M A"), W / 2, y);
  y += 78;

  // Archetype label (wraps up to two lines).
  ctx.fillStyle = INK;
  const labelLines = wrap(ctx, data.archetypeLabel.toUpperCase(), W - PAD * 2, 92, SERIF, "bold");
  ctx.font = `bold 92px ${SERIF}`;
  for (const line of labelLines) {
    ctx.fillText(line, W / 2, y);
    y += 96;
  }
  y += 12;

  // Secondary leaning.
  ctx.fillStyle = MUTED;
  ctx.font = `400 30px ${SANS}`;
  ctx.fillText(`with a ${data.secondaryLabel} streak`, W / 2, y);
  y += 96;

  // DNA bars.
  const barW = W - PAD * 2;
  for (const bar of data.bars) {
    ctx.textAlign = "left";
    ctx.fillStyle = INK;
    ctx.font = `500 30px ${SANS}`;
    const leaning = bar.value >= 50 ? bar.right : bar.left;
    ctx.fillText(leaning, PAD, y);
    ctx.textAlign = "right";
    ctx.fillStyle = data.accent;
    ctx.font = `600 30px ${MONO}`;
    const strength = bar.value >= 50 ? bar.value : 100 - bar.value;
    ctx.fillText(`${strength}%`, PAD + barW, y);
    y += 26;

    // Track + fill (fill grows from whichever pole the user leans to).
    const trackH = 14;
    roundRect(ctx, PAD, y, barW, trackH, trackH / 2);
    ctx.fillStyle = "#1c1c28";
    ctx.fill();
    const fillW = (strength / 100) * barW;
    if (bar.value >= 50) {
      roundRect(ctx, PAD + barW - fillW, y, fillW, trackH, trackH / 2);
    } else {
      roundRect(ctx, PAD, y, fillW, trackH, trackH / 2);
    }
    ctx.fillStyle = data.accent;
    ctx.fill();
    y += trackH + 54;
  }

  // Hero match.
  if (data.heroTitle) {
    y += 12;
    ctx.textAlign = "center";
    ctx.fillStyle = MUTED;
    ctx.font = `600 26px ${MONO}`;
    ctx.fillText(spaced("MY CINEMATIC MATCH"), W / 2, y);
    y += 58;
    ctx.fillStyle = INK;
    const heroLines = wrap(ctx, data.heroTitle, W - PAD * 2, 52, SERIF, "bold");
    ctx.font = `bold 52px ${SERIF}`;
    for (const line of heroLines.slice(0, 2)) {
      ctx.fillText(line, W / 2, y);
      y += 58;
    }
  }

  // Footer.
  ctx.textAlign = "center";
  ctx.fillStyle = MUTED;
  ctx.font = `600 24px ${MONO}`;
  ctx.fillText(spaced("FIND YOURS AT CINEROLL"), W / 2, H - PAD + 8);
}

/** Render the card off-screen and return it as a PNG blob. */
export async function renderShareCard(data: ShareCardData): Promise<Blob> {
  const canvas = document.createElement("canvas");
  // Best-effort: wait for web fonts so the export isn't a flash of fallbacks.
  try {
    await (document as Document & { fonts?: FontFaceSet }).fonts?.ready;
  } catch {
    /* fonts API unavailable — fallbacks are fine */
  }
  drawShareCard(canvas, data);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not render card"))),
      "image/png",
    );
  });
}

/* ── helpers ─────────────────────────────────────────────────────────────── */

function spaced(s: string): string {
  return s.split("").join(" "); // thin space → letter-spacing effect
}

function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fontSize: number,
  family: string,
  weight = "400",
): string[] {
  ctx.font = `${weight} ${fontSize}px ${family}`;
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const attempt = current ? `${current} ${word}` : word;
    if (ctx.measureText(attempt).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = attempt;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** #rrggbb + alpha → rgba(). Falls back to the raw colour if it isn't 6-hex. */
function hexWithAlpha(hex: string, alpha: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1]!, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
