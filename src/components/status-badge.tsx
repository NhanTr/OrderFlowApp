import { StyleSheet, Text, View } from 'react-native';

import { AppColors, Radius, Spacing, Typography } from '@/theme/tokens';

export type StatusTone = 'danger' | 'info' | 'neutral' | 'success' | 'warning';

export function StatusBadge({ label, tone = 'neutral' }: { label: string; tone?: StatusTone }) {
  return (
    <View style={[styles.badge, toneStyles[tone]]}>
      <Text style={[styles.label, textToneStyles[tone]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
  },
  label: { fontSize: Typography.caption, fontWeight: '700' },
});

const toneStyles = StyleSheet.create({
  danger: { backgroundColor: '#FEE2E2' },
  info: { backgroundColor: '#DBEAFE' },
  neutral: { backgroundColor: AppColors.surfaceMuted },
  success: { backgroundColor: '#DCFCE7' },
  warning: { backgroundColor: '#FEF3C7' },
});

const textToneStyles = StyleSheet.create({
  danger: { color: AppColors.danger },
  info: { color: '#1D4ED8' },
  neutral: { color: AppColors.textMuted },
  success: { color: AppColors.success },
  warning: { color: AppColors.warning },
});
