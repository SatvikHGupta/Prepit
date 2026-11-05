// Reads the live theme tokens so charts always use the page's own colours (any mode, any accent).
export function readTheme(el = document.documentElement) {
  const cs = getComputedStyle(el);
  const v = (n) => cs.getPropertyValue(`--${n}`).trim();
  return {
    accent: v('accent'),
    accentRgb: v('accent-rgb'),
    link: v('accent-link'),
    text: v('text'),
    muted: v('text-muted'),
    border: v('border'),
    borderStrong: v('border-strong'),
    surface: v('surface'),
    easy: v('easy'),
    medium: v('medium'),
    hard: v('hard'),
    // the font is set on body, not on the root element
    font: getComputedStyle(document.body).fontFamily,
  };
}
