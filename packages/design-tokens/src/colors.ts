/**
 * Source: aonikenk.dev Brand Manual v2.0 — "Principal Claro" variant.
 * Do not edit values here without updating the brand manual first.
 */

export const brand = {
  sienna: '#C0623A',
  ember: '#E07A52',
  moss: '#3D6B4F',
  ice: '#7BAFC4',
  obsidian: '#0D0F12',
} as const;

export const surface = {
  bg: '#F0F4F8',
  surface: '#FFFFFF',
  surface2: '#E8EDF4',
  border: '#D0D8E4',
  text: '#0D0F12',
  text2: '#2A3140',
  muted: '#4A5568',
  subtle: '#8896A8',
} as const;

export const product = {
  primary: brand.moss,
  accent: brand.ice,
  warm: brand.sienna,
} as const;
