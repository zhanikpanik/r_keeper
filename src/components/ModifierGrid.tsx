import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/colors';
import { useOrderStore } from '../store/orderStore';
import { modifierGroups } from '../mocks/menuData';
import { Modifier } from '../types';
import { QuantityNumpad } from './QuantityNumpad';
import { GuestPicker } from './GuestPicker';

const COLS = 3;
const ROWS = 5;
const GAP = 2;
const TOTAL_CELLS = COLS * ROWS;

export const ModifierGrid: React.FC = () => {
  const { items, selectedItemId, activeAction, activeModifierGroupId, setActiveModifierGroup, toggleModifier } = useOrderStore();
  const selectedItem = items.find(i => i.id === selectedItemId);

  // Quantity mode → numpad
  if (activeAction === 'quantity' && selectedItem) {
    return <QuantityNumpad />;
  }

  // Guest mode → guest picker
  if (activeAction === 'guest' && selectedItem) {
    return <GuestPicker />;
  }

  // Modifier mode
  const isModifiers = activeAction === 'modifiers' && !!selectedItem;
  const activeGroup = modifierGroups.find(g => g.id === activeModifierGroupId) || modifierGroups[0];
  const currentGroupIdx = modifierGroups.findIndex(g => g.id === activeGroup.id);
  const modifiers = isModifiers ? activeGroup.modifiers : [];
  const headerTitle = isModifiers ? activeGroup.name : '';
  const itemModifierIds = selectedItem?.modifiers.map(m => m.id) || [];

  const handlePrevGroup = () => {
    if (currentGroupIdx > 0) {
      setActiveModifierGroup(modifierGroups[currentGroupIdx - 1].id);
    }
  };

  const handleNextGroup = () => {
    if (currentGroupIdx < modifierGroups.length - 1) {
      setActiveModifierGroup(modifierGroups[currentGroupIdx + 1].id);
    }
  };

  // Build cells
  type Cell = { kind: 'modifier'; mod: Modifier } | { kind: 'empty' };
  const cells: Cell[] = modifiers.map(m => ({ kind: 'modifier' as const, mod: m }));
  while (cells.length < TOTAL_CELLS) cells.push({ kind: 'empty' });

  const rows: Cell[][] = [];
  for (let r = 0; r < ROWS; r++) {
    rows.push(cells.slice(r * COLS, r * COLS + COLS));
  }

  // No modifier panel needed — show empty state
  if (!isModifiers) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerBack} />
          <Text style={styles.headerText}>{selectedItem?.product.name || ''}</Text>
          <View style={styles.headerBack} />
        </View>
        <View style={[styles.grid, { justifyContent: 'center', alignItems: 'center' }]} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={handlePrevGroup}>
          <Feather name="chevron-left" size={22} color={currentGroupIdx > 0 ? theme.colors.textPrimary : theme.colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>{headerTitle}</Text>
        <TouchableOpacity style={styles.headerBack} onPress={handleNextGroup}>
          {currentGroupIdx < modifierGroups.length - 1 && (
            <Feather name="chevron-right" size={22} color={theme.colors.textPrimary} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {rows.map((row, ri) => (
          <View key={ri} style={[styles.row, ri < ROWS - 1 && { marginBottom: GAP }]}>
            {row.map((cell, ci) => (
              <View key={ci} style={[styles.cellWrap, ci < COLS - 1 && { marginRight: GAP }]}>
                {cell.kind === 'modifier' ? (
                  <TouchableOpacity
                    style={[styles.modBtn, itemModifierIds.includes(cell.mod.id) && styles.modActive]}
                    onPress={() => toggleModifier(cell.mod)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[styles.modText, itemModifierIds.includes(cell.mod.id) && styles.modTextActive]}
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
  container: { flex: 1 },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    marginBottom: GAP,
  },
  headerBack: { width: 44, justifyContent: 'center', alignItems: 'center' },
  headerText: { flex: 1, color: theme.colors.textPrimary, fontSize: 15, fontWeight: '600', textAlign: 'center' },

  grid: { flex: 1 },
  row: { flex: 1, flexDirection: 'row' },
  cellWrap: { flex: 1 },

  modBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
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
  emptyCell: { flex: 1, backgroundColor: theme.colors.surfaceLight },
});
