import type { Config } from 'tailwindcss';
import { DESIGN_SYSTEM } from '@merko/ui';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: DESIGN_SYSTEM.colors.primary,
        secondary: DESIGN_SYSTEM.colors.secondary,
      },
      borderRadius: {
        lg: DESIGN_SYSTEM.borderRadius.lg,
        md: DESIGN_SYSTEM.borderRadius.md,
        sm: DESIGN_SYSTEM.borderRadius.sm,
      },
      fontFamily: {
        sans: [DESIGN_SYSTEM.fonts.sans],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
