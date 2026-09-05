import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Shuffle } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { catalog } from '@/content';
import { strings } from '@/i18n/strings';
import { services } from '@/services';
import { selectPreset, useCreationStore } from '@/store/creationStore';
import { colors, radius, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import type { Slot } from '@/types/catalog';

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
    if (shuffleSeed === 0) return list.slice(0, 8);
    const start = shuffleSeed % Math.max(1, list.length);
    return [...list.slice(start), ...list.slice(0, start)].slice(0, 8);
  }, [slot, preset, value, shuffleSeed]);

  if (!slot) return <Sheet open={false} onClose={onClose}>{null}</Sheet>;

  const near = value.length >= slot.maxChars * 0.8;

  return (
    <Sheet open={open} onClose={onClose} snapPoints={['60%']}>
      <View style={styles.headerRow}>
        <Text style={[typography.label, { color: colors.textMuted }]}>{slot.label}</Text>
        {near ? (
          <Text style={[typography.caption, { color: value.length >= slot.maxChars ? colors.danger : colors.textMuted }]}>
            {value.length}/{slot.maxChars}
          </Text>
        ) : null}
      </View>

      <BottomSheetTextInput
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
        <View style={{ gap: spacing.sm }}>
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
  suggestions: { maxHeight: 240 },
  suggestion: { backgroundColor: colors.surface2, borderRadius: radius.field, padding: spacing.md },
});
