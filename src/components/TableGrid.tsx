import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/colors';
import { useOrderStore } from '../store/orderStore';
import { Order } from '../types';

const GAP = 8;
const PADDING = 8;

const formatAmount = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// Table data — will come from user-created halls later
export interface TableDef {
  id: string;
  number: string;
  zone: string;
  capacity: number;
}

const allTables: TableDef[] = [
  // Основной зал
  { id: 't1', number: '1', zone: 'Основной зал', capacity: 6 },
  { id: 't2', number: '2', zone: 'Основной зал', capacity: 4 },
  { id: 't3', number: '3', zone: 'Основной зал', capacity: 4 },
  { id: 't4', number: '4', zone: 'Основной зал', capacity: 4 },
  { id: 't5', number: '5', zone: 'Основной зал', capacity: 6 },
  { id: 't6', number: '6', zone: 'Основной зал', capacity: 4 },
  { id: 't7', number: '7', zone: 'Основной зал', capacity: 2 },
  { id: 't8', number: '8', zone: 'Основной зал', capacity: 4 },
  { id: 't9', number: '9', zone: 'Основной зал', capacity: 4 },
  { id: 't10', number: '10', zone: 'Основной зал', capacity: 4 },
  { id: 't11', number: '11', zone: 'Основной зал', capacity: 4 },
  { id: 't12', number: '12', zone: 'Основной зал', capacity: 2 },
  { id: 't13', number: '13', zone: 'Основной зал', capacity: 2 },
  // Веранда
  { id: 'v1', number: '21', zone: 'Веранда', capacity: 6 },
  { id: 'v2', number: '22', zone: 'Веранда', capacity: 6 },
  { id: 'v3', number: '23', zone: 'Веранда', capacity: 4 },
  { id: 'v4', number: '24', zone: 'Веранда', capacity: 4 },
  { id: 'v5', number: '25', zone: 'Веранда', capacity: 4 },
  { id: 'v6', number: '26', zone: 'Веранда', capacity: 4 },
];

const getRows = (height: number): number => {
  if (height < 900) return 5;
  if (height < 1200) return 5;
  return 6;
};

const getCols = (width: number): number => {
  if (width < 1200) return 4;
  if (width < 1800) return 5;
  return 6;
};

interface Props {
  onTablePress: (table: TableDef, existingOrder?: Order) => void;
}

export const TableGrid: React.FC<Props> = ({ onTablePress }) => {
  const orders = useOrderStore((s) => s.orders);
  const { height, width } = useWindowDimensions();

  const ROWS = getRows(height);
  const COLUMNS = getCols(width);
  const CELLS_PER_PAGE = COLUMNS * ROWS;

  const gridHeight = height - 44 - GAP - 56 - PADDING * 2;
  const cardHeight = (gridHeight - GAP * (ROWS - 1)) / ROWS;
  const scale = Math.max(0.7, Math.min(1.4, cardHeight / 150));

  const getOrderForTable = (tableId: string): Order | undefined => {
    return orders.find(o => o.tableId === tableId && o.status !== 'inactive');
  };

  const getTableColor = (order?: Order): string => {
    if (!order) return theme.colors.orderDefault;
    if (order.status === 'alert') return theme.colors.orderAlert;
    if (order.status === 'paid') return theme.colors.orderActive;
    return theme.colors.orderActive;
  };

  // Build cells
  type Cell = { kind: 'table'; table: TableDef; order?: Order } | { kind: 'empty' };
  const cells: Cell[] = allTables.map(t => ({
    kind: 'table' as const,
    table: t,
    order: getOrderForTable(t.id),
  }));
  while (cells.length < CELLS_PER_PAGE) cells.push({ kind: 'empty' });

  const rows: Cell[][] = [];
  for (let r = 0; r < ROWS; r++) {
    rows.push(cells.slice(r * COLUMNS, r * COLUMNS + COLUMNS));
  }

  return (
    <View style={styles.container}>
      {rows.map((row, ri) => (
        <View key={ri} style={[styles.row, ri < ROWS - 1 && { marginBottom: GAP }]}>
          {row.map((cell, ci) => (
            <View key={ci} style={[styles.cellWrap, ci < COLUMNS - 1 && { marginRight: GAP }]}>
              {cell.kind === 'table' ? (
                <TouchableOpacity
                  style={[styles.card, { backgroundColor: getTableColor(cell.order), padding: 14 * scale }]}
                  onPress={() => onTablePress(cell.table, cell.order)}
                  activeOpacity={0.8}
                >
                  <View style={styles.topRow}>
                    <Text style={[styles.number, { fontSize: 40 * scale, lineHeight: 44 * scale }]}>
                      {cell.table.number}
                    </Text>
                    {cell.order ? (
                      <Text style={[styles.amount, { fontSize: 14 * scale }]}>
                        {formatAmount(cell.order.totalAmount)} ₽
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.bottomRow}>
                    {cell.order ? (
                      <>
                        <Text style={[styles.details, { fontSize: 14 * scale }]}>{cell.order.waiter}</Text>
                        <Text style={[styles.details, { fontSize: 14 * scale }]}>{cell.order.openedAt}</Text>
                      </>
                    ) : (
                      <Text style={[styles.capacity, { fontSize: 14 * scale }]}>{cell.table.capacity} мест</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.emptyCell} />
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  row: { flex: 1, flexDirection: 'row' },
  cellWrap: { flex: 1, borderRadius: theme.borderRadius, overflow: 'hidden' },
  card: {
    flex: 1,
    borderRadius: theme.borderRadius,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  number: {
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
  },
  amount: {
    color: theme.colors.textPrimary,
    fontWeight: '500',
    opacity: 0.9,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  details: {
    color: theme.colors.textPrimary,
    opacity: 0.6,
    fontWeight: '400',
  },
  capacity: {
    color: theme.colors.textPrimary,
    opacity: 0.3,
    fontWeight: '400',
  },
  emptyCell: { flex: 1 },
});
