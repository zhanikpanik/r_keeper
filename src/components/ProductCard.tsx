import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { theme } from '../theme/colors';
import { Product } from '../types';

interface Props {
  product: Product;
  colorHex: string;
  onPress: () => void;
}

export const ProductCard: React.FC<Props> = ({ product, colorHex, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colorHex }]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{product.price} сом</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 100,
    minHeight: 100,
    margin: 6,
    borderRadius: theme.borderRadius,
    padding: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
  },
  price: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    opacity: 0.9,
  },
});
