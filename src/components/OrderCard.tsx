import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SomIcon } from './Icons';
import { theme } from '../theme/colors';
import { Order } from '../types';

const formatAmount = (amount: number): string => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const formatTime = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
};



interface Props {
  order: Order;
  onPress: () => void;
  scale?: number;
}

export const OrderCard: React.FC<Props> = ({ order, onPress, scale = 1 }) => {
  // Build dish preview string
  const dishPreview = order.items
    .map(item => item.product.name)
    .filter((name, idx, arr) => arr.indexOf(name) === idx) // unique names
    .join(', ');

  const getBackgroundColor = () => {
    switch (order.status) {
      case 'active': return theme.colors.orderDefault;
      case 'paid': return theme.colors.orderActive;
      case 'alert': return theme.colors.orderAlert;
      case 'cancelled': return '#4A0A0A';
      default: return theme.colors.orderDefault;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: getBackgroundColor() }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Top: number + amount */}
      <View style={styles.mainRow}>
        <Text style={[styles.number, { fontSize: 28, lineHeight: 32 }]}>
          {order.number}
        </Text>
        <View style={styles.amountRow}>
          <Text style={styles.amount}>
            {formatAmount(order.totalAmount)}
          </Text>
          <SomIcon size={8} color="#fff" />
        </View>
      </View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Bottom group: table, dishes, waiter */}
      <View>
        {order.status === 'cancelled' && order.closeReason ? (
          <Text style={styles.closeReason}>{order.closeReason}</Text>
        ) : order.tableNumber ? (
          <Text style={styles.middle}>Стол {order.tableNumber}</Text>
        ) : null}
        {dishPreview ? (
          <View style={styles.dishPreviewWrap}>
            <Text style={styles.dishPreview} numberOfLines={1}>{dishPreview}</Text>
            <LinearGradient
              colors={['transparent', getBackgroundColor()]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.dishFade}
            />
          </View>
        ) : null}
        <View style={styles.bottomRow}>
          <Text style={styles.details}>{formatTime(order.openedAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: theme.borderRadius,
    justifyContent: 'space-between',
    padding: 14,
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
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amount: {
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
  },
  middle: {
    color: theme.colors.textPrimary,
    opacity: 0.8,
    fontWeight: '500',
    fontSize: 14,
  },
  closeReason: {
    color: '#FF8A80',
    fontWeight: '600',
    fontSize: 13,
  },
  dishPreviewWrap: {
    overflow: 'hidden',
    marginTop: 2,
    position: 'relative',
  },
  dishPreview: {
    color: theme.colors.textPrimary,
    opacity: 0.5,
    fontSize: 14,
  },
  dishFade: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 50,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  details: {
    color: theme.colors.textPrimary,
    opacity: 0.6,
    fontWeight: '400',
    fontSize: 14,
  },
});
