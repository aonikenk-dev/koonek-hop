import type { Config } from 'tailwindcss';
import { brand, surface, fontFamily } from '@koonek/design-tokens';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: surface.bg,
        surface: surface.surface,
        'surface-2': surface.surface2,
        border: surface.border,
        text: surface.text,
        'text-2': surface.text2,
        muted: surface.muted,
        subtle: surface.subtle,
        moss: brand.moss,
        glacier: brand.ice,
        sienna: brand.sienna,
        obsidian: brand.obsidian,
      },
      fontFamily: {
        display: [fontFamily.display],
        mono: [fontFamily.mono],
      },
    },
  },
  plugins: [],
} satisfies Config;
