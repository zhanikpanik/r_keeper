import React, { useRef, useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable, StyleSheet, NativeSyntheticEvent, NativeScrollEvent, LayoutChangeEvent } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/colors';
import { OrderItem } from './OrderItem';
import { useOrderStore } from '../store/orderStore';
import { OrderItem as OrderItemType, Guest } from '../types';

const SCROLL_STEP = 150;

interface Props {
  onCommentPress?: () => void;
}

export const OrderPanel: React.FC<Props> = ({ onCommentPress }) => {
  const {
    items, selectedItemId, guests, activeGuestId,
    selectItem, getTotal, getGuestTotal, addGuest, setActiveGuest,
  } = useOrderStore();
  const comment = useOrderStore((s) => (s.orders.find(o => o.id === s.currentOrderId) as any)?.comment || '');

  const total = getTotal();

  // Guest navigation: null = "Все гости", string = specific guest
  const [viewGuestId, setViewGuestId] = useState<string | null>(null);

  // Guest nav: cycle through [null (all), guest1, guest2, ...]
  const guestOptions: (string | null)[] = useMemo(
    () => [null, ...guests.map(g => g.id)],
    [guests]
  );
  const currentIdx = guestOptions.indexOf(viewGuestId);

  const handlePrevGuest = () => {
    const idx = currentIdx <= 0 ? guestOptions.length - 1 : currentIdx - 1;
    const newId = guestOptions[idx];
    setViewGuestId(newId);
    setActiveGuest(newId);
  };

  const handleNextGuest = () => {
    const idx = currentIdx >= guestOptions.length - 1 ? 0 : currentIdx + 1;
    const newId = guestOptions[idx];
    setViewGuestId(newId);
    setActiveGuest(newId);
  };

  const getGuestLabel = (): string => {
    if (viewGuestId === null) return 'Все гости';
    const guest = guests.find(g => g.id === viewGuestId);
    return guest?.name || 'Гость';
  };

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

  const handleAddGuest = () => {
    addGuest();
    // Switch to the new guest
    const newGuestId = guests.length > 0 ? undefined : undefined; // will be set after addGuest
    // We'll navigate to the new guest on next render
    setTimeout(() => {
      const state = useOrderStore.getState();
      const lastGuest = state.guests[state.guests.length - 1];
      if (lastGuest) {
        setViewGuestId(lastGuest.id);
        setActiveGuest(lastGuest.id);
      }
    }, 0);
  };

  // Build grouped items
  const renderItems = () => {
    if (viewGuestId !== null) {
      // Show only this guest's items
      const guestItems = items.filter(i => i.guestId === viewGuestId);
      return guestItems.map(item => renderItem(item));
    }

    // "Все гости" — group by guest
    const sections: { guest: Guest | null; items: OrderItemType[] }[] = [];

    // Items with no guest (general order)
    const generalItems = items.filter(i => !i.guestId);
    if (generalItems.length > 0) {
      sections.push({ guest: null, items: generalItems });
    }

    // Items per guest
    guests.forEach(guest => {
      const guestItems = items.filter(i => i.guestId === guest.id);
      if (guestItems.length > 0) {
        sections.push({ guest, items: guestItems });
      }
    });

    // If no sections (no items yet), show nothing
    if (sections.length === 0 && items.length > 0) {
      // Fallback: show all items ungrouped
      return items.map(item => renderItem(item));
    }

    return sections.map((section, si) => (
      <View key={section.guest?.id || 'general'}>
        <View style={styles.guestHeader}>
          <Text style={styles.guestHeaderText}>
            {section.guest?.name || 'Общий'}
          </Text>
          <Text style={styles.guestHeaderTotal}>
            {section.items.reduce((sum, item) => {
              const modPrice = item.modifiers.reduce((ms, m) => ms + m.price, 0);
              return sum + (item.product.price + modPrice) * item.quantity;
            }, 0)} ₽
          </Text>
        </View>
        {section.items.map(item => renderItem(item))}
      </View>
    ));
  };

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
      {/* Guest navigator */}
      <View style={styles.guestNav}>
        <TouchableOpacity style={styles.guestNavArrow} onPress={handlePrevGuest} activeOpacity={0.6}>
          <Feather name="chevron-left" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.guestNavCenter}>
          <Text style={styles.guestNavText}>{getGuestLabel()}</Text>
        </View>
        <TouchableOpacity style={styles.guestNavArrow} onPress={handleNextGuest} activeOpacity={0.6}>
          <Feather name="chevron-right" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

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

      {/* Bottom: ↑ ↓ + Гость */}
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
        <TouchableOpacity
          style={styles.addGuestBtn}
          onPress={handleAddGuest}
          activeOpacity={0.6}
        >
          <Feather name="plus" size={18} color={theme.colors.textPrimary} />
          <Text style={styles.addGuestText}>Гость</Text>
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

const GAP = 2;

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 0 },

  // Guest navigator
  guestNav: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    marginBottom: GAP,
  },
  guestNavArrow: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestNavCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestNavText: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },

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

  // Guest section headers
  guestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  guestHeaderText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  guestHeaderTotal: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
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

  // Bottom actions: ↑ ↓ + Гость
  bottomActions: {
    flexDirection: 'row',
    height: 44,
    paddingHorizontal: 4,
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
  addGuestBtn: {
    flex: 1.5,
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  addGuestText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },

  // Comment button
  commentRow: {
    height: 44,
    paddingHorizontal: 4,
    marginTop: GAP,
    marginBottom: 4,
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
