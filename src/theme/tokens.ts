export const colors = {
  bg: '#0F0F14',
  surface: '#1A1A22',
  surface2: '#26262F',
  border: '#2E2E3A',
  text: '#FFFFFF',
  textMuted: '#A1A1AA',
  textDisabled: '#5F5F6B',
  primary: '#FFD60A',
  primaryPressed: '#E6BF00',
  onPrimary: '#0F0F14',
  proStart: '#7C3AED',
  proEnd: '#EC4899',
  proSolid: '#F472B6',
  success: '#22C55E',
  danger: '#EF4444',
  overlay: 'rgba(0,0,0,0.6)',
} as const;

export const proGradient = [colors.proStart, colors.proEnd] as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 40 } as const;

export const radius = { card: 16, button: 14, pill: 999, sheet: 24, canvas: 12, badge: 6, hero: 20, field: 12 } as const;

export const sizes = {
  header: 56,
  buttonPrimary: 56,
  buttonSecondary: 48,
  buttonGhost: 44,
  chip: 36,
  listItem: 56,
  touchTarget: 48,
  fontChip: 48,
  cardCarouselWidth: 140,
} as const;

export const durations = { press: 150, sheet: 250, screen: 350 } as const;
