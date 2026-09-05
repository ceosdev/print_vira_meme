import type { ExpoConfig } from 'expo/config';

/**
 * Fontes embarcadas (assets/fonts). Lista inline porque o carregador de config do Expo resolve
 * imports com `require` puro (não enxerga .ts). O teste src/__tests__/appConfig.test.ts garante
 * que ela é idêntica a FONT_FILES em src/theme/fonts.ts.
 */
const FONT_FILES = [
  './assets/fonts/Anton-Regular.ttf',
  './assets/fonts/BebasNeue-Regular.ttf',
  './assets/fonts/Oswald-Bold.ttf',
  './assets/fonts/Oswald-Medium.ttf',
  './assets/fonts/Rubik-Regular.ttf',
  './assets/fonts/Rubik-Medium.ttf',
  './assets/fonts/Rubik-Bold.ttf',
  './assets/fonts/Rubik-Black.ttf',
  './assets/fonts/Bangers-Regular.ttf',
  './assets/fonts/LilitaOne-Regular.ttf',
  './assets/fonts/ArchivoBlack-Regular.ttf',
  './assets/fonts/PermanentMarker-Regular.ttf',
];

const config: ExpoConfig = {
  name: 'Print Vira Meme',
  slug: 'print-vira-meme',
  version: '0.1.0',
  scheme: 'printvirameme',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  icon: './assets/icon.png',
  android: {
    package: 'com.cartech.printvirameme',
    adaptiveIcon: {
      foregroundImage: './assets/android-icon-foreground.png',
      monochromeImage: './assets/android-icon-monochrome.png',
      backgroundColor: '#FFD60A',
    },
  },
  plugins: [
    'expo-router',
    ['expo-splash-screen', { image: './assets/splash-icon.png', backgroundColor: '#0F0F14', imageWidth: 200 }],
    ['expo-font', { fonts: FONT_FILES }],
  ],
};

export default config;
