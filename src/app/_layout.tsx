/**
 * Kök layout — fontlar, veri sağlayıcı ve tam ekran yığın.
 * Uygulama ışıltılı cam diliyle tasarlandığı için koyu tema kilitli (light-only).
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  Baloo2_600SemiBold,
  Baloo2_700Bold,
  useFonts as useBalooFonts,
} from '@expo-google-fonts/baloo-2';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts as useNunitoFonts,
} from '@expo-google-fonts/nunito';

import { StoreProvider } from '@/data/provider';
import { palette } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [balooLoaded, balooError] = useBalooFonts({ Baloo2_600SemiBold, Baloo2_700Bold });
  const [nunitoLoaded, nunitoError] = useNunitoFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  const ready = (balooLoaded && nunitoLoaded) || balooError || nunitoError;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StoreProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: palette.white },
          }}
        />
      </StoreProvider>
    </GestureHandlerRootView>
  );
}
