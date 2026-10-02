/**
 * LeaderboardRow — sıralama satırı. İlk üç: madalya balonu (renk + emoji);
 * diğerleri #sıra. Kendi satırın "Sen" rozetiyle vurgulanır.
 * Performans: blur yok, hafif cam yüzey.
 */

import { StyleSheet, Text, View } from 'react-native';

import { glassSurface, medal, palette, radius, space, type } from '@/theme';

interface LeaderboardRowProps {
  rank: number;
  emoji: string;
  nickname: string;
  section: string;
  score: number;
  isMe?: boolean;
}

function rankStyle(rank: number): { background: string; color: string } {
  if (rank === 1) return { background: medal.goldSoft, color: medal.gold };
  if (rank === 2) return { background: medal.silverSoft, color: medal.silver };
  if (rank === 3) return { background: medal.bronzeSoft, color: medal.bronze };
  return { background: palette.primarySoft, color: palette.inkSoft };
}

export function LeaderboardRow({
  rank,
  emoji,
  nickname,
  section,
  score,
  isMe = false,
}: LeaderboardRowProps) {
  const tone = rankStyle(rank);
  const isTop3 = rank <= 3;

  return (
    <View
      style={[
        styles.row,
        glassSurface(isMe ? 'strong' : 'subtle'),
        isMe ? styles.me : null,
      ]}
      accessibilityLabel={`${rank}. sıra, ${nickname}, ${score} puan${isMe ? ', sen' : ''}`}
    >
      <View style={[styles.rank, { backgroundColor: tone.background }]}>
        {isTop3 ? (
          <Text style={styles.medal} maxFontSizeMultiplier={1.1}>
            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
          </Text>
        ) : (
          <Text style={[type.label, { color: tone.color }]}>{rank}</Text>
        )}
      </View>
      <View style={styles.avatar}>
        <Text style={styles.avatarEmoji} maxFontSizeMultiplier={1.1}>
          {emoji}
        </Text>
      </View>
      <View style={styles.nameCol}>
        <View style={styles.nameRow}>
          <Text
            style={[type.bodyBold, { color: palette.ink }]}
            numberOfLines={1}
            maxFontSizeMultiplier={1.2}
          >
            {nickname}
          </Text>
          {isMe ? (
            <View style={styles.meBadge}>
              <Text style={[type.caption, { color: palette.white }]}>Sen</Text>
            </View>
          ) : null}
        </View>
        <Text style={[type.caption, { color: palette.inkFaint }]}>{section}</Text>
      </View>
      <View style={styles.scoreCol}>
        <Text style={[type.h3, { color: palette.ink }]} maxFontSizeMultiplier={1.2}>
          {score}
        </Text>
        <Text style={[type.caption, { color: palette.inkFaint }]}>puan</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.lg,
  },
  me: {
    borderColor: palette.primary,
    borderWidth: 1.5,
  },
  rank: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medal: {
    fontSize: 20,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 22,
  },
  nameCol: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  meBadge: {
    backgroundColor: palette.primary,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 1,
  },
  scoreCol: {
    alignItems: 'flex-end',
  },
});
