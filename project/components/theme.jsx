// Design tokens + palette

const THEMES = {
  dark: {
    bg: '#0B0B0F',
    bg2: '#15151C',
    surface: '#1C1C25',
    surface2: '#242430',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.14)',
    text: '#F4F4F7',
    textDim: 'rgba(244,244,247,0.62)',
    textFaint: 'rgba(244,244,247,0.38)',
    accent: '#7C8CFF',
    danger: '#FF6B6B',
    success: '#5BD68A',
    scrim: 'rgba(0,0,0,0.55)',
  },
  light: {
    bg: '#F4F4F7',
    bg2: '#EBEBF0',
    surface: '#FFFFFF',
    surface2: '#F8F8FB',
    border: 'rgba(0,0,0,0.08)',
    borderStrong: 'rgba(0,0,0,0.14)',
    text: '#0B0B0F',
    textDim: 'rgba(11,11,15,0.62)',
    textFaint: 'rgba(11,11,15,0.4)',
    accent: '#4556E5',
    danger: '#E03F3F',
    success: '#2FA35C',
    scrim: 'rgba(0,0,0,0.35)',
  },
};

// Desaturated, tasteful card colors (darker, richer than the reference)
const PLAYER_COLORS = [
  { name: 'Indigo',   base: '#4E5BC4', glow: '#6B7AE0', ink: '#F3F4FF' },
  { name: 'Violet',   base: '#7D4EB5', glow: '#A070D2', ink: '#F8F2FF' },
  { name: 'Rose',     base: '#B94877', glow: '#DC6894', ink: '#FFF1F6' },
  { name: 'Coral',    base: '#C4573F', glow: '#E17A5F', ink: '#FFF2EE' },
  { name: 'Amber',    base: '#B88127', glow: '#E0A250', ink: '#FFF6E5' },
  { name: 'Emerald',  base: '#3B8F6A', glow: '#5FB088', ink: '#EEFBF4' },
  { name: 'Teal',     base: '#2E8A99', glow: '#4FB0C0', ink: '#EBFBFE' },
  { name: 'Slate',    base: '#546478', glow: '#788A9E', ink: '#F0F3F7' },
];

// Light-mode card palette (a bit punchier because bg is light)
const PLAYER_COLORS_LIGHT = [
  { name: 'Indigo',   base: '#5B6BDA', glow: '#8593F0', ink: '#FFFFFF' },
  { name: 'Violet',   base: '#9056D2', glow: '#B98AEB', ink: '#FFFFFF' },
  { name: 'Rose',     base: '#D45585', glow: '#F17BA5', ink: '#FFFFFF' },
  { name: 'Coral',    base: '#DE6244', glow: '#F38769', ink: '#FFFFFF' },
  { name: 'Amber',    base: '#D4952B', glow: '#EEB658', ink: '#FFFFFF' },
  { name: 'Emerald',  base: '#45A67A', glow: '#6CC69A', ink: '#FFFFFF' },
  { name: 'Teal',     base: '#369BAA', glow: '#5BBCCB', ink: '#FFFFFF' },
  { name: 'Slate',    base: '#637489', glow: '#8897AA', ink: '#FFFFFF' },
];

const getPalette = (dark) => dark ? PLAYER_COLORS : PLAYER_COLORS_LIGHT;

Object.assign(window, { THEMES, PLAYER_COLORS, PLAYER_COLORS_LIGHT, getPalette });
