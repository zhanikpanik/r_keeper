import React, { useRef, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable, StyleSheet, NativeSyntheticEvent, NativeScrollEvent, LayoutChangeEvent } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/colors';
import { OrderItem } from './OrderItem';
import { useOrderStore } from '../store/orderStore';
import { OrderItem as OrderItemType } from '../types';

const SCROLL_STEP = 150;

interface Props {
  onCommentPress?: () => void;
}

export const OrderPanel: React.FC<Props> = ({ onCommentPress }) => {
  const { items, selectedItemId, selectItem, getTotal } = useOrderStore();
  const comment = useOrderStore((s) => (s.orders.find(o => o.id === s.currentOrderId) as any)?.comment || '');

  const total = getTotal();

  // Scroll controls
  const scrollRef = useRef<ScrollView>(null);
  const [scrollY, setScrollY] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [viewHeight, setViewHeight] = useState(0);

  const canScrollUp = scrollY > 0;
  const canScrollDown = contentHeight > viewHeight && scrollY < contentHeight - viewHeight - 1;

  const handleScrollUp = useCallback(() => {
    scrollRef.current?.scrollTo({ y: Math.max(0, scrollY - SCROLL_STEP), animated: true });
  }, [scrollY]);

  const handleScrollDown = useCallback(() => {
    const maxY = contentHeight - viewHeight;
    scrollRef.current?.scrollTo({ y: Math.min(maxY, scrollY + SCROLL_STEP), animated: true });
  }, [scrollY, contentHeight, viewHeight]);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollY(e.nativeEvent.contentOffset.y);
  }, []);

  const handleContentSizeChange = useCallback((_w: number, h: number) => {
    setContentHeight(h);
  }, []);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setViewHeight(e.nativeEvent.layout.height);
  }, []);

  const renderItems = () => items.map(item => renderItem(item));

  const renderItem = (item: OrderItemType) => (
    <View key={item.id}>
      <Pressable
        onPress={() => selectItem(item.id === selectedItemId ? null : item.id)}
        style={({ pressed }) => pressed && styles.itemPressed}
      >
        <OrderItem item={item} isSelected={item.id === selectedItemId} />
      </Pressable>
      {item.modifiers.length > 0 && (
        <View style={[styles.modifiersContainer, item.id === selectedItemId && styles.modifiersContainerSelected]}>
          {item.modifiers.map((mod) => (
            <View key={mod.id} style={styles.modifierRow}>
              <View style={styles.modifierLine} />
              <Text style={[styles.modifierText, item.id === selectedItemId && styles.modifierTextSelected]}>{mod.name}</Text>
              <Text style={[styles.modifierQty, item.id === selectedItemId && styles.modifierTextSelected]}>1</Text>
              <Text style={[styles.modifierPrice, item.id === selectedItemId && styles.modifierTextSelected]}>{mod.price} ₽</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Order total row */}
      <View style={styles.orderHeader}>
        <Text style={styles.orderHeaderTitle}>Заказ</Text>
        <Text style={styles.orderHeaderTotal}>{total} ₽</Text>
      </View>

      {/* Items list */}
      <View style={styles.itemListContainer}>
        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={handleContentSizeChange}
          onLayout={handleLayout}
        >
          {renderItems()}
        </ScrollView>
      </View>

      {/* Bottom: ↑ ↓ scroll */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.scrollBtn, !canScrollUp && styles.btnDisabled]}
          onPress={handleScrollUp}
          disabled={!canScrollUp}
          activeOpacity={0.6}
        >
          <Feather name="chevron-up" size={22} color={canScrollUp ? theme.colors.textPrimary : theme.colors.textDisabled} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.scrollBtn, !canScrollDown && styles.btnDisabled]}
          onPress={handleScrollDown}
          disabled={!canScrollDown}
          activeOpacity={0.6}
        >
          <Feather name="chevron-down" size={22} color={canScrollDown ? theme.colors.textPrimary : theme.colors.textDisabled} />
        </TouchableOpacity>
      </View>

      {/* Comment button */}
      <View style={styles.commentRow}>
        <TouchableOpacity
          style={styles.commentButton}
          onPress={onCommentPress}
          activeOpacity={0.6}
        >
          <Text style={[styles.commentText, comment && styles.commentTextActive]} numberOfLines={1}>
            {comment || 'Комментарий'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const GAP = 8;

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 0 },

  // Order header
  orderHeader: {
    height: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surfaceLight,
    marginBottom: GAP,
  },
  orderHeaderTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderHeaderTotal: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Items list
  itemListContainer: { flex: 1, position: 'relative', minHeight: 0 },
  scrollView: { ...StyleSheet.absoluteFillObject },
  scrollContent: { paddingBottom: 4 },

  itemPressed: {
    backgroundColor: '#333',
  },
  modifiersContainer: {
    backgroundColor: theme.colors.surfaceDeep,
  },
  modifiersContainerSelected: {
    backgroundColor: theme.colors.orderItemActiveText,
  },
  modifierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingRight: 16,
  },
  modifierLine: {
    width: 2,
    height: '100%',
    backgroundColor: theme.colors.textSecondary,
    marginLeft: 16,
    marginRight: 14,
  },
  modifierText: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  modifierTextSelected: {
    color: theme.colors.textPrimary,
  },
  modifierQty: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    width: 30,
    textAlign: 'center',
  },
  modifierPrice: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    width: 60,
    textAlign: 'right',
  },

  // Bottom actions: ↑ ↓
  bottomActions: {
    flexDirection: 'row',
    height: 44,
    gap: GAP,
    marginTop: GAP,
  },
  scrollBtn: {
    flex: 1,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  // Comment button
  commentRow: {
    height: 44,
    marginTop: GAP,
  },
  commentButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  commentText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
  },
  commentTextActive: {
    color: theme.colors.accent,
  },
});
