import type { ExpoConfig } from 'expo/config';

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
  ],
};

export default config;
