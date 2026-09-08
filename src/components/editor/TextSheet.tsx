import { Shuffle } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { catalog } from '@/content';
import { strings } from '@/i18n/strings';
import { services } from '@/services';
import { selectPreset, useCreationStore } from '@/store/creationStore';
import { colors, radius, sizes, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import type { Slot } from '@/types/catalog';

/** Quantas sugestões a lista mostra por vez — o resto vem no "Sortear". */
export const SUGGESTION_COUNT = 12;

interface Props {
  open: boolean;
  slot: Slot | null;
  onClose: () => void;
}

/** Edição de um slot: campo + sugestões do catálogo. O canvas atrás atualiza a cada tecla. */
export function TextSheet({ open, slot, onClose }: Props) {
  const value = useCreationStore((s) => (slot ? (s.values[slot.id] ?? '') : ''));
  const preset = useCreationStore(selectPreset);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  const suggestions = useMemo(() => {
    if (!slot || !preset) return [];
    const list = catalog.suggestionsFor({
      slotType: slot.type,
      maxChars: slot.maxChars,
      category: preset.category,
      tags: preset.tags,
      exclude: value,
    });
    if (shuffleSeed === 0) return list.slice(0, SUGGESTION_COUNT);
    const start = shuffleSeed % Math.max(1, list.length);
    return [...list.slice(start), ...list.slice(0, start)].slice(0, SUGGESTION_COUNT);
  }, [slot, preset, value, shuffleSeed]);

  if (!slot) return <Sheet open={false} onClose={onClose}>{null}</Sheet>;

  const near = value.length >= slot.maxChars * 0.8;

  return (
    <Sheet open={open} onClose={onClose} maxHeightRatio={0.88}>
      <View style={styles.headerRow}>
        <Text style={[typography.label, { color: colors.textMuted }]}>{slot.label}</Text>
        {near ? (
          <Text style={[typography.caption, { color: value.length >= slot.maxChars ? colors.danger : colors.textMuted }]}>
            {value.length}/{slot.maxChars}
          </Text>
        ) : null}
      </View>

      <TextInput
        testID="text-input"
        value={value}
        onChangeText={(text) => {
          useCreationStore.getState().setValue(slot.id, text.slice(0, slot.maxChars));
          services.analytics.track({ name: 'text_edited', slotType: slot.type });
        }}
        multiline={slot.multiline}
        maxLength={slot.maxChars}
        placeholder={slot.placeholder}
        placeholderTextColor={colors.textDisabled}
        autoFocus
        style={[typography.body, styles.input]}
      />

      <View style={styles.headerRow}>
        <Text style={[typography.label, { color: colors.textMuted }]}>{strings.textSheet.suggestions}</Text>
        <Pressable onPress={() => setShuffleSeed((s) => s + 3)} hitSlop={10} accessibilityRole="button" accessibilityLabel={strings.textSheet.shuffle} testID="shuffle">
          <Shuffle size={20} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView style={styles.suggestions} keyboardShouldPersistTaps="handled">
        <View style={{ gap: spacing.sm, paddingBottom: spacing.xs }}>
          {suggestions.map((phrase) => (
            <Pressable
              key={phrase.id}
              testID={`suggestion-${phrase.id}`}
              accessibilityRole="button"
              onPress={() => {
                useCreationStore.getState().setValue(slot.id, phrase.text);
                services.analytics.track({ name: 'suggestion_used', phraseId: phrase.id });
              }}
              style={styles.suggestion}
            >
              <Text style={[typography.body, { color: colors.text }]} numberOfLines={2}>
                {phrase.text}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Button label={strings.textSheet.done} variant="primary" onPress={onClose} testID="text-done" />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  input: {
    backgroundColor: colors.surface2,
    borderRadius: radius.field,
    padding: spacing.md,
    minHeight: 48,
    color: colors.text,
    textAlignVertical: 'top',
  },
  /**
   * `flexShrink` é o que faz a sheet caber: sem ele a lista mantém a altura inteira, empurra o
   * campo e o "Pronto" para fora da tela quando o teclado está aberto — e é o que fazia a área
   * de sugestões parecer minúscula. Agora a lista é a única coisa que cede.
   */
  suggestions: { maxHeight: 380, flexShrink: 1 },
  suggestion: {
    backgroundColor: colors.surface2,
    borderRadius: radius.field,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: sizes.touchTarget,
    justifyContent: 'center',
  },
});
