import type { TextStyle } from 'react-native';

export const uiFont = {
  regular: 'Rubik-Regular',
  medium: 'Rubik-Medium',
  bold: 'Rubik-Bold',
  black: 'Rubik-Black',
} as const;

export const typography = {
  display: { fontFamily: uiFont.black, fontSize: 28, lineHeight: 34, letterSpacing: -0.28 },
  h1: { fontFamily: uiFont.black, fontSize: 24, lineHeight: 30, letterSpacing: -0.24 },
  h2: { fontFamily: uiFont.bold, fontSize: 20, lineHeight: 26 },
  title: { fontFamily: uiFont.bold, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: uiFont.regular, fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: uiFont.medium, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: uiFont.medium, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: uiFont.medium, fontSize: 12, lineHeight: 16 },
} satisfies Record<string, TextStyle>;

export type TypographyStyle = keyof typeof typography;
