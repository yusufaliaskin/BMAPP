/**
 * Karakter seçimi — sıralamada gerçek isim yerine karakter + lakap görünür (§7).
 * Sekiz büyük kart, iki sütun; seçim halka + onay işaretiyle belirtilir.
 */

import { useState } from 'react';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { AvatarBubble } from '@/components/ui/AvatarBubble';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { useCharacters } from '@/data/hooks';
import { palette, radius, space, type } from '@/theme';

export default function CharacterScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name?: string }>();
  const characters = useCharacters();
  const [selected, setSelected] = useState<string | null>(null);

  if (!name) return <Redirect href="/onboarding/welcome" />;

  return (
    <Screen title="" onBack={() => router.back()}>
      <View style={styles.body}>
        <Reveal style={styles.header}>
          <Text style={[type.h1, styles.center, { color: palette.ink }]}>Karakterini seç! 🎈</Text>
          <Text style={[type.bodySemi, styles.center, { color: palette.inkSoft }]}>
            Sıralamada bu karakterle görüneceksin.
          </Text>
        </Reveal>
        <Reveal delay={80} style={styles.grid}>
          {characters.map((character) => {
            const isSelected = selected === character.id;
            return (
              <PressableScale
                key={character.id}
                accessibilityRole="button"
                accessibilityLabel={character.name}
                accessibilityState={{ selected: isSelected }}
                haptic="selection"
                onPress={() => setSelected(character.id)}
                style={styles.cardWrap}
              >
                <GlassCard
                  padded={false}
                  style={[styles.card, isSelected ? styles.cardSelected : null]}
                >
                  <View style={styles.cardInner}>
                    <AvatarBubble emoji={character.emoji} size={54} selected={isSelected} />
                    <Text
                      style={[type.bodyBold, styles.cardLabel, { color: palette.ink }]}
                      numberOfLines={2}
                    >
                      {character.name}
                    </Text>
                  </View>
                </GlassCard>
              </PressableScale>
            );
          })}
        </Reveal>
      </View>
      <Reveal delay={160}>
        <Button
          label="DEVAM ET →"
          disabled={!selected}
          onPress={() => {
            if (selected) {
              router.push({
                pathname: '/onboarding/grade',
                params: { name, character: selected },
              });
            }
          }}
          accessibilityHint="Sınıf seçme ekranına geçer"
        />
      </Reveal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    gap: space.xl,
  },
  header: {
    gap: space.xs,
    marginTop: space.sm,
  },
  center: {
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.md,
  },
  cardWrap: {
    flexGrow: 1,
    flexBasis: '46%',
  },
  card: {
    borderRadius: radius.lg,
  },
  cardSelected: {
    borderColor: palette.primary,
  },
  cardInner: {
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.lg,
    paddingHorizontal: space.sm,
  },
  cardLabel: {
    textAlign: 'center',
  },
});
