import { Camera, Image as ImageIcon, Lock } from 'lucide-react-native';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { usePhotoFlow } from '@/hooks/usePhotoFlow';
import { strings } from '@/i18n/strings';
import { colors, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';

interface Props {
  open: boolean;
  onClose: () => void;
  /** chamado quando a foto foi escolhida e já está no store */
  onPicked: () => void;
}

export function PhotoSheet({ open, onClose, onPicked }: Props) {
  const { pick, picking, error } = usePhotoFlow();

  const handle = async (source: 'gallery' | 'camera') => {
    if (await pick(source)) onPicked();
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <Text style={[typography.h2, { color: colors.text }]}>{strings.photoSheet.title}</Text>
      <View style={styles.row}>
        <Button label={strings.photoSheet.gallery} icon={ImageIcon} variant="secondary" tile loading={picking} onPress={() => handle('gallery')} style={styles.tile} testID="pick-gallery" />
        <Button label={strings.photoSheet.camera} icon={Camera} variant="secondary" tile onPress={() => handle('camera')} style={styles.tile} testID="pick-camera" />
      </View>
      {error ? (
        <View style={styles.errorBox}>
          <Text style={[typography.caption, { color: colors.danger }]}>{error}</Text>
          <Button label={strings.photoSheet.openSettings} variant="ghost" onPress={() => Linking.openSettings()} />
        </View>
      ) : (
        <View style={styles.privacy}>
          <Lock size={14} color={colors.textMuted} />
          <Text style={[typography.caption, { color: colors.textMuted, flex: 1 }]}>{strings.photoSheet.privacy}</Text>
        </View>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  tile: { flex: 1 },
  privacy: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  errorBox: { gap: spacing.xs },
});
