import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/colors';
import { useOrderStore } from '../store/orderStore';
import { floorZones, FloorTable, SIZE_W, SIZE_H } from '../mocks/floorPlan';
import { Order } from '../types';

const GAP = 8;
const formatAmount = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

interface Props {
  onTablePress: (table: FloorTable, existingOrder?: Order) => void;
}

export const FloorPlan: React.FC<Props> = ({ onTablePress }) => {
  const [zoneIdx, setZoneIdx] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const orders = useOrderStore((s) => s.orders);
  const zone = floorZones[zoneIdx];

  const handleLayout = (e: LayoutChangeEvent) => {
    setCanvasSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  };

  const getOrderForTable = (tableId: string): Order | undefined => {
    return orders.find(o => o.tableId === tableId && o.status !== 'inactive');
  };

  const getTableColor = (order?: Order): string => {
    if (!order) return theme.colors.orderDefault;
    if (order.status === 'alert') return theme.colors.orderAlert;
    if (order.status === 'paid') return theme.colors.orderActive;
    return theme.colors.orderActive;
  };

  const getBorderRadius = (size: string, w: number, h: number): number => {
    const minDim = Math.min(w, h);
    if (size === 'small') return minDim * 0.2;
    return minDim * 0.2;
  };

  const handlePrevZone = () => setZoneIdx(i => Math.max(0, i - 1));
  const handleNextZone = () => setZoneIdx(i => Math.min(floorZones.length - 1, i + 1));

  // Square cells
  const cellFromW = canvasSize.w > 0 ? (canvasSize.w - (zone.cols - 1) * GAP) / zone.cols : 0;
  const cellFromH = canvasSize.h > 0 ? (canvasSize.h - (zone.rows - 1) * GAP) / zone.rows : 0;
  const cellSize = Math.min(cellFromW, cellFromH);

  return (
    <View style={styles.container}>
      {/* Zone selector */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.zoneArrow} onPress={handlePrevZone} disabled={zoneIdx === 0}>
          <Feather name="chevron-left" size={22} color={zoneIdx === 0 ? '#555' : '#fff'} />
        </TouchableOpacity>
        <View style={styles.zoneNameWrap}>
          <Text style={styles.zoneName}>{zone.name}</Text>
        </View>
        <TouchableOpacity style={styles.zoneArrow} onPress={handleNextZone} disabled={zoneIdx === floorZones.length - 1}>
          <Feather name="chevron-right" size={22} color={zoneIdx === floorZones.length - 1 ? '#555' : '#fff'} />
        </TouchableOpacity>
      </View>

      {/* Canvas */}
      <View style={styles.canvas} onLayout={handleLayout}>
        {cellSize > 0 && (() => {
          const gridW = zone.cols * cellSize + (zone.cols - 1) * GAP;
          const gridH = zone.rows * cellSize + (zone.rows - 1) * GAP;
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

            const radius = getBorderRadius(table.size, width, height);
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
                    borderRadius: radius,
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
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
  },
  zoneArrow: {
    width: 44,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoneNameWrap: {
    flex: 1,
    alignItems: 'center',
  },
  zoneName: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
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
