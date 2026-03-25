import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme/colors';
import { Order } from '../types';

// Reliable space-separated formatting (toLocaleString may not work on all RN runtimes)
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
      case 'active': return theme.colors.orderActive;
      case 'alert': return theme.colors.orderAlert;
      case 'inactive': return theme.colors.orderInactive;
      default: return theme.colors.surface;
    }
  };

  const hasIcons = order.hasNote || order.hasAlert || order.hasEdit;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: getBackgroundColor() }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Top row: Order number + Amount */}
      <View style={styles.topRow}>
        <Text style={[styles.number, { fontSize: 28 * scale }]}>{order.number}</Text>
        <Text style={[styles.amount, { fontSize: 15 * scale }]}>
          {formatAmount(order.totalAmount)} ₽
        </Text>
      </View>

      {/* Waiter name */}
      <Text style={[styles.waiter, { fontSize: 14 * scale }]}>{order.waiter}</Text>

      {/* Footer: Info text + Icons */}
      <View style={styles.footer}>
        <Text style={[styles.infoText, { fontSize: 12 * scale }]}>
          {order.openedAt} · {order.zone} · {order.type}
        </Text>

        {hasIcons && (
          <View style={styles.iconRow}>
            {order.hasNote && (
              <MaterialCommunityIcons 
                name="file-document-outline" 
                size={16 * scale} 
                color="rgba(255,255,255,0.7)" 
              />
            )}
            {order.hasAlert && (
              <MaterialCommunityIcons 
                name="exclamation" 
                size={16 * scale} 
                color="#FF5252" 
              />
            )}
            {order.hasEdit && (
              <MaterialCommunityIcons 
                name="pencil" 
                size={16 * scale} 
                color="#CE93D8" 
              />
            )}
          </View>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  number: {
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  amount: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  waiter: {
    color: theme.colors.textPrimary,
    opacity: 0.95,
    marginTop: 2,
  },
  footer: {
    gap: 4,
  },
  infoText: {
    color: theme.colors.textPrimary,
    opacity: 0.75,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
});
