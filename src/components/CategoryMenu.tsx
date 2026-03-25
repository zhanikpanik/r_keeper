import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/colors';
import { useOrderStore } from '../store/orderStore';
import { menuCategories } from '../mocks/menuData';

const COLS = 2;
const GAP = 4;

export const CategoryMenu: React.FC = () => {
  const { activeCategoryId, setActiveCategory } = useOrderStore();

  // Build cells: categories + pagination arrow + fill to complete grid
  const totalRows = Math.max(6, Math.ceil((menuCategories.length + 1) / COLS)); // +1 for pagination
  const totalCells = totalRows * COLS;

  type Cell = { kind: 'category'; id: string; name: string } | { kind: 'pageDown' } | { kind: 'empty' };
  const cells: Cell[] = menuCategories.map(c => ({ kind: 'category' as const, id: c.id, name: c.name }));
  
  // Fill remaining with empties, last cell = pageDown if we have many categories
  while (cells.length < totalCells - 1) cells.push({ kind: 'empty' });
  cells.push({ kind: 'pageDown' });

  // Build rows
  const rows: Cell[][] = [];
  for (let r = 0; r < totalRows; r++) {
    rows.push(cells.slice(r * COLS, r * COLS + COLS));
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Меню</Text>
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {rows.map((row, ri) => (
          <View key={ri} style={[styles.row, ri < rows.length - 1 && { marginBottom: GAP }]}>
            {row.map((cell, ci) => (
              <View key={ci} style={[styles.cellWrap, ci < COLS - 1 && { marginRight: GAP }]}>
                {cell.kind === 'category' && (
                  <TouchableOpacity
                    style={[
                      styles.categoryBtn,
                      activeCategoryId === cell.id && styles.categoryActive,
                    ]}
                    onPress={() => setActiveCategory(cell.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        activeCategoryId === cell.id && styles.categoryTextActive,
                      ]}
                      numberOfLines={2}
                    >
                      {cell.name}
                    </Text>
                  </TouchableOpacity>
                )}
                {cell.kind === 'pageDown' && (
                  <TouchableOpacity style={styles.pageBtn} activeOpacity={0.7}>
                    <Feather name="chevron-down" size={24} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                )}
                {cell.kind === 'empty' && <View style={styles.emptyCell} />}
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surfaceDeep },
  header: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  headerText: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: '600' },

  grid: { flex: 1, padding: GAP },
  row: { flex: 1, flexDirection: 'row' },
  cellWrap: { flex: 1 },

  categoryBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
    paddingHorizontal: 4,
  },
  categoryActive: {
    backgroundColor: theme.colors.actionMenuPurple,
  },
  categoryText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  categoryTextActive: {
    fontWeight: 'bold',
  },
  pageBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
  },
  emptyCell: { flex: 1 },
});
