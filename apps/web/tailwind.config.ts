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
        'moss-light': brand.mossLight,
        'moss-dim': brand.mossDim,
        glacier: brand.ice,
        'glacier-light': brand.iceLight,
        'glacier-dim': brand.iceDim,
        sienna: brand.sienna,
        'sienna-light': brand.siennaLight,
        'sienna-dim': brand.siennaDim,
        obsidian: brand.obsidian,
      },
      fontFamily: {
        display: [fontFamily.display],
        mono: [fontFamily.mono],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '1.4', letterSpacing: '0.05em' }],
        xs: ['11px', { lineHeight: '1.6' }],
        sm: ['12px', { lineHeight: '1.7' }],
        base: ['13px', { lineHeight: '1.7' }],
        md: ['14px', { lineHeight: '1.6' }],
        lg: ['16px', { lineHeight: '1.5' }],
        xl: ['20px', { lineHeight: '1.3' }],
        '2xl': ['24px', { lineHeight: '1.2' }],
        '3xl': ['32px', { lineHeight: '1.1' }],
      },
      boxShadow: {
        card: '0 1px 3px rgba(13,15,18,0.06), 0 1px 2px rgba(13,15,18,0.04)',
        'card-md': '0 4px 12px rgba(13,15,18,0.08), 0 1px 3px rgba(13,15,18,0.05)',
        'card-lg': '0 8px 24px rgba(13,15,18,0.10), 0 2px 6px rgba(13,15,18,0.06)',
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
} satisfies Config;
