/**
 * Kök rota — kiosk akışının başlangıcı her zaman karşılama ekranıdır.
 * (Uygulama açılışında ve derin bağlantıda oturum/hesap kontrolü yoktur.)
 */

import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/onboarding/welcome" />;
}
