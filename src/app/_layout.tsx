/**
 * Kök layout — fontlar, veri sağlayıcı ve tam ekran yığın.
 * Uygulama ışıltılı cam diliyle tasarlandığı için koyu tema kilitli (light-only).
 */

import { useEffect } from 'react';
import { Stack, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useKeepAwake } from 'expo-keep-awake';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// Yalnız kullanılan ağırlıklar alt yoldan (subpath) alınır: kullanılmayan
// font dosyaları pakete girmesin (Metro kök paketi komple bundle ediyor).
import { Baloo2_600SemiBold } from '@expo-google-fonts/baloo-2/600SemiBold';
import { Baloo2_700Bold } from '@expo-google-fonts/baloo-2/700Bold';
import { DancingScript_700Bold } from '@expo-google-fonts/dancing-script/700Bold';
import { Nunito_400Regular } from '@expo-google-fonts/nunito/400Regular';
import { Nunito_600SemiBold } from '@expo-google-fonts/nunito/600SemiBold';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito/800ExtraBold';
import { PlayfairDisplay_400Regular } from '@expo-google-fonts/playfair-display/400Regular';
import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display/700Bold';

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
  const [fontsLoaded, fontError] = useFonts({
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    // Sertifikanın klasik dili: serif başlık + el yazısı ad.
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    DancingScript_700Bold,
  });

  const ready = fontsLoaded || fontError !== null;
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
        >
          {/*
            Kiosk akışında kenardan kaydırma ile geri gitme KAPALI: çocuk parmağıyla
            yanlışlıkla akıştan düşmesin. Geri dönüş yalnız üstteki geri düğmesiyle ve
            "Çıkmak istiyor musunuz?" onayıyla yapılır.
          */}
          <Stack.Screen name="onboarding/name" options={{ gestureEnabled: false }} />
          <Stack.Screen name="onboarding/grade" options={{ gestureEnabled: false }} />
          <Stack.Screen name="test/start" options={{ gestureEnabled: false }} />
          <Stack.Screen name="test/question" options={{ gestureEnabled: false }} />
          <Stack.Screen name="test/result" options={{ gestureEnabled: false }} />
        </Stack>
      </StoreProvider>
    </GestureHandlerRootView>
  );
}
