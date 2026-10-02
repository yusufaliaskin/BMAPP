/**
 * Admin — Katılımcı detayı (§22, kiosk uyarlaması): benzersiz katılımcı kodu,
 * görünen ad, sınıf/şube, puan, sıra, süre ve SORU SORU CEVAP DÖKÜMÜ.
 * Kayıt değiştirilemez; salt görünüm.
 */

import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { StatCard } from '@/components/ui/StatCard';
import { EmptyState } from '@/components/ui/states';
import {
  useCertificates,
  useClassesForGrade,
  useConfig,
  useQuestions,
  useRankingsFor,
  useResultById,
} from '@/data/hooks';
import { deleteParticipantResult, updateParticipantClass } from '@/data/actions';
import { certificateForParticipant } from '@/domain/engine/certificates';
import { rankOf } from '@/domain/engine/ranking';
import { MEDAL_EMOJI, MEDAL_LABEL, sectionOf, type Grade } from '@/domain/models';
import { formatDateTimeTR, formatDuration } from '@/lib/format';
import { emojiForCode } from '@/lib/participant';
import { glassSurface, palette, radius, space, type } from '@/theme';

const LETTERS = ['A', 'B', 'C', 'D'];

const GRADE_OPTIONS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
] as const;

export default function AdminParticipantDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const result = useResultById(id);
  const questions = useQuestions();
  const certificates = useCertificates();
  const config = useConfig();
  const ranked = useRankingsFor(result?.grade ?? 1, null);

  const [fixGrade, setFixGrade] = useState<Grade>(result?.grade ?? 3);
  const [fixSection, setFixSection] = useState<string | null>(
    result ? sectionOf(result.classId) : null,
  );
  const [fixMessage, setFixMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fixClasses = useClassesForGrade(fixGrade);

  if (!result) {
    return (
      <Screen title="Katılımcı" onBack={() => router.back()}>
        <View style={styles.centerWrap}>
          <EmptyState
            emoji="🔎"
            title="Kayıt bulunamadı"
            message="Bu katılımcı kaydı silinmiş olabilir."
          />
        </View>
      </Screen>
    );
  }

  const myRank = rankOf(ranked, result.id);
  const certificate = certificateForParticipant(certificates, result.participantCode, config.period);
  const section = result.classId.replace(/^\d/, '');

  return (
    <Screen title={result.displayName} onBack={() => router.back()} scroll>
      <View style={styles.container}>
        <Reveal>
          <GlassCard glint level="strong" style={styles.hero}>
            <Text style={styles.avatar} maxFontSizeMultiplier={1.1}>
              {emojiForCode(result.participantCode)}
            </Text>
            <View style={styles.heroText}>
              <Text style={[type.h2, { color: palette.ink }]}>{result.displayName}</Text>
              <Text style={[type.bodySemi, { color: palette.inkSoft }]}>
                {result.grade}/{section} · Katılımcı No: {result.participantCode}
              </Text>
              <Text style={[type.caption, { color: palette.inkFaint }]}>
                {formatDateTimeTR(result.completedAt)} · {formatDuration(result.durationMs)}
              </Text>
            </View>
          </GlassCard>
        </Reveal>

        <Reveal delay={60} style={styles.statsRow}>
          <StatCard
            emoji="⭐"
            value={`${result.score}/${result.maxScore}`}
            label="Puan"
            accent="amber"
          />
          <StatCard
            emoji="🏆"
            value={myRank ? `${myRank.rank}.` : '—'}
            label={`${result.grade}. sınıflar sırası`}
            accent="lavender"
          />
        </Reveal>
        <Reveal delay={90} style={styles.statsRow}>
          <StatCard emoji="✅" value={result.correct} label="Doğru" accent="mint" />
          <StatCard emoji="❌" value={result.wrong} label="Yanlış" accent="coral" />
        </Reveal>

        {certificate ? (
          <Reveal delay={120}>
            <GlassCard style={styles.certCard}>
              <Text style={[type.bodyBold, { color: palette.ink }]}>
                {MEDAL_EMOJI[certificate.medal]} {MEDAL_LABEL[certificate.medal]} Sertifika:{' '}
                {certificate.number}
              </Text>
              <Button
                label="SERTİFİKAYI GÖR"
                variant="glass"
                onPress={() =>
                  router.push(`/admin/certificate?participantCode=${result.participantCode}`)
                }
              />
            </GlassCard>
          </Reveal>
        ) : null}

        <Reveal delay={150}>
          <GlassCard style={styles.answersCard}>
            <Text style={[type.h3, { color: palette.ink }]}>
              📝 Cevap Dökümü ({result.answers.length} soru)
            </Text>
            {result.answers.map((answer, index) => {
              const question = questions.find((q) => q.id === answer.questionId);
              if (!question) return null;
              const chosen =
                answer.selectedIndex >= 0 && answer.selectedIndex < question.options.length
                  ? question.options[answer.selectedIndex]
                  : '—';
              const correctOption = question.options[question.correctIndex];
              return (
                <View key={answer.questionId} style={[styles.answerRow, glassSurface('subtle')]}>
                  <View style={styles.answerHead}>
                    <Text style={styles.answerVisual} maxFontSizeMultiplier={1.1}>
                      {question.visual}
                    </Text>
                    <Text style={[type.bodySemi, styles.answerText, { color: palette.ink }]}>
                      {index + 1}. {question.text}
                    </Text>
                    <Text style={styles.answerMark}>
                      {answer.isCorrect ? '✅' : '❌'}
                    </Text>
                  </View>
                  <Text style={[type.caption, { color: palette.inkSoft }]}>
                    Seçimi: {LETTERS[answer.selectedIndex] ?? '—'}) {chosen}
                  </Text>
                  {!answer.isCorrect ? (
                    <Text style={[type.caption, { color: palette.success }]}>
                      Doğru cevap: {LETTERS[question.correctIndex]}) {correctOption}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </GlassCard>
        </Reveal>

        <Reveal delay={180}>
          <GlassCard style={styles.answersCard}>
            <Text style={[type.h3, { color: palette.ink }]}>🛠️ Sınıfı Düzelt</Text>
            <Text style={[type.caption, { color: palette.inkFaint }]}>
              Yanlış sınıf/şube seçildiyse buradan düzeltilir. Sıralama yeni sınıfa göre işler;
              varsa sertifika kaydı da güncellenir.
            </Text>
            <SegmentedControl
              accessibilityLabel="Sınıf seçimi"
              options={GRADE_OPTIONS.map((option) => ({ ...option }))}
              value={fixGrade}
              onChange={(value) => {
                setFixGrade(value as Grade);
                setFixSection(null);
                setFixMessage(null);
              }}
            />
            <View style={styles.chipsWrap}>
              {fixClasses.map((item) => (
                <Chip
                  key={item.id}
                  label={item.section}
                  selected={fixSection === item.section}
                  onPress={() => {
                    setFixSection(item.section);
                    setFixMessage(null);
                  }}
                />
              ))}
            </View>
            {fixMessage ? (
              <Text style={[type.caption, { color: palette.success }]}>{fixMessage}</Text>
            ) : null}
            <Button
              label="SINIFI KAYDET"
              variant="glass"
              disabled={
                !fixSection || (fixGrade === result.grade && fixSection === section)
              }
              onPress={() => {
                if (!fixSection) return;
                updateParticipantClass(result.id, fixGrade, fixSection);
                setFixMessage(`✅ Sınıf güncellendi: ${fixGrade}/${fixSection}`);
              }}
            />
          </GlassCard>
        </Reveal>

        <Reveal delay={210}>
          <GlassCard style={styles.dangerCard}>
            <Text style={[type.h3, { color: palette.coral }]}>🗑️ Kaydı Sil</Text>
            <Text style={[type.caption, { color: palette.inkSoft }]}>
              Bu katılımcının sonucu ve varsa sertifikası silinir. Bu işlem geri alınamaz.
            </Text>
            {confirmDelete ? (
              <View style={styles.confirmActions}>
                <Button
                  label="EVET, SİL"
                  variant="danger"
                  onPress={() => {
                    deleteParticipantResult(result.id);
                    router.back();
                  }}
                />
                <Button
                  label="VAZGEÇ"
                  variant="glass"
                  onPress={() => setConfirmDelete(false)}
                />
              </View>
            ) : (
              <Button
                label="KAYDI SİL"
                variant="danger"
                onPress={() => setConfirmDelete(true)}
              />
            )}
          </GlassCard>
        </Reveal>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: space.lg,
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
  },
  avatar: {
    fontSize: 44,
  },
  heroText: {
    flex: 1,
    gap: space.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: space.md,
  },
  certCard: {
    gap: space.md,
  },
  answersCard: {
    gap: space.md,
  },
  chipsWrap: {
    flexDirection: 'row',
    gap: space.sm,
  },
  dangerCard: {
    gap: space.md,
    borderColor: palette.coralSoft,
  },
  confirmActions: {
    gap: space.sm,
  },
  answerRow: {
    borderRadius: radius.lg,
    padding: space.md,
    gap: space.xs,
  },
  answerHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  answerVisual: {
    fontSize: 22,
  },
  answerText: {
    flex: 1,
  },
  answerMark: {
    fontSize: 18,
  },
});
