import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/colors';
import { OrderItem as OrderItemType } from '../types';

interface Props {
  item: OrderItemType;
  isSelected?: boolean;
}

export const OrderItem: React.FC<Props> = ({ item, isSelected }) => {
  const itemTotal = (item.product.price + item.modifiers.reduce((sum, m) => sum + m.price, 0)) * item.quantity;

  return (
    <View style={[styles.container, isSelected && styles.selectedContainer]}>
      <Text style={[styles.name, isSelected && styles.selectedText]} numberOfLines={1}>
        {item.product.name}
      </Text>
      
      <Text style={[styles.quantity, isSelected && styles.selectedText]}>
        {item.quantity}
      </Text>
      
      <Text style={[styles.price, isSelected && styles.selectedText]}>
        {itemTotal} ₽
      </Text>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    backgroundColor: theme.colors.surfaceDeep,
  },
  selectedContainer: {
    backgroundColor: theme.colors.orderItemActive,
  },
  name: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  quantity: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    width: 30,
    textAlign: 'center',
  },
  price: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    width: 60,
    textAlign: 'right',
  },
  selectedText: {
    color: theme.colors.orderItemActiveText,
    fontWeight: 'bold',
  },
});
