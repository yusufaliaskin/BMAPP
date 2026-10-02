/**
 * Admin — Katılımcılar (§22, kiosk uyarlaması): sınıf/şube filtresi + isim/kod arama.
 * Her satır benzersiz bir katılımcı sonucudur; en iyi puan yoktur — tek test vardır.
 */

import { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard } from '@/components/glass/GlassCard';
import { AvatarBubble } from '@/components/ui/AvatarBubble';
import { Chip } from '@/components/ui/Chip';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/states';
import { TextField } from '@/components/ui/TextField';
import { useClasses, useResults } from '@/data/hooks';
import type { Grade } from '@/domain/models';
import { formatDateTimeTR } from '@/lib/format';
import { emojiForCode } from '@/lib/participant';
import { palette, space, type } from '@/theme';

export default function AdminParticipantsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ grade?: string; section?: string }>();
  const results = useResults();
  const classes = useClasses();

  const [grade, setGrade] = useState<Grade | null>(
    params.grade ? (Number(params.grade) as Grade) : null,
  );
  const [section, setSection] = useState<string | null>(params.section ?? null);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr');
    return results
      .filter((result) => (grade === null ? true : result.grade === grade))
      .filter((result) =>
        section === null
          ? true
          : result.classId === `${grade ?? result.grade}${section}`,
      )
      .filter((result) =>
        q.length === 0
          ? true
          : result.displayName.toLocaleLowerCase('tr').includes(q) ||
            result.participantCode.toLocaleLowerCase('tr').includes(q),
      )
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  }, [results, grade, section, query]);

  const sectionsForGrade = grade
    ? classes.filter((c) => c.grade === grade && c.isActive)
    : [];

  return (
    <Screen title={`Katılımcılar (${filtered.length})`} onBack={() => router.back()} scroll>
      <View style={styles.container}>
        <TextField
          label="Ara"
          placeholder="İsim veya katılımcı no (ör. 9F3A-72K1)…"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />

        <View style={styles.filters}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            <Chip
              label="Tüm Sınıflar"
              selected={grade === null}
              onPress={() => {
                setGrade(null);
                setSection(null);
              }}
            />
            {([1, 2, 3, 4] as Grade[]).map((g) => (
              <Chip
                key={g}
                label={`${g}. Sınıf`}
                selected={grade === g}
                onPress={() => {
                  setGrade(g);
                  setSection(null);
                }}
              />
            ))}
          </ScrollView>
          {grade !== null ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              <Chip
                label="Tüm Şubeler"
                selected={section === null}
                onPress={() => setSection(null)}
              />
              {sectionsForGrade.map((item) => (
                <Chip
                  key={item.id}
                  label={item.section}
                  selected={section === item.section}
                  onPress={() => setSection(item.section)}
                />
              ))}
            </ScrollView>
          ) : null}
        </View>

        {filtered.length === 0 ? (
          <EmptyState
            emoji="🧑‍🎓"
            title="Katılımcı bulunamadı"
            message={
              results.length === 0
                ? 'Henüz katılımcı yok. Çocuklar testi tamamladıkça sonuçlar burada listelenir.'
                : 'Bu filtreyle eşleşen katılımcı yok. Farklı bir arama ya da filtre dene.'
            }
          />
        ) : (
          <View style={styles.list}>
            {filtered.map((result, index) => (
              <Reveal key={result.id} delay={Math.min(index * 30, 300)}>
                <PressableScale
                  accessibilityRole="button"
                  accessibilityLabel={`${result.displayName}, ${result.grade}/${result.classId.replace(/^\d/, '')}, ${result.score} puan`}
                  haptic="light"
                  onPress={() => router.push(`/admin/participant/${result.id}`)}
                >
                  <GlassCard padded={false}>
                    <View style={styles.row}>
                      <AvatarBubble emoji={emojiForCode(result.participantCode)} size={44} />
                      <View style={styles.rowText}>
                        <Text style={[type.bodyBold, { color: palette.ink }]} numberOfLines={1}>
                          {result.displayName}
                        </Text>
                        <Text style={[type.caption, { color: palette.inkFaint }]} numberOfLines={1}>
                          {result.participantCode} · {result.grade}/
                          {result.classId.replace(/^\d/, '')}
                        </Text>
                      </View>
                      <View style={styles.rowRight}>
                        <Text style={[type.h3, { color: palette.rewardDeep }]}>
                          ⭐ {result.score}
                        </Text>
                        <Text style={[type.caption, { color: palette.inkFaint }]}>
                          {formatDateTimeTR(result.completedAt)}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={palette.inkFaint} />
                    </View>
                  </GlassCard>
                </PressableScale>
              </Reveal>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: space.md,
  },
  filters: {
    gap: space.sm,
  },
  chips: {
    gap: space.sm,
    paddingRight: space.lg,
  },
  list: {
    gap: space.sm,
    marginTop: space.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
});
