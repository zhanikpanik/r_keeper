import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme/colors';
import { Order } from '../types';

const formatAmount = (amount: number): string => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

interface Props {
  order: Order;
  onPress: () => void;
  scale?: number;
}

export const OrderCard: React.FC<Props> = ({ order, onPress, scale = 1 }) => {
  const getBackgroundColor = () => {
    switch (order.status) {
      case 'active': return theme.colors.orderDefault;
      case 'paid': return theme.colors.orderActive;
      case 'alert': return theme.colors.orderAlert;
      case 'inactive': return theme.colors.orderInactive;
      default: return theme.colors.orderDefault;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: getBackgroundColor(), padding: 14 * scale }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Top: number + amount */}
      <View style={styles.mainRow}>
        <Text style={[styles.number, { fontSize: 32 * scale, lineHeight: 36 * scale }]}>
          {order.number}
        </Text>
        <Text style={[styles.amount, { fontSize: 14 * scale }]}>
          {formatAmount(order.totalAmount)} ₽
        </Text>
      </View>

      {/* Middle: table + zone if not default */}
      <View>
        {order.isQuickCheck ? (
          <Text style={[styles.middle, { fontSize: 14 * scale }]}>Быстрый чек</Text>
        ) : (
          <>
            {order.tableNumber ? (
              <Text style={[styles.middle, { fontSize: 14 * scale }]}>Стол {order.tableNumber}</Text>
            ) : null}
            
          </>
        )}
      </View>

      {/* Bottom: waiter + time */}
      <View style={styles.bottomRow}>
        <Text style={[styles.details, { fontSize: 14 * scale }]}>{order.waiter}</Text>
        <Text style={[styles.details, { fontSize: 14 * scale }]}>{order.openedAt}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: theme.borderRadius,
    justifyContent: 'space-between',
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  number: {
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
  },
  amount: {
    color: theme.colors.textPrimary,
    fontWeight: '500',
    opacity: 0.9,
  },
  middle: {
    color: theme.colors.textPrimary,
    opacity: 0.8,
    fontWeight: '500',
  },
  zone: {
    color: theme.colors.textPrimary,
    opacity: 0.5,
    fontWeight: '400',
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  details: {
    color: theme.colors.textPrimary,
    opacity: 0.6,
    fontWeight: '400',
  },
});
