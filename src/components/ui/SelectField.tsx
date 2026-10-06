/**
 * SelectField — tek alanlı seçim (ülke seçici mantığı).
 * Alan, seçili değeri gösterir; dokununca seçenekler bir sayfada açılır.
 * Masaüstünde ortada bir pencere, telefonda alttan açılan sayfa olarak çizilir.
 * Satırlar gruplu listelenir (ör. "1. Sınıf" başlığı → 1/A, 1/B…), 48px dokunma hedefi.
 */

import { useState, type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard } from '@/components/glass/GlassCard';
import { PressableScale } from '@/components/ui/PressableScale';
import { glassSurface, layout, palette, radius, space, surface, type } from '@/theme';

export interface SelectOption {
  value: string;
  label: string;
  /** Aynı grup altında toplanır (ör. "1. Sınıf"). */
  group?: string;
}

interface SelectFieldProps {
  label: string;
  placeholder: string;
  value: string | null;
  options: SelectOption[];
  onChange: (value: string) => void;
  /** Menü başlığı (ör. "Sınıfını seç"). */
  sheetTitle?: string;
  hint?: string;
  error?: string;
  /** Kapalıysa alan dokunulamaz (ör. önce sınıf seçilmeden şube). */
  disabled?: boolean;
  /** Kapalıyken gösterilen kısa açıklama. */
  disabledHint?: string;
  /** Alanın üstünde ek içerik (ör. simge). */
  leading?: ReactNode;
  accessibilityHint?: string;
}

export function SelectField({
  label,
  placeholder,
  value,
  options,
  onChange,
  sheetTitle,
  hint,
  error,
  disabled = false,
  disabledHint,
  accessibilityHint,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const { width } = useWindowDimensions();
  const desktop = width >= layout.phoneWidth;

  const selected = options.find((option) => option.value === value);
  const groups: { name: string | undefined; items: SelectOption[] }[] = [];
  for (const option of options) {
    const last = groups[groups.length - 1];
    if (last && last.name === option.group) last.items.push(option);
    else groups.push({ name: option.group, items: [option] });
  }

  const choose = (next: string) => {
    setOpen(false);
    onChange(next);
  };

  const helper = error ?? (disabled ? disabledHint : hint);

  return (
    <View style={styles.wrap}>
      <Text style={[type.label, { color: palette.inkSoft }]}>{label}</Text>
      <PressableScale
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        accessibilityLabel={`${label}: ${selected ? selected.label : placeholder}`}
        accessibilityHint={
          disabled ? disabledHint : (accessibilityHint ?? 'Seçenek listesini açar')
        }
        haptic="light"
        disabled={disabled}
        onPress={() => setOpen(true)}
      >
        <GlassCard padded={false} outline={error ? palette.coral : undefined}>
          <View style={[styles.field, disabled ? styles.fieldDisabled : null]}>
            <Text
              style={[
                type.h3,
                styles.fieldText,
                { color: selected ? palette.ink : palette.inkFaint },
              ]}
              numberOfLines={1}
            >
              {selected ? selected.label : placeholder}
            </Text>
            <Ionicons
              name="chevron-down"
              size={22}
              color={disabled ? palette.inkFaint : palette.inkSoft}
            />
          </View>
        </GlassCard>
      </PressableScale>
      {helper ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[type.caption, { color: error ? palette.coral : palette.inkFaint }]}
        >
          {helper}
        </Text>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          accessibilityLabel="Seçimi kapat"
          style={[styles.scrim, desktop ? styles.scrimCenter : styles.scrimBottom]}
          onPress={() => setOpen(false)}
        >
          <Pressable style={[styles.sheet, desktop ? styles.sheetDesktop : null]} onPress={() => undefined}>
            <View style={styles.sheetHead}>
              <Text style={[type.h3, { color: palette.ink, flex: 1 }]} numberOfLines={1}>
                {sheetTitle ?? label}
              </Text>
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel="Kapat"
                haptic="light"
                onPress={() => setOpen(false)}
                style={[styles.closeButton, glassSurface('strong')]}
              >
                <Ionicons name="close" size={22} color={palette.ink} />
              </PressableScale>
            </View>
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {groups.map((group) => (
                <View key={group.name ?? 'tek'} style={styles.group}>
                  {group.name ? (
                    <Text style={[type.overline, { color: palette.inkFaint }]}>{group.name}</Text>
                  ) : null}
                  {group.items.map((option) => {
                    const isSelected = option.value === value;
                    return (
                      <PressableScale
                        key={option.value}
                        accessibilityRole="button"
                        accessibilityLabel={option.label}
                        haptic="selection"
                        onPress={() => choose(option.value)}
                        style={styles.option}
                      >
                        <View style={[styles.optionRow, isSelected ? styles.optionRowActive : null]}>
                          <Text
                            style={[
                              type.bodySemi,
                              { color: isSelected ? palette.primary : palette.ink },
                            ]}
                          >
                            {option.label}
                          </Text>
                          {isSelected ? (
                            <Ionicons name="checkmark" size={20} color={palette.primary} />
                          ) : null}
                        </View>
                      </PressableScale>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: space.sm,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: layout.inputHeight,
    paddingHorizontal: space.lg,
  },
  fieldText: {
    flex: 1,
  },
  fieldDisabled: {
    opacity: 0.5,
  },
  scrim: {
    flex: 1,
    backgroundColor: surface.scrim,
    padding: space.lg,
  },
  scrimCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrimBottom: {
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    maxHeight: '76%',
    borderRadius: radius.xl,
    backgroundColor: palette.white,
    overflow: 'hidden',
  },
  sheetDesktop: {
    maxWidth: 460,
  },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderBottomWidth: 1,
    borderBottomColor: palette.primarySoft,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    padding: space.lg,
    gap: space.lg,
  },
  group: {
    gap: space.xs,
  },
  option: {
    minHeight: 48,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    minHeight: 48,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
  },
  optionRowActive: {
    backgroundColor: palette.primarySoft,
  },
});
