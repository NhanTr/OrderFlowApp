import { type Href, Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StatusBadge } from '@/components/status-badge';
import { AppColors, Radius, Spacing, Typography } from '@/theme/tokens';
import type { Employee, EmployeeRole, UserStatus } from '@/types';

import { type EmployeeListFilters, useEmployees } from './useEmployees';

export function EmployeesView() {
  const [filters, setFilters] = useState<EmployeeListFilters>({ search: '' });
  const query = useEmployees(filters);
  const employees = useMemo(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data],
  );

  if (query.isPending) return <EmployeeMessage loading message="Đang tải nhân viên…" />;
  if (query.isError && employees.length === 0) {
    return (
      <EmployeeMessage
        actionLabel="Thử lại"
        message={query.error.message}
        onAction={() => query.refetch()}
      />
    );
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Nhân viên' }} />
      <FlatList
        contentContainerStyle={[styles.list, employees.length === 0 && styles.emptyList]}
        data={employees}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(employee) => employee.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Không tìm thấy nhân viên</Text>
            <Text style={styles.emptyDescription}>Thử từ khóa hoặc bộ lọc khác.</Text>
          </View>
        }
        ListFooterComponent={
          query.isFetchingNextPage ? (
            <ActivityIndicator color={AppColors.brandDark} style={styles.footerLoader} />
          ) : null
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headingRow}>
              <View style={styles.flexOne}>
                <Text style={styles.eyebrow}>ĐỘI NGŨ</Text>
                <Text accessibilityRole="header" style={styles.title}>
                  Nhân viên
                </Text>
                <Text style={styles.subtitle}>
                  {query.data?.pages[0]?.meta.total ?? 0} tài khoản nhân viên
                </Text>
              </View>
              {query.isFetching && !query.isFetchingNextPage ? (
                <ActivityIndicator color={AppColors.brandDark} />
              ) : null}
            </View>
            <TextInput
              accessibilityLabel="Tìm kiếm nhân viên"
              autoCapitalize="none"
              clearButtonMode="while-editing"
              onChangeText={(search) => setFilters((current) => ({ ...current, search }))}
              placeholder="Tìm theo tên hoặc tài khoản"
              placeholderTextColor={AppColors.textMuted}
              returnKeyType="search"
              style={styles.searchInput}
              value={filters.search}
            />
            <EmployeeFilters filters={filters} onChange={setFilters} />
          </View>
        }
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
        }}
        onEndReachedThreshold={0.35}
        onRefresh={() => query.refetch()}
        refreshing={query.isRefetching && !query.isFetchingNextPage}
        renderItem={({ item }) => <EmployeeCard employee={item} />}
      />
    </SafeAreaView>
  );
}

function EmployeeFilters({
  filters,
  onChange,
}: {
  filters: EmployeeListFilters;
  onChange: (filters: EmployeeListFilters) => void;
}) {
  const roleOptions: { label: string; value?: EmployeeRole }[] = [
    { label: 'Tất cả vai trò' },
    { label: 'Phục vụ', value: 'SERVICE_STAFF' },
    { label: 'Barista', value: 'BARISTA' },
  ];
  const statusOptions: { label: string; value?: UserStatus }[] = [
    { label: 'Tất cả trạng thái' },
    { label: 'Hoạt động', value: 'ACTIVE' },
    { label: 'Ngừng hoạt động', value: 'INACTIVE' },
  ];

  return (
    <View style={styles.filterArea}>
      <FilterScroll>
        {roleOptions.map((option) => (
          <Chip
            key={option.label}
            label={option.label}
            selected={filters.role === option.value}
            onPress={() => onChange({ ...filters, role: option.value })}
          />
        ))}
      </FilterScroll>
      <FilterScroll>
        {statusOptions.map((option) => (
          <Chip
            key={option.label}
            label={option.label}
            selected={filters.status === option.value}
            onPress={() => onChange({ ...filters, status: option.value })}
          />
        ))}
      </FilterScroll>
    </View>
  );
}

function FilterScroll({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView contentContainerStyle={styles.chips} horizontal showsHorizontalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

function Chip({ label, onPress, selected }: { label: string; onPress: () => void; selected: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function EmployeeCard({ employee }: { employee: Employee }) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityHint="Mở chi tiết nhân viên"
      accessibilityRole="button"
      onPress={() => router.push(`/employees/${employee.id}` as Href)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials(employee.fullName)}</Text>
      </View>
      <View style={styles.flexOne}>
        <Text style={styles.employeeName}>{employee.fullName}</Text>
        <Text style={styles.subtitle}>{employee.username ? `@${employee.username}` : 'Chưa có username'}</Text>
        <View style={styles.badges}>
          <StatusBadge label={employee.role === 'BARISTA' ? 'Barista' : 'Phục vụ'} tone="info" />
          <StatusBadge
            label={employee.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động'}
            tone={employee.status === 'ACTIVE' ? 'success' : 'neutral'}
          />
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

function initials(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return `${parts.at(-2)?.[0] ?? ''}${parts.at(-1)?.[0] ?? ''}`.toUpperCase();
}

function EmployeeMessage({
  actionLabel,
  loading,
  message,
  onAction,
}: {
  actionLabel?: string;
  loading?: boolean;
  message: string;
  onAction?: () => void;
}) {
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.centered}>
        {loading ? <ActivityIndicator color={AppColors.brandDark} size="large" /> : null}
        <Text style={styles.centeredText}>{message}</Text>
        {actionLabel && onAction ? (
          <Pressable accessibilityRole="button" onPress={onAction} style={styles.retryButton}>
            <Text style={styles.retryText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AppColors.background },
  list: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  emptyList: { flexGrow: 1 },
  header: { gap: Spacing.lg, paddingBottom: Spacing.lg },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  flexOne: { flex: 1, gap: Spacing.xs },
  eyebrow: { color: AppColors.brandDark, fontSize: Typography.caption, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: AppColors.text, fontSize: Typography.heading, fontWeight: '800' },
  subtitle: { color: AppColors.textMuted, fontSize: Typography.caption },
  searchInput: {
    minHeight: 48,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: Radius.md,
    color: AppColors.text,
    backgroundColor: AppColors.surface,
    fontSize: Typography.body,
  },
  filterArea: { gap: Spacing.sm },
  chips: { gap: Spacing.sm, paddingRight: Spacing.lg },
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: Radius.pill,
    backgroundColor: AppColors.surface,
  },
  chipSelected: { borderColor: AppColors.brandDark, backgroundColor: AppColors.brandSoft },
  chipText: { color: AppColors.textMuted, fontSize: Typography.caption, fontWeight: '600' },
  chipTextSelected: { color: AppColors.brandDark },
  separator: { height: Spacing.md },
  card: {
    minHeight: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: Radius.lg,
    backgroundColor: AppColors.surface,
  },
  cardPressed: { backgroundColor: AppColors.background },
  avatar: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    backgroundColor: AppColors.brandSoft,
  },
  avatarText: { color: AppColors.brandDark, fontSize: Typography.title, fontWeight: '800' },
  employeeName: { color: AppColors.text, fontSize: Typography.title, fontWeight: '800' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.xs },
  chevron: { color: AppColors.textMuted, fontSize: Typography.heading },
  footerLoader: { padding: Spacing.xl },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  emptyTitle: { color: AppColors.text, fontSize: Typography.title, fontWeight: '700' },
  emptyDescription: { color: AppColors.textMuted, fontSize: Typography.body, textAlign: 'center' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg, padding: Spacing.xl },
  centeredText: { color: AppColors.textMuted, fontSize: Typography.body, lineHeight: 24, textAlign: 'center' },
  retryButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    backgroundColor: AppColors.brandDark,
  },
  retryText: { color: AppColors.surface, fontSize: Typography.body, fontWeight: '700' },
});
