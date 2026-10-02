/**
 * Kök layout — fontlar, veri sağlayıcı ve tam ekran yığın.
 * Uygulama ışıltılı cam diliyle tasarlandığı için koyu tema kilitli (light-only).
 */

import { useEffect } from 'react';
import { Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useKeepAwake } from 'expo-keep-awake';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  Baloo2_600SemiBold,
  Baloo2_700Bold,
  useFonts as useBalooFonts,
} from '@expo-google-fonts/baloo-2';
import {
  DancingScript_400Regular,
  DancingScript_700Bold,
} from '@expo-google-fonts/dancing-script';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts as useNunitoFonts,
} from '@expo-google-fonts/nunito';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';

import { StoreProvider } from '@/data/provider';
import { palette } from '@/theme';

SplashScreen.preventAutoHideAsync();

const KIOSK_TAG = 'bilincli-kahraman-kiosk';

/**
 * Kiosk akışında (isim → sınıf → test → sonuç) ekran uykuya geçmez; stand
 * uzun süre dokunulmadan beklerse de çocuk testini yarıda kaybetmez.
 * Yönetim panelinde ve boşta kilit serbest bırakılır.
 */
function KioskWakeLock() {
  useKeepAwake(KIOSK_TAG);
  return null;
}

export default function RootLayout() {
  const [balooLoaded, balooError] = useBalooFonts({
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    // Sertifikanın klasik dili: serif başlık + el yazısı ad.
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    DancingScript_400Regular,
    DancingScript_700Bold,
  });
  const [nunitoLoaded, nunitoError] = useNunitoFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  const ready = (balooLoaded && nunitoLoaded) || balooError || nunitoError;
  const segments = useSegments();
  const inKioskFlow = segments[0] === 'onboarding' || segments[0] === 'test';

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StoreProvider>
        <StatusBar style="dark" />
        {inKioskFlow ? <KioskWakeLock /> : null}
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: palette.white },
            animation: 'slide_from_right',
            gestureEnabled: true,
          }}
        />
      </StoreProvider>
    </GestureHandlerRootView>
  );
}
