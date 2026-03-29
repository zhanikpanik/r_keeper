import React, { useRef, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable, StyleSheet, NativeSyntheticEvent, NativeScrollEvent, LayoutChangeEvent } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/colors';
import { OrderItem } from './OrderItem';
import { useOrderStore } from '../store/orderStore';

const SCROLL_STEP = 150;

export const OrderPanel: React.FC = () => {
  const {
    items, selectedItemId,
    selectItem, getTotal,
  } = useOrderStore();

  const total = getTotal();

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

  return (
    <View style={styles.container}>
      {/* Order total row */}
      <View style={styles.orderHeader}>
        <Text style={styles.orderHeaderTitle}>Заказ</Text>
        <Text style={styles.orderHeaderTotal}>{total} ₽</Text>
      </View>

      {/* Items list — no touch scrolling */}
      <ScrollView
        ref={scrollRef}
        style={styles.itemList}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onContentSizeChange={handleContentSizeChange}
        onLayout={handleLayout}
      >
        {items.map((item) => (
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
        ))}
      </ScrollView>

      {/* Bottom: scroll buttons */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.bottomNavButton, !canScrollUp && styles.bottomNavButtonDisabled]}
          onPress={handleScrollUp}
          disabled={!canScrollUp}
          activeOpacity={0.6}
        >
          <Feather name="chevron-up" size={24} color={canScrollUp ? theme.colors.textPrimary : theme.colors.textDisabled} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bottomNavButton, !canScrollDown && styles.bottomNavButtonDisabled]}
          onPress={handleScrollDown}
          disabled={!canScrollDown}
          activeOpacity={0.6}
        >
          <Feather name="chevron-down" size={24} color={canScrollDown ? theme.colors.textPrimary : theme.colors.textDisabled} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surfaceDeep },

  orderHeader: {
    height: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surfaceLight,
    marginBottom: 2,
  },
  orderHeaderTitle: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  orderHeaderTotal: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },

  itemList: { flex: 1 },

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
    fontSize: 13,
  },
  modifierTextSelected: {
    color: theme.colors.textPrimary,
  },
  modifierQty: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    width: 30,
    textAlign: 'center',
  },
  modifierPrice: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    width: 60,
    textAlign: 'right',
  },

  bottomNav: {
    flexDirection: 'row',
    height: 48,
    paddingHorizontal: 8,
    gap: 8,
    marginBottom: 8,
  },
  bottomNavButton: {
    flex: 1,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNavButtonDisabled: {
    opacity: 0.4,
  },

});
