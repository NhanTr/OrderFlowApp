import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors, Radius, Spacing, Typography } from '@/theme/tokens';

type FeaturePlaceholderProps = {
  description: string;
  eyebrow?: string;
  title: string;
};

export function FeaturePlaceholder({ description, eyebrow, title }: FeaturePlaceholderProps) {
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    gap: Spacing.sm,
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: AppColors.surface,
  },
  eyebrow: {
    color: AppColors.brandDark,
    fontSize: Typography.caption,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  title: {
    color: AppColors.text,
    fontSize: Typography.display,
    fontWeight: '700',
  },
  description: {
    color: AppColors.textMuted,
    fontSize: Typography.body,
    lineHeight: 24,
  },
});
