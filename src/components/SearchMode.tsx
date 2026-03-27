import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../theme/colors';
import { useOrderStore } from '../store/orderStore';
import { menuProducts, getProductColor } from '../mocks/menuData';
import { Product } from '../types';

const PRODUCT_COLS = 5;
const GAP = 4;

// Russian keyboard layout
const RU_ROWS = [
  ['Й','Ц','У','К','Е','Н','Г','Ш','Щ','З','Х','Ъ'],
  ['Ф','Ы','В','А','П','Р','О','Л','Д','Ж','Э'],
  ['⇧','Я','Ч','С','М','И','Т','Ь','Б','Ю','←'],
];
const BOTTOM_ROW = ['123', 'EN', '#@!', 'Пробел', ',', '.'];

interface Props {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const SearchMode: React.FC<Props> = ({ searchQuery, onSearchChange }) => {
  const { addProduct } = useOrderStore();

  // Get all products flattened
  const allProducts = useMemo(() => {
    const all: Product[] = [];
    Object.values(menuProducts).forEach(products => all.push(...products));
    return all;
  }, []);

  // Filter by search query
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return allProducts;
    const q = searchQuery.toLowerCase();
    return allProducts.filter(p => p.name.toLowerCase().includes(q));
  }, [searchQuery, allProducts]);

  const handleKey = (key: string) => {
    if (key === '←') {
      onSearchChange(searchQuery.slice(0, -1));
    } else if (key === 'Пробел') {
      onSearchChange(searchQuery + ' ');
    } else if (key === '⇧' || key === '123' || key === 'EN' || key === '#@!') {
      // Not implemented for MVP
    } else {
      onSearchChange(searchQuery + key.toLowerCase());
    }
  };

  // Build product grid rows
  const productRows: Product[][] = [];
  for (let i = 0; i < filtered.length; i += PRODUCT_COLS) {
    productRows.push(filtered.slice(i, i + PRODUCT_COLS));
  }

  return (
    <View style={styles.container}>
      {/* Left side: order panel stays via parent, this is the right area (categories+products replaced) */}
      <View style={styles.content}>
        {/* Product results */}
        <ScrollView style={styles.productArea}>
          {productRows.map((row, ri) => (
            <View key={ri} style={styles.productRow}>
              {row.map((product, ci) => (
                <TouchableOpacity
                  key={product.id}
                  style={[styles.productCard, { backgroundColor: getProductColor(ci + ri * PRODUCT_COLS) }]}
                  onPress={() => addProduct(product)}
                >
                  <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                  <Text style={styles.productPrice}>{product.price} ₽</Text>
                </TouchableOpacity>
              ))}
              {/* Fill remaining cells */}
              {Array.from({ length: PRODUCT_COLS - row.length }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.productCard} />
              ))}
            </View>
          ))}
          {filtered.length === 0 && (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>Ничего не найдено</Text>
            </View>
          )}
        </ScrollView>

        {/* Russian keyboard */}
        <View style={styles.keyboard}>
          {RU_ROWS.map((row, ri) => (
            <View key={ri} style={styles.keyRow}>
              {row.map((key) => {
                const isSpecial = key === '⇧' || key === '←';
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.key, isSpecial && styles.keySpecial]}
                    onPress={() => handleKey(key)}
                    activeOpacity={0.6}
                  >
                    <Text style={styles.keyText}>{key}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
          <View style={styles.keyRow}>
            {BOTTOM_ROW.map((key) => (
              <TouchableOpacity
                key={key}
                style={[styles.key, key === 'Пробел' && styles.keySpace]}
                onPress={() => handleKey(key)}
                activeOpacity={0.6}
              >
                <Text style={styles.keyText}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: GAP,
  },
  content: {
    flex: 1,
  },

  // Products
  productArea: {
    flex: 1,
    marginBottom: GAP,
  },
  productRow: {
    flexDirection: 'row',
    marginBottom: GAP,
    gap: GAP,
  },
  productCard: {
    flex: 1,
    height: 80,
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  productName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  productPrice: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
  },
  noResults: {
    padding: 40,
    alignItems: 'center',
  },
  noResultsText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },

  // Keyboard
  keyboard: {
    paddingBottom: 4,
    gap: 4,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  key: {
    height: 44,
    minWidth: 40,
    paddingHorizontal: 8,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keySpecial: {
    backgroundColor: '#444',
    minWidth: 50,
  },
  keySpace: {
    flex: 1,
    minWidth: 200,
  },
  keyText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
});
