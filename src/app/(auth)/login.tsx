import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { loginRequestSchema, type LoginRequestDto } from '@/api/dto';
import { useAuth } from '@/auth/AuthProvider';
import { AppColors, Radius, Spacing, Typography } from '@/theme/tokens';

export default function LoginScreen() {
  const { login } = useAuth();
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    setError,
  } = useForm<LoginRequestDto>({
    defaultValues: { password: '', username: '' },
    resolver: zodResolver(loginRequestSchema),
  });

  const onSubmit = handleSubmit(async (credentials) => {
    try {
      await login(credentials);
    } catch (error) {
      setError('root', {
        message: error instanceof Error ? error.message : 'Không thể đăng nhập. Vui lòng thử lại.',
      });
    }
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <View style={styles.heading}>
            <View style={styles.brandMark} accessibilityElementsHidden>
              <Text style={styles.brandMarkText}>OF</Text>
            </View>
            <Text style={styles.eyebrow}>ORDER FLOW</Text>
            <Text accessibilityRole="header" style={styles.title}>
              Đăng nhập quản lý
            </Text>
            <Text style={styles.description}>
              Theo dõi doanh thu và vận hành dành riêng cho chủ quán.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Controller
              control={control}
              name="username"
              render={({ field: { onBlur, onChange, value } }) => (
                <View style={styles.field}>
                  <Text style={styles.label}>Tên đăng nhập</Text>
                  <TextInput
                    accessibilityLabel="Tên đăng nhập"
                    autoCapitalize="none"
                    autoComplete="username"
                    editable={!isSubmitting}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="Nhập tên đăng nhập"
                    placeholderTextColor={AppColors.textMuted}
                    returnKeyType="next"
                    style={[styles.input, errors.username && styles.inputError]}
                    value={value}
                  />
                  {errors.username ? (
                    <Text accessibilityRole="alert" style={styles.errorText}>
                      Vui lòng nhập tên đăng nhập.
                    </Text>
                  ) : null}
                </View>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onBlur, onChange, value } }) => (
                <View style={styles.field}>
                  <Text style={styles.label}>Mật khẩu</Text>
                  <TextInput
                    accessibilityLabel="Mật khẩu"
                    autoCapitalize="none"
                    autoComplete="current-password"
                    editable={!isSubmitting}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    onSubmitEditing={onSubmit}
                    placeholder="Nhập mật khẩu"
                    placeholderTextColor={AppColors.textMuted}
                    returnKeyType="done"
                    secureTextEntry
                    style={[styles.input, errors.password && styles.inputError]}
                    value={value}
                  />
                  {errors.password ? (
                    <Text accessibilityRole="alert" style={styles.errorText}>
                      Vui lòng nhập mật khẩu.
                    </Text>
                  ) : null}
                </View>
              )}
            />

            {errors.root?.message ? (
              <Text accessibilityRole="alert" style={styles.submitError}>
                {errors.root.message}
              </Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
              disabled={isSubmitting}
              onPress={onSubmit}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && !isSubmitting && styles.submitButtonPressed,
                isSubmitting && styles.submitButtonDisabled,
              ]}>
              {isSubmitting ? (
                <ActivityIndicator color={AppColors.surface} />
              ) : (
                <Text style={styles.submitButtonText}>Đăng nhập</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AppColors.background },
  keyboardView: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: Spacing.xl,
    padding: Spacing.xl,
  },
  heading: { alignItems: 'center', gap: Spacing.sm },
  brandMark: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    borderRadius: Radius.lg,
    backgroundColor: AppColors.brandDark,
  },
  brandMarkText: { color: AppColors.surface, fontSize: Typography.heading, fontWeight: '800' },
  eyebrow: {
    color: AppColors.brandDark,
    fontSize: Typography.caption,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: { color: AppColors.text, fontSize: Typography.display, fontWeight: '800' },
  description: {
    maxWidth: 360,
    color: AppColors.textMuted,
    fontSize: Typography.body,
    lineHeight: 24,
    textAlign: 'center',
  },
  formCard: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    gap: Spacing.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: Radius.lg,
    backgroundColor: AppColors.surface,
  },
  field: { gap: Spacing.sm },
  label: { color: AppColors.text, fontSize: Typography.body, fontWeight: '600' },
  input: {
    minHeight: 48,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: Radius.md,
    color: AppColors.text,
    backgroundColor: AppColors.surface,
    fontSize: Typography.body,
  },
  inputError: { borderColor: AppColors.danger },
  errorText: { color: AppColors.danger, fontSize: Typography.caption },
  submitError: {
    padding: Spacing.md,
    borderRadius: Radius.sm,
    color: AppColors.danger,
    backgroundColor: '#FEE2E2',
    fontSize: Typography.body,
  },
  submitButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    backgroundColor: AppColors.brandDark,
  },
  submitButtonPressed: { opacity: 0.85 },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: AppColors.surface, fontSize: Typography.body, fontWeight: '700' },
});
