import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetModalProps, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useCallback, useMemo, forwardRef, type ReactNode } from 'react';

import { useAppTheme } from '@/hooks/useAppTheme';

export type AppBottomSheetProps = Omit<BottomSheetModalProps, 'backdropComponent'> & {
  children: ReactNode;
  snapPoints?: (string | number)[];
  dismissible?: boolean;
};

export const AppBottomSheet = forwardRef<BottomSheetModal, AppBottomSheetProps>(function AppBottomSheet(
  {
    children,
    snapPoints,
    dismissible = true,
    enableDismissOnClose = true,
    enablePanDownToClose,
    backgroundStyle,
    handleIndicatorStyle,
    handleStyle,
    ...rest
  },
  ref,
) {
  const { palette } = useAppTheme();

  const defaultSnapPoints = useMemo(() => ['60%', '92%'], []);
  const finalSnapPoints = snapPoints ?? defaultSnapPoints;

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.55}
        pressBehavior={dismissible ? 'close' : 'none'}
      />
    ),
    [dismissible],
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={finalSnapPoints}
      backdropComponent={renderBackdrop}
      enableDismissOnClose={dismissible ? enableDismissOnClose : false}
      enablePanDownToClose={enablePanDownToClose ?? dismissible}
      stackBehavior="replace"
      backgroundStyle={[
        {
          backgroundColor: palette.bg,
          borderWidth: 1,
          borderBottomWidth: 0,
          borderColor: palette.border,
          shadowOpacity: 0.18,
          shadowRadius: 40,
          shadowOffset: { width: 0, height: -10 },
          elevation: 24,
        },
        backgroundStyle,
      ]}
      handleIndicatorStyle={[
        { width: 44, height: 5, borderRadius: 999, backgroundColor: palette.border, opacity: 0.9 },
        handleIndicatorStyle,
      ]}
      handleStyle={[{ paddingTop: 6, paddingBottom: 8 }, handleStyle]}
      {...rest}>
      <BottomSheetView style={{ flex: 1 }}>{children}</BottomSheetView>
    </BottomSheetModal>
  );
});

export default AppBottomSheet;
