import BottomSheet, { BottomSheetBackdrop, BottomSheetModal, BottomSheetView, type BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/theme/tokens';

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** omitido = altura pelo conteúdo */
  snapPoints?: (string | number)[];
}

/**
 * Bottom sheet do app. Os filhos só são montados quando `open` — assim o estado visível
 * e o estado da árvore são o mesmo (inclusive nos testes, onde o gorhom é mockado).
 */
export function Sheet({ open, onClose, children, snapPoints }: Props) {
  const ref = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (open) ref.current?.present();
    else ref.current?.dismiss();
  }, [open]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />,
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      onDismiss={onClose}
      enableDynamicSizing={!snapPoints}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.content}>{open ? children : null}</BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  background: { backgroundColor: colors.surface, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet },
  handle: { backgroundColor: colors.border, width: 36, height: 4 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
});

export { BottomSheet };
