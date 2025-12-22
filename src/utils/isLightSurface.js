// WCAG-relative luminance calculation
export function isLightSurface(color) {
  if (!color || typeof color !== "string") return false;

  // Extract RGB from hex or rgba
  let r, g, b;

  if (color.startsWith("#")) {
    r = parseInt(color.slice(1, 3), 16);
    g = parseInt(color.slice(3, 5), 16);
    b = parseInt(color.slice(5, 7), 16);
  } else if (color.startsWith("rgba") || color.startsWith("rgb")) {
    const m = color.match(/\d+/g);
    if (!m || m.length < 3) return false;
    [r, g, b] = m.map(Number);
  } else {
    return false;
  }

  // Convert to relative luminance
  const toLinear = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  const L =
    0.2126 * toLinear(r) +
    0.7152 * toLinear(g) +
    0.0722 * toLinear(b);

  // WCAG threshold
  return L > 0.6;
}
