import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme/colors';
import { Table } from '../types';

interface Props {
  table: Table;
  onPress: () => void;
  scale?: number;
}

export const TableCard: React.FC<Props> = ({ table, onPress, scale = 1 }) => {
  const getBackgroundColor = () => {
    switch (table.status) {
      case 'occupied': return theme.colors.orderActive; // Green for occupied (has order)
      case 'reserved': return '#E65100'; // Orange for reserved
      case 'free': return theme.colors.surface; // Grey for free
      default: return theme.colors.surface;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: getBackgroundColor() }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Table Number - centered */}
      <View style={styles.centerContent}>
        <Text style={[styles.number, { fontSize: 36 * scale }]}>{table.number}</Text>
      </View>

      {/* Footer info */}
      <View style={styles.footer}>
        {table.status === 'occupied' && table.amount ? (
          <Text style={[styles.amountText, { fontSize: 13 * scale }]}>
            {table.amount.toLocaleString('ru-RU')} ₽ · {table.timeSeated}
          </Text>
        ) : table.status === 'reserved' ? (
          <Text style={[styles.statusText, { fontSize: 13 * scale }]}>Забронирован</Text>
        ) : (
          <Text style={[styles.statusText, { fontSize: 13 * scale }]}>Свободен</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: theme.borderRadius,
    padding: 12,
    justifyContent: 'space-between',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  number: {
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
  },
  amountText: {
    color: theme.colors.textPrimary,
    opacity: 0.9,
    fontWeight: '500',
  },
  statusText: {
    color: theme.colors.textPrimary,
    opacity: 0.7,
    fontWeight: '500',
  },
});
