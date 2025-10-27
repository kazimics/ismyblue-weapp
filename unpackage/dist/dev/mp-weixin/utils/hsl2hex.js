"use strict";
function hslToHex(h, s, l) {
  let r, g, b;
  h = h % 360;
  s = s / 100;
  l = l / 100;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 120);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 120);
  }
  r = Math.round(r * 255);
  g = Math.round(g * 255);
  b = Math.round(b * 255);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}
function hueToRgb(p, q, h) {
  if (h < 0)
    h += 360;
  if (h >= 360)
    h -= 360;
  if (h < 60)
    return p + (q - p) * h / 60;
  if (h < 180)
    return q;
  if (h < 240)
    return p + (q - p) * (240 - h) / 60;
  return p;
}
exports.hslToHex = hslToHex;
