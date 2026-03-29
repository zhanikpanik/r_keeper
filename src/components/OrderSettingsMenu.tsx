import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme/colors';

export type OrderSetting = 'table' | 'waiter' | 'type' | 'comment' | null;

const SETTINGS: { key: OrderSetting; label: string }[] = [
  { key: 'table', label: 'Стол' },
  { key: 'waiter', label: 'Официант' },
  { key: 'type', label: 'Тип заказа' },
  { key: 'comment', label: 'Комментарий' },
];

const COLS = 2;
const ROWS = 5;
const GAP = 2;

interface Props {
  activeSetting: OrderSetting;
  onSelectSetting: (setting: OrderSetting) => void;
}

export const OrderSettingsMenu: React.FC<Props> = ({ activeSetting, onSelectSetting }) => {
  // Build cells
  type Cell = { kind: 'setting'; key: OrderSetting; label: string } | { kind: 'empty' };
  const cells: Cell[] = SETTINGS.map(s => ({ kind: 'setting' as const, ...s }));
  while (cells.length < COLS * ROWS) cells.push({ kind: 'empty' });

  const rows: Cell[][] = [];
  for (let r = 0; r < ROWS; r++) {
    rows.push(cells.slice(r * COLS, r * COLS + COLS));
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Настройки</Text>
      </View>

      <View style={styles.grid}>
        {rows.map((row, ri) => (
          <View key={ri} style={[styles.row, ri < ROWS - 1 && { marginBottom: GAP }]}>
            {row.map((cell, ci) => (
              <View key={ci} style={[styles.cellWrap, ci < COLS - 1 && { marginRight: GAP }]}>
                {cell.kind === 'setting' ? (
                  <TouchableOpacity
                    style={[styles.settingBtn, activeSetting === cell.key && styles.settingActive]}
                    onPress={() => onSelectSetting(cell.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.settingText, activeSetting === cell.key && styles.settingTextActive]}>
                      {cell.label}
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    marginBottom: GAP,
  },
  headerText: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: '600' },
  grid: { flex: 1 },
  row: { flex: 1, flexDirection: 'row' },
  cellWrap: { flex: 1 },
  settingBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 4,
  },
  settingActive: {
    backgroundColor: theme.colors.actionMenuPurple,
  },
  settingText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  settingTextActive: {
    fontWeight: 'bold',
  },
  emptyCell: { flex: 1, backgroundColor: theme.colors.surfaceLight },
});
