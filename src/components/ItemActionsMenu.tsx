import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme/colors';
import { useOrderStore } from '../store/orderStore';
import { ActiveAction } from '../types';

const MENU_CATEGORIES = [
  { id: 'hot', name: 'Горячее' },
  { id: 'kids', name: 'Детское' },
  { id: 'bar', name: 'Бар' },
  { id: 'desserts', name: 'Десерты' },
  { id: 'salads', name: 'Салаты' },
];

export const ItemActionsMenu: React.FC = () => {
  const { items, selectedItemId, activeAction, setActiveAction, removeProduct, selectItem, activeCategoryId, setActiveCategory } = useOrderStore();
  
  const selectedItem = items.find(item => item.id === selectedItemId);

  // When no item is selected, render the Category Menu (Single Column)
  if (!selectedItem) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Меню</Text>
        </View>
        <View style={styles.grid}>
          {MENU_CATEGORIES.map((cat) => {
            const isActive = activeCategoryId === cat.id;
            return (
              <View key={cat.id} style={styles.singleColumnWrapper}>
                <TouchableOpacity 
                  style={[styles.gridItem, isActive && styles.activeCategoryItem]}
                  onPress={() => setActiveCategory(cat.id)}
                >
                  <Text style={isActive ? styles.activeCategoryText : styles.itemText}>{cat.name}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
          {/* Fill remaining slots to match the grid visually if needed */}
          {[...Array(Math.max(0, 7 - MENU_CATEGORIES.length))].map((_, i) => (
            <View key={`empty-${i}`} style={styles.singleColumnWrapper}><View style={styles.gridItemEmpty} /></View>
          ))}
        </View>
      </View>
    );
  }

  // When an item IS selected, render the Actions Menu (Two Columns)
  const renderAction = (action: ActiveAction, label: string) => {
    const isActive = activeAction === action;
    return (
      <View style={styles.gridItemWrapper} key={action}>
        <TouchableOpacity 
          style={[styles.gridItem, isActive && styles.activeItem]}
          onPress={() => setActiveAction(action)}
        >
          <Text style={isActive ? styles.activeItemText : styles.itemText}>{label}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText} numberOfLines={1}>{selectedItem.product.name}</Text>
      </View>
      
      <View style={styles.grid}>
        {/* Row 1 */}
        {renderAction('modifiers', 'Модификатор')}
        {renderAction('quantity', 'Количество')}
        
        {/* Row 2 */}
        {renderAction('guest', 'Гость')}
        {renderAction('course', 'Курс')}
        
        {/* Row 3 */}
        {renderAction('combo', 'Комбо')}
        {renderAction('move', 'Перенести')}

        {/* Row 4 */}
        <View style={styles.gridItemWrapper}>
          <TouchableOpacity 
            style={styles.gridItem} 
            onPress={() => removeProduct(selectedItem.id)}
          >
            <Text style={styles.itemText}>Удалить</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.gridItemWrapper}><View style={styles.gridItemEmpty} /></View>
        
        {/* Row 5 */}
        <View style={styles.gridItemWrapper}><View style={styles.gridItemEmpty} /></View>
        <View style={styles.gridItemWrapper}><View style={styles.gridItemEmpty} /></View>
      </View>

      <TouchableOpacity style={styles.cancelButton} onPress={() => selectItem(null)}>
        <Text style={styles.cancelText}>Отмена</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: theme.colors.divider,
    backgroundColor: theme.colors.surfaceDeep,
  },
  header: {
    height: 48,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  headerText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTextDisabled: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontStyle: 'italic',
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 2, // Global padding to create gap from edges
    alignContent: 'flex-start', // Prevent items from spreading out vertically too much
  },
  gridItemWrapper: {
    width: '50%',
    height: '20%', // 5 rows total to fill space for actions
    padding: 2, 
  },
  singleColumnWrapper: {
    width: '100%',
    height: '14.28%', // 7 rows total to fill space for categories (100 / 7)
    padding: 2,
  },
  gridItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
  },
  gridItemEmpty: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  activeItem: {
    backgroundColor: theme.colors.actionMenuPurple,
  },
  activeCategoryItem: {
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 2,
    borderColor: theme.colors.tabActive,
  },
  activeItemText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeCategoryText: {
    color: theme.colors.tabActive,
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  cancelButton: {
    height: 64,
    backgroundColor: theme.colors.btnRed,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius,
    margin: 8,
  },
  cancelText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
