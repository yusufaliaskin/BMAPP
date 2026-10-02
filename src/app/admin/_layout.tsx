/**
 * Admin bölümü — PIN kapılı yığın. Kilit açılmadan hiçbir admin ekranı render edilmez;
 * bölümden çıkınca kilit otomatik sıfırlanır (§35: admin yalnız yetkiliye açık).
 * Giriş yapan yöneticinin adı bağlamda taşınır (panelde "Hoş geldin" gösterilir).
 */

import { createContext, useContext, useState, type ReactNode } from 'react';
import { Redirect, Stack, useSegments } from 'expo-router';

interface AdminGate {
  unlocked: boolean;
  /** Giriş yapan yöneticinin görünen adı. */
  adminName: string | null;
  unlock: (adminName: string) => void;
}

const AdminGateContext = createContext<AdminGate>({
  unlocked: false,
  adminName: null,
  unlock: () => undefined,
});

export function useAdminGate(): AdminGate {
  return useContext(AdminGateContext);
}

export default function AdminLayout() {
  const [adminName, setAdminName] = useState<string | null>(null);
  const unlocked = adminName !== null;
  const segments = useSegments();
  const onLoginScreen = segments[segments.length - 1] === 'login';

  if (!unlocked && !onLoginScreen) {
    return <Redirect href="/admin/login" />;
  }

  const content: ReactNode = <Stack screenOptions={{ headerShown: false }} />;

  return (
    <AdminGateContext.Provider
      value={{ unlocked, adminName, unlock: (name: string) => setAdminName(name) }}
    >
      {content}
    </AdminGateContext.Provider>
  );
}
