import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutChangeEvent } from 'react-native';
import { theme } from '../theme/colors';
import { useOrderStore } from '../store/orderStore';
import { useVenueStore, VenueTable } from '../store/venueStore';
import { Order } from '../types';

const SIZE_W: Record<string, number> = { small: 1, regular: 2, wide: 3, tall: 1, bar: 1, square: 2 };
const SIZE_H: Record<string, number> = { small: 1, regular: 1, wide: 1, tall: 2, bar: 3, square: 2 };

const GAP = 8;
const PADDING = 16;
const formatAmount = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

interface Props {
  onTablePress: (table: VenueTable, existingOrder?: Order) => void;
  zoneIdx?: number;
}

export const FloorPlan: React.FC<Props> = ({ onTablePress, zoneIdx = 0 }) => {
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const orders = useOrderStore((s) => s.orders);
  const zones = useVenueStore((s) => s.zones);
  const zone = zones[zoneIdx];

  if (!zone) return null;

  const handleLayout = (e: LayoutChangeEvent) => {
    setCanvasSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  };

  const getOrderForTable = (tableId: string): Order | undefined => {
    return orders.find(o => o.tableId === tableId && o.status !== 'cancelled');
  };

  const getTableColor = (order?: Order): string => {
    if (!order) return theme.colors.orderDefault;
    if (order.status === 'alert') return theme.colors.orderAlert;
    if (order.status === 'paid') return theme.colors.orderActive;
    return theme.colors.orderActive;
  };

  // Auto-calculate grid bounds from actual table positions
  let maxCol = zone.cols;
  let maxRow = zone.rows;
  zone.tables.forEach((t) => {
    const sw = SIZE_W[t.size];
    const sh = SIZE_H[t.size];
    maxCol = Math.max(maxCol, t.col + sw);
    maxRow = Math.max(maxRow, t.row + sh);
  });

  // Square cells with padding
  const availW = canvasSize.w - PADDING * 2;
  const availH = canvasSize.h - PADDING * 2;
  const cellFromW = availW > 0 ? (availW - (maxCol - 1) * GAP) / maxCol : 0;
  const cellFromH = availH > 0 ? (availH - (maxRow - 1) * GAP) / maxRow : 0;
  const cellSize = Math.min(cellFromW, cellFromH);

  return (
    <View style={styles.container}>
      <View style={styles.canvas} onLayout={handleLayout}>
        {cellSize > 0 && (() => {
          const gridW = maxCol * cellSize + (maxCol - 1) * GAP;
          const gridH = maxRow * cellSize + (maxRow - 1) * GAP;
          const offsetX = (canvasSize.w - gridW) / 2;
          const offsetY = (canvasSize.h - gridH) / 2;

          return zone.tables.map((table) => {
            const order = getOrderForTable(table.id);
            const bgColor = getTableColor(order);

            const sw = SIZE_W[table.size];
            const sh = SIZE_H[table.size];

            const left = offsetX + table.col * (cellSize + GAP);
            const top = offsetY + table.row * (cellSize + GAP);
            const width = cellSize * sw + GAP * (sw - 1);
            const height = cellSize * sh + GAP * (sh - 1);
            const fontSize = Math.max(16, Math.min(36, cellSize * 0.35));

            return (
              <TouchableOpacity
                key={table.id}
                activeOpacity={0.7}
                onPress={() => onTablePress(table, order)}
                style={[
                  styles.table,
                  {
                    left,
                    top,
                    width,
                    height,
                    backgroundColor: bgColor,
                    borderRadius: 8,
                  },
                ]}
              >
                <Text style={[styles.tableNumber, { fontSize }]}>
                  {table.number}
                </Text>
                {order && (
                  <Text style={[styles.tableAmount, { fontSize: fontSize * 0.4 }]}>
                    {formatAmount(order.totalAmount)} ₽
                  </Text>
                )}
              </TouchableOpacity>
            );
          });
        })()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    flex: 1,
  },
  table: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableNumber: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tableAmount: {
    color: '#fff',
    opacity: 0.6,
    fontWeight: '500',
    marginTop: 2,
  },
});
