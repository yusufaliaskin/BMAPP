/**
 * Sıralama — sınıf seviyeleri ayrı listeler (§16); şube filtresi ve
 * öğrenciler/şubeler görünüm anahtarı. Gizlilik: yalnız karakter + lakap gösterilir (§7, §35).
 */

import { useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { LeaderboardRow } from '@/components/ui/LeaderboardRow';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { EmptyState } from '@/components/ui/states';
import { useClasses, useClassesForGrade, useConfig, useCurrentStudent, useStudents, useResults } from '@/data/hooks';
import type { Grade } from '@/domain/models';
import { rankForGrade, rankOf, sectionStandings } from '@/domain/engine/ranking';
import { medalForRank } from '@/domain/engine/certificates';
import { glassSurface, palette, radius, space, type } from '@/theme';

const GRADE_OPTIONS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
] as const;

export default function LeaderboardScreen() {
  const router = useRouter();
  const student = useCurrentStudent();
  const config = useConfig();
  const results = useResults();
  const students = useStudents();
  const classes = useClasses();

  const [grade, setGrade] = useState<Grade>(student?.grade ?? 1);
  const [section, setSection] = useState<string | null>(null);
  const [view, setView] = useState<'students' | 'sections'>('students');

  const gradeClasses = useClassesForGrade(grade);

  if (!student) return <Redirect href="/onboarding/welcome" />;

  const allRanked = rankForGrade(results, students, grade, config);
  const ranked = section
    ? allRanked.filter((entry) => {
        const owner = students.find((s) => s.id === entry.studentId);
        return owner?.classId === `${grade}${section}`;
      })
    : allRanked;
  const myRank = grade === student.grade ? rankOf(allRanked, student.id) : undefined;
  const standings = sectionStandings(results, students, classes, grade, config);

  return (
    <Screen scroll>
      <View style={styles.container}>
        <Reveal>
          <Text style={[type.h1, { color: palette.ink }]}>🏆 Sıralama</Text>
        </Reveal>

        <Reveal delay={60} style={styles.controls}>
          <SegmentedControl
            accessibilityLabel="Sınıf seviyesi seçimi"
            options={GRADE_OPTIONS.map((option) => ({ ...option }))}
            value={grade}
            onChange={(value) => {
              setGrade(value);
              setSection(null);
            }}
          />
          <SegmentedControl
            accessibilityLabel="Görünüm seçimi"
            options={[
              { value: 'students', label: '👦 Öğrenciler' },
              { value: 'sections', label: '🏫 Şubeler' },
            ]}
            value={view}
            onChange={(value) => setView(value as 'students' | 'sections')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            <Chip label="Tüm Şubeler" selected={section === null} onPress={() => setSection(null)} />
            {gradeClasses.map((item) => (
              <Chip
                key={item.id}
                label={`${item.grade}/${item.section}`}
                selected={section === item.section}
                onPress={() => setSection(item.section)}
              />
            ))}
          </ScrollView>
        </Reveal>

        {myRank && view === 'students' ? (
          <Reveal delay={100}>
            <View style={[styles.myRankRow, glassSurface('strong')]}>
              <Text style={[type.bodyBold, { color: palette.ink }]}>
                {medalForRank(myRank.rank)} Senin yerin: {myRank.rank}.
              </Text>
              <Text style={[type.bodySemi, { color: palette.inkSoft }]}>
                {myRank.score} puan
              </Text>
            </View>
          </Reveal>
        ) : null}

        {view === 'students' ? (
          ranked.length > 0 ? (
            <View style={styles.list}>
              {ranked.map((entry, index) => {
                const owner = students.find((s) => s.id === entry.studentId);
                if (!owner) return null;
                return (
                  <Reveal key={entry.studentId} delay={Math.min(140 + index * 35, 420)}>
                    <LeaderboardRow
                      rank={entry.rank}
                      emoji={owner.emoji}
                      nickname={owner.nickname}
                      section={`${owner.grade}/${owner.classId.replace(String(owner.grade), '')}`}
                      score={entry.score}
                      isMe={owner.id === student.id}
                    />
                  </Reveal>
                );
              })}
            </View>
          ) : (
            <EmptyState
              emoji="🌱"
              title="Henüz sıralama yok"
              message="Bu sınıfta ilk testi çözen sen ol, listeyi sen başlat!"
              actionLabel="TESTE BAŞLA 🚀"
              onAction={() => router.push('/test/start')}
            />
          )
        ) : standings.length > 0 ? (
          <View style={styles.list}>
            {standings.map((standing, index) => (
              <Reveal key={standing.classId} delay={Math.min(140 + index * 35, 420)}>
                <View style={[styles.sectionRow, glassSurface('subtle')]}>
                  <View style={styles.sectionRank}>
                    <Text style={[type.label, { color: palette.inkSoft }]}>
                      {medalForRank(index + 1)}
                    </Text>
                  </View>
                  <View style={styles.sectionName}>
                    <Text style={[type.bodyBold, { color: palette.ink }]}>
                      {standing.grade}/{standing.section}
                    </Text>
                    <Text style={[type.caption, { color: palette.inkFaint }]}>
                      👥 {standing.participants} katılımcı · ort. {standing.averageScore}
                    </Text>
                  </View>
                  <View style={styles.sectionScore}>
                    <Text style={[type.h3, { color: palette.ink }]}>{standing.totalScore}</Text>
                    <Text style={[type.caption, { color: palette.inkFaint }]}>toplam</Text>
                  </View>
                </View>
              </Reveal>
            ))}
          </View>
        ) : (
          <EmptyState
            emoji="🏫"
            title="Şube sıralaması henüz boş"
            message="Testler çözüldükçe şubelerin toplam puanları burada yarışacak."
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: space.lg,
    paddingTop: space.sm,
  },
  controls: {
    gap: space.md,
  },
  chips: {
    gap: space.sm,
    paddingRight: space.lg,
  },
  myRankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  list: {
    gap: space.sm,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.lg,
  },
  sectionRank: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionName: {
    flex: 1,
    gap: 2,
  },
  sectionScore: {
    alignItems: 'flex-end',
  },
});
