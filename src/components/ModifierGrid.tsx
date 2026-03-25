import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/colors';
import { useOrderStore } from '../store/orderStore';
import { modifierGroups } from '../mocks/menuData';
import { Modifier } from '../types';
import { QuantityNumpad } from './QuantityNumpad';

const COLS = 3;
const ROWS = 5;
const GAP = 4;
const TOTAL_CELLS = COLS * ROWS; // 15

export const ModifierGrid: React.FC = () => {
  const { items, selectedItemId, activeAction, toggleModifier } = useOrderStore();
  const selectedItem = items.find(i => i.id === selectedItemId);

  // Quantity mode → show numpad
  if (activeAction === 'quantity' && selectedItem) {
    return <QuantityNumpad />;
  }

  // Modifier mode → show modifier grid
  const isModifiers = activeAction === 'modifiers' && !!selectedItem;

  // Use first modifier group for now (TODO: allow switching groups with < arrow)
  const activeGroup = modifierGroups[0];
  const modifiers = isModifiers ? activeGroup.modifiers : [];
  const headerTitle = isModifiers ? activeGroup.name : '';

  const itemModifierIds = selectedItem?.modifiers.map(m => m.id) || [];

  // Build cells
  type Cell = { kind: 'modifier'; mod: Modifier } | { kind: 'empty' };
  const cells: Cell[] = modifiers.map(m => ({ kind: 'modifier' as const, mod: m }));
  while (cells.length < TOTAL_CELLS) cells.push({ kind: 'empty' });

  // Build rows
  const rows: Cell[][] = [];
  for (let r = 0; r < ROWS; r++) {
    rows.push(cells.slice(r * COLS, r * COLS + COLS));
  }

  return (
    <View style={styles.container}>
      {/* Header with back arrow + title */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack}>
          <Feather name="chevron-left" size={22} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>{headerTitle}</Text>
        <View style={styles.headerBack} />
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {rows.map((row, ri) => (
          <View key={ri} style={[styles.row, ri < ROWS - 1 && { marginBottom: GAP }]}>
            {row.map((cell, ci) => (
              <View key={ci} style={[styles.cellWrap, ci < COLS - 1 && { marginRight: GAP }]}>
                {cell.kind === 'modifier' ? (
                  <TouchableOpacity
                    style={[
                      styles.modBtn,
                      itemModifierIds.includes(cell.mod.id) && styles.modActive,
                    ]}
                    onPress={() => toggleModifier(cell.mod)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.modText,
                        itemModifierIds.includes(cell.mod.id) && styles.modTextActive,
                      ]}
                      numberOfLines={2}
                    >
                      {cell.mod.name}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.emptyCell} />
                )}
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
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  headerBack: { width: 44, justifyContent: 'center', alignItems: 'center' },
  headerText: { flex: 1, color: theme.colors.textPrimary, fontSize: 15, fontWeight: '600', textAlign: 'center' },

  grid: { flex: 1, padding: GAP },
  row: { flex: 1, flexDirection: 'row' },
  cellWrap: { flex: 1 },

  modBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
    paddingHorizontal: 4,
  },
  modActive: {
    backgroundColor: '#fff',
  },
  modText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    textAlign: 'center',
  },
  modTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  emptyCell: { flex: 1 },
});
