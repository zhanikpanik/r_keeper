import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/colors';
import { OrderItem } from './OrderItem';
import { useOrderStore } from '../store/orderStore';
import { OrderItem as OrderItemType } from '../types';

export const OrderPanel: React.FC = () => {
  const { items, guests, selectedItemId, addGuest, selectItem, getTotal, clearOrder } = useOrderStore();
  
  const total = getTotal();

  const handleCheckout = () => {
    if (items.length === 0) return;
    Alert.alert('Оплата', `Итого: ${total} ₽`, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Оплатить', onPress: () => clearOrder() },
    ]);
  };

  const renderItemsForGuest = (guestId: string | null) => {
    const guestItems = items.filter(item => item.guestId === guestId);
    if (guestItems.length === 0 && guestId !== null) return null; // Don't show empty guests unless it's the main order

    const sectionTotal = guestItems.reduce((sum, item) => {
      const modPrice = item.modifiers.reduce((mSum, m) => mSum + m.price, 0);
      return sum + (item.product.price + modPrice) * item.quantity;
    }, 0);

    const title = guestId === null ? 'Заказ' : guests.find(g => g.id === guestId)?.name || 'Неизвестный гость';

    return (
      <View key={guestId || 'main'}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionTotal}>{sectionTotal} ₽</Text>
        </View>

        {guestItems.map((item) => (
          <View key={item.id}>
            <TouchableOpacity 
              activeOpacity={1}
              onPress={() => selectItem(item.id === selectedItemId ? null : item.id)}
            >
              <OrderItem
                item={item}
                isSelected={item.id === selectedItemId}
              />
            </TouchableOpacity>
            
            {/* Show modifiers always for the item if it has them, highlight text if selected */}
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
      {/* Top Header - All Guests */}
      <View style={styles.guestHeader}>
        <TouchableOpacity style={styles.navButton}>
          <Feather name="chevron-left" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.guestHeaderText}>Все гости</Text>
        <TouchableOpacity style={styles.navButton}>
          <Feather name="chevron-right" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.itemList}>
        {/* Main Order Section (guestId = null) */}
        {renderItemsForGuest(null)}

        {/* Guests Sections */}
        {guests.map(guest => renderItemsForGuest(guest.id))}
      </ScrollView>

      {/* Bottom Navigation */}
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

      {/* Payment footer is now in PosScreen */}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surfaceDeep,
  },
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
  itemList: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surfaceLight,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  sectionTotal: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  mockItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  mockItemText: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  mockItemQty: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    width: 30,
    textAlign: 'center',
  },
  mockItemPrice: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    width: 60,
    textAlign: 'right',
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
  paymentFooter: {
    height: 64,
    backgroundColor: theme.colors.surfaceLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: theme.borderRadius,
  },
  paymentText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentTotal: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
