/**
 * Admin bölümü — PIN kapılı yığın. Kilit açılmadan hiçbir admin ekranı render edilmez;
 * bölümden çıkınca kilit otomatik sıfırlanır (§35: admin yalnız yetkiliye açık).
 */

import { createContext, useContext, useState, type ReactNode } from 'react';
import { Redirect, Stack, useSegments } from 'expo-router';

interface AdminGate {
  unlocked: boolean;
  unlock: () => void;
}

const AdminGateContext = createContext<AdminGate>({ unlocked: false, unlock: () => undefined });

export function useAdminGate(): AdminGate {
  return useContext(AdminGateContext);
}

export default function AdminLayout() {
  const [unlocked, setUnlocked] = useState(false);
  const segments = useSegments();
  const onLoginScreen = segments[segments.length - 1] === 'login';

  if (!unlocked && !onLoginScreen) {
    return <Redirect href="/admin/login" />;
  }

  let content: ReactNode = (
    <Stack screenOptions={{ headerShown: false }} />
  );

  return (
    <AdminGateContext.Provider value={{ unlocked, unlock: () => setUnlocked(true) }}>
      {content}
    </AdminGateContext.Provider>
  );
}
