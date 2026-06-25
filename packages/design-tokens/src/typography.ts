export const fontFamily = {
  display: "'Syne', sans-serif",
  mono: "'DM Mono', monospace",
} as const;

export const fontWeight = {
  display: {
    regular: 600,
    bold: 700,
    black: 800,
  },
  mono: {
    light: 300,
    regular: 400,
    medium: 500,
  },
} as const;

export const typeScale = {
  display: { size: '44px', weight: fontWeight.display.black, tracking: '-0.04em' },
  h1: { size: '30px', weight: fontWeight.display.bold, tracking: '-0.03em' },
  h2: { size: '20px', weight: fontWeight.display.regular, tracking: '-0.02em' },
  body: { size: '13px', weight: fontWeight.mono.regular, tracking: 'normal' },
  label: { size: '10px', weight: fontWeight.mono.regular, tracking: '0.2em' },
} as const;
