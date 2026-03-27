import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme/colors';
import { useOrderStore } from '../store/orderStore';

export const GuestPicker: React.FC = () => {
  const { guests, items, selectedItemId, assignItemToGuest } = useOrderStore();
  const selectedItem = items.find(i => i.id === selectedItemId);
  if (!selectedItem) return null;

  const handlePickGuest = (guestId: string | null) => {
    assignItemToGuest(selectedItem.id, guestId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Выберите гостя</Text>
      </View>

      <View style={styles.list}>
        {/* General order (no guest) */}
        <TouchableOpacity
          style={[styles.guestBtn, selectedItem.guestId === null && styles.guestBtnActive]}
          onPress={() => handlePickGuest(null)}
        >
          <Text style={[styles.guestText, selectedItem.guestId === null && styles.guestTextActive]}>
            Общий заказ
          </Text>
        </TouchableOpacity>

        {guests.map((guest) => (
          <TouchableOpacity
            key={guest.id}
            style={[styles.guestBtn, selectedItem.guestId === guest.id && styles.guestBtnActive]}
            onPress={() => handlePickGuest(guest.id)}
          >
            <Text style={[styles.guestText, selectedItem.guestId === guest.id && styles.guestTextActive]}>
              {guest.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surfaceDeep },
  header: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  headerText: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: '600' },
  list: {
    flex: 1,
    padding: 8,
    gap: 8,
  },
  guestBtn: {
    height: 56,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestBtnActive: {
    backgroundColor: theme.colors.actionMenuPurple,
  },
  guestText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  guestTextActive: {
    fontWeight: 'bold',
  },
});
