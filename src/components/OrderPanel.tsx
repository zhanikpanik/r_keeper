import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/colors';
import { OrderItem } from './OrderItem';
import { useOrderStore } from '../store/orderStore';

export const OrderPanel: React.FC = () => {
  const {
    items, guests, selectedItemId, activeGuestId,
    addGuest, selectItem, setActiveGuest, getTotal, getGuestTotal,
  } = useOrderStore();

  const total = getTotal();

  const renderItemsForGuest = (guestId: string | null) => {
    const guestItems = items.filter(item => item.guestId === guestId);
    if (guestItems.length === 0 && guestId !== null) {
      // Still show guest header with 0 ₽ if they exist
      const guest = guests.find(g => g.id === guestId);
      if (!guest) return null;
    }

    const sectionTotal = getGuestTotal(guestId);
    const title = guestId === null
      ? 'Заказ'
      : guests.find(g => g.id === guestId)?.name || 'Гость';
    const isActiveGuest = activeGuestId === guestId;

    return (
      <View key={guestId || 'main'}>
        <TouchableOpacity
          style={[styles.sectionHeader, isActiveGuest && styles.sectionHeaderActive]}
          onPress={() => setActiveGuest(guestId)}
          activeOpacity={0.7}
        >
          <Text style={[styles.sectionTitle, isActiveGuest && styles.sectionTitleActive]}>{title}</Text>
          <Text style={[styles.sectionTotal, isActiveGuest && styles.sectionTotalActive]}>{sectionTotal} ₽</Text>
        </TouchableOpacity>

        {guestItems.map((item) => (
          <View key={item.id}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => selectItem(item.id === selectedItemId ? null : item.id)}
            >
              <OrderItem item={item} isSelected={item.id === selectedItemId} />
            </TouchableOpacity>

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
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top: Guest navigation */}
      <View style={styles.guestHeader}>
        <TouchableOpacity style={styles.navButton}>
          <Feather name="chevron-left" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.guestHeaderText}>Все гости</Text>
        <TouchableOpacity style={styles.navButton}>
          <Feather name="chevron-right" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Order total row */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Заказ</Text>
        <Text style={styles.sectionTotal}>{total} ₽</Text>
      </View>

      {/* Items list */}
      <ScrollView style={styles.itemList}>
        {/* Items without a guest (general order) */}
        {items.filter(i => i.guestId === null).length > 0 && (
          <View>
            {items.filter(i => i.guestId === null).map((item) => (
              <View key={item.id}>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => selectItem(item.id === selectedItemId ? null : item.id)}
                >
                  <OrderItem item={item} isSelected={item.id === selectedItemId} />
                </TouchableOpacity>
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
          </View>
        )}

        {/* Guest sections */}
        {guests.map(guest => {
          const guestItems = items.filter(i => i.guestId === guest.id);
          const guestTotal = getGuestTotal(guest.id);
          const isActiveGuest = activeGuestId === guest.id;

          return (
            <View key={guest.id}>
              <TouchableOpacity
                style={[styles.sectionHeader, isActiveGuest && styles.sectionHeaderActive]}
                onPress={() => setActiveGuest(isActiveGuest ? null : guest.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.sectionTitle, isActiveGuest && styles.sectionTitleActive]}>{guest.name}</Text>
                <Text style={[styles.sectionTotal, isActiveGuest && styles.sectionTotalActive]}>{guestTotal} ₽</Text>
              </TouchableOpacity>

              {guestItems.map((item) => (
                <View key={item.id}>
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => selectItem(item.id === selectedItemId ? null : item.id)}
                  >
                    <OrderItem item={item} isSelected={item.id === selectedItemId} />
                  </TouchableOpacity>
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
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom: scroll + add guest */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavButton}>
          <Feather name="chevron-up" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavButton}>
          <Feather name="chevron-down" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addGuestButton} onPress={addGuest}>
          <Feather name="plus" size={16} color={theme.colors.textPrimary} style={{ marginRight: 4 }} />
          <Text style={styles.addGuestText}>Гость</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surfaceDeep },

  guestHeader: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceLight,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  navButton: {
    width: 48,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestHeaderText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },

  itemList: { flex: 1 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surfaceLight,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  sectionHeaderActive: {
    backgroundColor: '#1B5E20',
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  sectionTitleActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTotal: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  sectionTotalActive: {
    color: '#fff',
    fontWeight: 'bold',
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
  addGuestButton: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addGuestText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
