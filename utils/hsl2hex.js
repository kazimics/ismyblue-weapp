export function hslToHex(h, s, l) {
  // 将 HSL 转换为 RGB
  let r, g, b;

  // HSL 范围调整
  h = h % 360; // 确保 H 在 0-360 范围内
  s = s / 100; // 将 S 转换为 0-1 范围
  l = l / 100; // 将 L 转换为 0-1 范围

  if (s === 0) {
    // 如果饱和度为 0，颜色为灰色
    r = g = b = l; // 所有 RGB 值相等
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s; // 计算 q
    const p = 2 * l - q; // 计算 p

    // 计算 RGB 值
    r = hueToRgb(p, q, h + 120);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 120);
  }

  // 将 RGB 值转换为 0-255 范围
  r = Math.round(r * 255);
  g = Math.round(g * 255);
  b = Math.round(b * 255);

  // 将 RGB 转换为十六进制
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

// 辅助函数：将 H 转换为 RGB
function hueToRgb(p, q, h) {
  if (h < 0) h += 360;
  if (h >= 360) h -= 360;
  if (h < 60) return p + (q - p) * h / 60;
  if (h < 180) return q;
  if (h < 240) return p + (q - p) * (240 - h) / 60;
  return p;
}