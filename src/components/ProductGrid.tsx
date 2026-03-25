import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ProductCard } from './ProductCard';
import { Product, Category } from '../types';

interface Props {
  products: Product[];
  categories: Category[];
  onAddProduct: (product: Product) => void;
}

export const ProductGrid: React.FC<Props> = ({
  products,
  categories,
  onAddProduct,
}) => {
  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      numColumns={3}
      renderItem={({ item }) => {
        const category = categories.find((c) => c.id === item.categoryId);
        return (
          <ProductCard
            product={item}
            colorHex={category?.colorHex || '#5B4FE8'}
            onPress={() => onAddProduct(item)}
          />
        );
      }}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
  },
});
