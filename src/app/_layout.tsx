import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ExportHost } from '@/components/canvas/ExportHost';
import { ToastHost } from '@/components/ui/Toast';
import { waitForHydration } from '@/store/hydration';
import { FONT_ASSETS } from '@/theme/fontAssets';
import { colors } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

// No Expo Go o plugin do expo-font não age; carregamos as fontes em JS. Em build nativo, nada a carregar.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export default function RootLayout() {
  const [hydrated, setHydrated] = useState(false);
  const [fontsLoaded] = useFonts(isExpoGo ? FONT_ASSETS : {});
  const ready = hydrated && fontsLoaded;

  useEffect(() => {
    let cancelled = false;
    waitForHydration().finally(() => {
      if (!cancelled) setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="templates" />
            <Stack.Screen name="editor" />
            <Stack.Screen name="result" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="dev-canvas" />
            <Stack.Screen name="pro" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          </Stack>
          <ExportHost />
          <ToastHost />
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
