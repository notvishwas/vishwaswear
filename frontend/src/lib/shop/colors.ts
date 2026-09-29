const SWATCHES: Record<string, string> = {
  black: "#111827",
  white: "#ffffff",
  ivory: "#f6f0e0",
  grey: "#8a8f98",
  "slate grey": "#5f6b7a",
  charcoal: "#36393f",
  navy: "#1c2b45",
  "midnight navy": "#0f1b2d",
  "light blue": "#a9c6e4",
  pink: "#e9b8c0",
  olive: "#6b6b3a",
  sage: "#a3b18a",
  sand: "#d8c7a3",
  beige: "#cdbb9a",
  camel: "#b5854f",
};

/** Swatch colour for a colour name; unknown names get a neutral tone. */
export function getSwatchColor(name: string): string {
  return SWATCHES[name.trim().toLowerCase()] ?? "#d6c9b1";
}
