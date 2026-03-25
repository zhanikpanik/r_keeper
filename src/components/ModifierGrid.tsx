import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/colors';
import { useOrderStore } from '../store/orderStore';
import { Modifier, Product } from '../types';
import { QuantityNumpad } from './QuantityNumpad';

const AVAILABLE_MODIFIERS: Modifier[] = [
  { id: 'm1', name: 'Лук', price: 0 },
  { id: 'm2', name: 'Помидор', price: 30 },
  { id: 'm3', name: 'Огурец', price: 20 },
];

const MOCK_PRODUCTS: Record<string, Product[]> = {
  'hot': [
    { id: 'p1', categoryId: 'hot', name: 'Биг Тейсти', price: 210 },
    { id: 'p2', categoryId: 'hot', name: 'Салат оливье', price: 320 },
    { id: 'p3', categoryId: 'hot', name: 'Пицца «Гурман»', price: 240 },
    { id: 'p4', categoryId: 'hot', name: 'Борщ', price: 180 },
  ],
  'kids': [
    { id: 'k1', categoryId: 'kids', name: 'Наггетсы', price: 150 },
    { id: 'k2', categoryId: 'kids', name: 'Картофель фри', price: 100 },
  ],
  'bar': [
    { id: 'b1', categoryId: 'bar', name: 'Кока-кола', price: 90 },
    { id: 'b2', categoryId: 'bar', name: 'Латте', price: 150 },
    { id: 'b3', categoryId: 'bar', name: 'Эспрессо', price: 120 },
  ],
};

export const ModifierGrid: React.FC = () => {
  const { items, selectedItemId, activeAction, toggleModifier, selectItem, activeCategoryId, addProduct } = useOrderStore();
  
  const selectedItem = items.find(item => item.id === selectedItemId);
  const isModifiersActive = activeAction === 'modifiers' && selectedItem;
  const isQuantityActive = activeAction === 'quantity' && selectedItem;

  if (isQuantityActive) {
    return <QuantityNumpad />;
  }

  const renderGridContent = () => {
    // Mode 1: Editing Modifiers for a selected item
    if (isModifiersActive) {
      const itemModifiersIds = selectedItem.modifiers.map(m => m.id);
      return (
        <>
          {AVAILABLE_MODIFIERS.map((mod) => {
            const isSelected = itemModifiersIds.includes(mod.id);
            return (
              <View key={mod.id} style={styles.gridItemWrapper}>
                <TouchableOpacity 
                  style={[styles.gridItem, isSelected && styles.gridItemSelected]}
                  onPress={() => toggleModifier(mod)}
                >
                  <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
                    {mod.name}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
          {/* Fill remaining space */}
          {[...Array(15 - AVAILABLE_MODIFIERS.length)].map((_, i) => (
            <View key={`empty-${i}`} style={styles.gridItemWrapper}><View style={styles.gridItemEmpty} /></View>
          ))}
        </>
      );
    }

    // Mode 2: No item selected, display products for the active category
    if (!selectedItem) {
      const products = MOCK_PRODUCTS[activeCategoryId] || [];
      return (
        <>
          {products.map((product) => (
            <View key={product.id} style={styles.gridItemWrapper}>
              <TouchableOpacity 
                style={[styles.gridItem, styles.productItem]}
                onPress={() => addProduct(product)}
              >
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>{product.price} ₽</Text>
              </TouchableOpacity>
            </View>
          ))}
          {/* Fill remaining space */}
          {[...Array(15 - products.length)].map((_, i) => (
            <View key={`empty-prod-${i}`} style={styles.gridItemWrapper}><View style={styles.gridItemEmpty} /></View>
          ))}
        </>
      );
    }

    // Mode 3: Item selected, but not on Modifiers action (e.g. Quantity)
    return [...Array(15)].map((_, i) => (
      <View key={`empty-action-${i}`} style={styles.gridItemWrapper}><View style={styles.gridItemEmpty} /></View>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Feather name="chevron-left" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>
          {!selectedItem ? 'Блюда' : (isModifiersActive ? 'Начинка' : '')}
        </Text>
        <View style={styles.headerRight} />
      </View>
      
      <View style={styles.grid}>
        {renderGridContent()}
      </View>

      <TouchableOpacity 
        style={[styles.doneButton, !selectedItem && { backgroundColor: theme.colors.surfaceLight }]} 
        onPress={() => selectItem(null)}
      >
        <Text style={[styles.doneText, !selectedItem && { color: theme.colors.textSecondary }]}>
          {selectedItem ? 'Готово' : 'Выберите блюдо'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surfaceDeep,
  },
  header: {
    height: 48,
    backgroundColor: theme.colors.surfaceDeep,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 48,
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 2,
  },
  gridItemWrapper: {
    width: '33.33%',
    height: '20%', // 5 rows
    padding: 2,
  },
  gridItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight, // Same as menu for consistency
    borderRadius: theme.borderRadius,
  },
  gridItemSelected: {
    backgroundColor: theme.colors.orderItemActive,
  },
  gridItemEmpty: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  itemText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  itemTextSelected: {
    color: theme.colors.orderItemActiveText,
    fontWeight: 'bold',
    fontSize: 16,
  },
  productItem: {
    backgroundColor: theme.colors.surfaceLight,
    padding: 8,
  },
  productName: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  productPrice: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  doneButton: {
    height: 64,
    backgroundColor: theme.colors.btnGreen,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius,
    margin: 8,
  },
  doneText: {
    color: theme.colors.textDark,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
