import { Image } from 'expo-image';
import { type Href, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StatusBadge } from '@/components/status-badge';
import { AppColors, Radius, Spacing, Typography } from '@/theme/tokens';
import type { MenuCategory, MenuItem } from '@/types';
import { formatMoney } from '@/utils/format';

import { type CatalogFilters, useCategories, useMenuItems } from './useCatalog';

export function CatalogView() {
  const [filters, setFilters] = useState<CatalogFilters>({});
  const categoriesQuery = useCategories();
  const itemsQuery = useMenuItems(filters);
  const items = useMemo(
    () => itemsQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [itemsQuery.data],
  );
  const categoryNames = useMemo(
    () => new Map(categoriesQuery.data?.map((category) => [category.id, category.name]) ?? []),
    [categoriesQuery.data],
  );

  if (itemsQuery.isPending) return <CatalogMessage loading message="Đang tải thực đơn…" />;
  if (itemsQuery.isError && items.length === 0) {
    return (
      <CatalogMessage
        actionLabel="Thử lại"
        message={itemsQuery.error.message}
        onAction={() => itemsQuery.refetch()}
      />
    );
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <FlatList
        contentContainerStyle={[styles.list, items.length === 0 && styles.emptyList]}
        data={items}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Không có món phù hợp</Text>
            <Text style={styles.emptyDescription}>Hãy chọn danh mục hoặc trạng thái khác.</Text>
          </View>
        }
        ListFooterComponent={
          itemsQuery.isFetchingNextPage ? (
            <ActivityIndicator color={AppColors.brandDark} style={styles.footerLoader} />
          ) : null
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headingRow}>
              <View style={styles.flexOne}>
                <Text style={styles.eyebrow}>DANH MỤC</Text>
                <Text accessibilityRole="header" style={styles.title}>
                  Danh mục và thực đơn
                </Text>
                <Text style={styles.subtitle}>
                  {itemsQuery.data?.pages[0]?.meta.total ?? 0} món trong hệ thống
                </Text>
              </View>
              {itemsQuery.isFetching && !itemsQuery.isFetchingNextPage ? (
                <ActivityIndicator color={AppColors.brandDark} />
              ) : null}
            </View>

            {categoriesQuery.isError ? (
              <View style={styles.warningBanner}>
                <Text style={styles.warningText}>Không thể tải danh mục. Vẫn hiển thị toàn bộ món.</Text>
              </View>
            ) : (
              <CategorySelector
                categories={categoriesQuery.data ?? []}
                selectedId={filters.categoryId}
                onSelect={(categoryId) => setFilters((current) => ({ ...current, categoryId }))}
              />
            )}

            <AvailabilitySelector
              value={filters.isAvailable}
              onChange={(isAvailable) => setFilters((current) => ({ ...current, isAvailable }))}
            />
          </View>
        }
        onEndReached={() => {
          if (itemsQuery.hasNextPage && !itemsQuery.isFetchingNextPage) {
            itemsQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.35}
        onRefresh={() => Promise.all([categoriesQuery.refetch(), itemsQuery.refetch()])}
        refreshing={itemsQuery.isRefetching && !itemsQuery.isFetchingNextPage}
        renderItem={({ item }) => (
          <MenuItemCard categoryName={categoryNames.get(item.categoryId)} item={item} />
        )}
      />
    </SafeAreaView>
  );
}

function CategorySelector({
  categories,
  onSelect,
  selectedId,
}: {
  categories: MenuCategory[];
  onSelect: (categoryId: string | undefined) => void;
  selectedId?: string;
}) {
  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterLabel}>Danh mục</Text>
      <ScrollView contentContainerStyle={styles.chips} horizontal showsHorizontalScrollIndicator={false}>
        <Chip label="Tất cả" onPress={() => onSelect(undefined)} selected={!selectedId} />
        {categories.map((category) => (
          <Chip
            key={category.id}
            label={`${category.name}${category.isActive ? '' : ' · Tắt'}`}
            onPress={() => onSelect(category.id)}
            selected={selectedId === category.id}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function AvailabilitySelector({
  onChange,
  value,
}: {
  onChange: (value: boolean | undefined) => void;
  value?: boolean;
}) {
  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterLabel}>Trạng thái món</Text>
      <View style={styles.chips}>
        <Chip label="Tất cả" onPress={() => onChange(undefined)} selected={value === undefined} />
        <Chip label="Đang bán" onPress={() => onChange(true)} selected={value === true} />
        <Chip label="Tạm hết" onPress={() => onChange(false)} selected={value === false} />
      </View>
    </View>
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

function MenuItemCard({ categoryName, item }: { categoryName?: string; item: MenuItem }) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityHint="Mở chi tiết món"
      accessibilityRole="button"
      onPress={() => router.push(`/menu/${item.id}` as Href)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      {item.imageUrl ? (
        <Image contentFit="cover" source={item.imageUrl} style={styles.image} transition={180} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>OF</Text>
        </View>
      )}
      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <Text numberOfLines={2} style={styles.itemName}>
            {item.name}
          </Text>
          <Text style={styles.price}>{formatMoney(item.price)}</Text>
        </View>
        <Text style={styles.subtitle}>{categoryName ?? 'Chưa xác định danh mục'}</Text>
        {item.description ? (
          <Text numberOfLines={2} style={styles.description}>
            {item.description}
          </Text>
        ) : null}
        <StatusBadge
          label={item.isAvailable ? 'Đang bán' : 'Tạm hết'}
          tone={item.isAvailable ? 'success' : 'warning'}
        />
      </View>
    </Pressable>
  );
}

function CatalogMessage({
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
  warningBanner: { padding: Spacing.md, borderRadius: Radius.md, backgroundColor: '#FEF3C7' },
  warningText: { color: AppColors.warning, fontSize: Typography.caption },
  filterGroup: { gap: Spacing.sm },
  filterLabel: { color: AppColors.text, fontSize: Typography.caption, fontWeight: '700' },
  chips: { flexDirection: 'row', gap: Spacing.sm, paddingRight: Spacing.lg },
  chip: {
    minHeight: 40,
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
    minHeight: 136,
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: Radius.lg,
    backgroundColor: AppColors.surface,
  },
  cardPressed: { backgroundColor: AppColors.background },
  image: { width: 108, borderRadius: Radius.md, backgroundColor: AppColors.surfaceMuted },
  imagePlaceholder: {
    width: 108,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    backgroundColor: AppColors.brandSoft,
  },
  imagePlaceholderText: { color: AppColors.brandDark, fontSize: Typography.heading, fontWeight: '800' },
  cardContent: { flex: 1, justifyContent: 'center', gap: Spacing.sm },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  itemName: { flex: 1, color: AppColors.text, fontSize: Typography.body, fontWeight: '800' },
  price: { color: AppColors.brandDark, fontSize: Typography.body, fontWeight: '800' },
  description: { color: AppColors.textMuted, fontSize: Typography.caption, lineHeight: 18 },
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
