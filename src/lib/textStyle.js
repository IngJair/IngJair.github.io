export const FONT_FAMILIES = [
  {
    group: 'Elegantes y editoriales',
    options: [
      { label: 'Playfair Display', value: 'Playfair Display' },
      { label: 'Cormorant Garamond', value: 'Cormorant Garamond' },
      { label: 'DM Serif Display', value: 'DM Serif Display' },
      { label: 'Bodoni Moda', value: 'Bodoni Moda' },
      { label: 'Cinzel', value: 'Cinzel' },
    ],
  },
  {
    group: 'Modernas y limpias',
    options: [
      { label: 'Montserrat', value: 'Montserrat' },
      { label: 'Poppins', value: 'Poppins' },
      { label: 'Raleway', value: 'Raleway' },
      { label: 'Manrope', value: 'Manrope' },
      { label: 'Lato', value: 'Lato' },
      { label: 'Open Sans', value: 'Open Sans' },
    ],
  },
  {
    group: 'Manuscritas y románticas',
    options: [
      { label: 'Great Vibes', value: 'Great Vibes' },
      { label: 'Dancing Script', value: 'Dancing Script' },
      { label: 'Allura', value: 'Allura' },
    ],
  },
];

const FONT_STACKS = {
  'Playfair Display': '"Playfair Display", Georgia, serif',
  'Cormorant Garamond': '"Cormorant Garamond", Georgia, serif',
  'DM Serif Display': '"DM Serif Display", Georgia, serif',
  'Bodoni Moda': '"Bodoni Moda", "Times New Roman", serif',
  Cinzel: '"Cinzel", Georgia, serif',
  Montserrat: '"Montserrat", Arial, sans-serif',
  Poppins: '"Poppins", Arial, sans-serif',
  Raleway: '"Raleway", Arial, sans-serif',
  Manrope: '"Manrope", Arial, sans-serif',
  Lato: '"Lato", Arial, sans-serif',
  'Open Sans': '"Open Sans", Arial, sans-serif',
  'Great Vibes': '"Great Vibes", cursive',
  'Dancing Script': '"Dancing Script", cursive',
  Allura: '"Allura", cursive',
};

const TEXT_SHADOWS = {
  none: 'none',
  soft: '0 3px 14px rgba(0, 0, 0, 0.35)',
  cinematic: '0 2px 2px rgba(0, 0, 0, 0.72), 0 8px 24px rgba(0, 0, 0, 0.42)',
  glow: '0 0 18px rgba(255, 255, 255, 0.58)',
  gold: '0 1px 0 rgba(255, 238, 170, 0.82), 0 5px 18px rgba(191, 149, 63, 0.5)',
};

export const TEXT_STYLE_PRESETS = [
  {
    id: 'editorial',
    name: 'Editorial',
    sample: 'Aa',
    style: {
      fontFamily: 'Cormorant Garamond',
      bold: false,
      italic: false,
      letterSpacing: '0.01em',
      lineHeight: '1.1',
      textTransform: 'none',
      effect: 'soft',
    },
  },
  {
    id: 'modern',
    name: 'Moderno',
    sample: 'AA',
    style: {
      fontFamily: 'Montserrat',
      bold: true,
      italic: false,
      letterSpacing: '0.08em',
      lineHeight: '1.18',
      textTransform: 'uppercase',
      effect: 'none',
    },
  },
  {
    id: 'romantic',
    name: 'Romántico',
    sample: 'Elky',
    style: {
      fontFamily: 'Great Vibes',
      bold: false,
      italic: false,
      letterSpacing: '0.02em',
      lineHeight: '1.12',
      textTransform: 'none',
      effect: 'soft',
    },
  },
  {
    id: 'cinematic',
    name: 'Cine',
    sample: 'ELKY',
    style: {
      fontFamily: 'Cinzel',
      bold: true,
      italic: false,
      letterSpacing: '0.12em',
      lineHeight: '1.18',
      textTransform: 'uppercase',
      effect: 'cinematic',
    },
  },
];

export function applyTextStyle(styleObj, baseStyle = {}) {
  const style = styleObj || {};

  return {
    ...baseStyle,
    fontSize: style.fontSize || baseStyle.fontSize,
    fontFamily: style.fontFamily
      ? (FONT_STACKS[style.fontFamily] || style.fontFamily)
      : baseStyle.fontFamily,
    fontWeight: style.bold ? 900 : (baseStyle.fontWeight || 400),
    fontStyle: style.italic ? 'italic' : (baseStyle.fontStyle || 'normal'),
    textDecoration: style.underline
      ? 'underline'
      : (baseStyle.textDecoration || 'none'),
    color: style.color || baseStyle.color,
    textAlign: style.textAlign || baseStyle.textAlign,
    letterSpacing: style.letterSpacing || baseStyle.letterSpacing,
    lineHeight: style.lineHeight || baseStyle.lineHeight,
    textTransform: style.textTransform || baseStyle.textTransform,
    textShadow: Object.prototype.hasOwnProperty.call(TEXT_SHADOWS, style.effect)
      ? TEXT_SHADOWS[style.effect]
      : baseStyle.textShadow,
  };
}
