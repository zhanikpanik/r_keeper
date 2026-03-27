import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/colors';
import { useOrderStore } from '../store/orderStore';
import { floorZones, GRID, FloorTable } from '../mocks/floorPlan';
import { Order } from '../types';

interface Props {
  onTablePress: (table: FloorTable, existingOrder?: Order) => void;
}

const formatAmount = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export const FloorPlan: React.FC<Props> = ({ onTablePress }) => {
  const [zoneIdx, setZoneIdx] = useState(0);
  const orders = useOrderStore((s) => s.orders);
  const zone = floorZones[zoneIdx];
  const { width: windowW, height: windowH } = useWindowDimensions();

  // Auto-detect grid bounds from actual table positions
  const { maxCol, maxRow } = useMemo(() => {
    let mc = 0, mr = 0;
    zone.tables.forEach(t => {
      const colEnd = t.col + (t.size === 'large' ? 2 : 1);
      if (colEnd > mc) mc = colEnd;
      if (t.row + 1 > mr) mr = t.row + 1;
    });
    return { maxCol: mc, maxRow: mr };
  }, [zone]);

  const getOrderForTable = (tableId: string): Order | undefined => {
    return orders.find(o => o.tableId === tableId && o.status !== 'inactive');
  };

  const handlePrevZone = () => setZoneIdx(i => Math.max(0, i - 1));
  const handleNextZone = () => setZoneIdx(i => Math.min(floorZones.length - 1, i + 1));

  const getTableColor = (order?: Order): string => {
    if (!order) return theme.colors.surfaceLight;
    if (order.status === 'alert') return theme.colors.orderAlert;
    return theme.colors.orderActive;
  };

  // Fill available space
  const canvasPad = 16;
  const availW = windowW - 32 - canvasPad * 2;   // page padding + canvas padding
  const availH = windowH - 160 - canvasPad * 2;  // header + tab bar + zone header

  const cellW = (availW - (maxCol - 1) * GRID.gap) / maxCol;
  const cellH = (availH - (maxRow - 1) * GRID.gap) / maxRow;

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

      {/* Grid canvas */}
      <View style={[styles.canvas, { padding: canvasPad }]}>
        {zone.tables.map((table) => {
          const order = getOrderForTable(table.id);
          const isOccupied = !!order;
          const bgColor = getTableColor(order);

          const isLarge = table.size === 'large';
          const w = isLarge ? cellW * 2 + GRID.gap : cellW;
          const h = cellH;
          const left = table.col * (cellW + GRID.gap);
          const top = table.row * (cellH + GRID.gap);

          return (
            <TouchableOpacity
              key={table.id}
              activeOpacity={0.7}
              onPress={() => onTablePress(table, order)}
              style={[
                styles.table,
                {
                  width: w,
                  height: h,
                  left,
                  top,
                  backgroundColor: bgColor,
                  borderColor: isOccupied ? 'transparent' : theme.colors.divider,
                },
              ]}
            >
              <View style={styles.tableTopRow}>
                <Text style={[styles.tableNumber, { fontSize: Math.max(14, cellH * 0.2) }]}>
                  {table.number}
                </Text>
                {isOccupied && order && (
                  <Text style={[styles.tableAmount, { fontSize: Math.max(11, cellH * 0.13) }]}>
                    {formatAmount(order.totalAmount)} ₽
                  </Text>
                )}
              </View>

              {isOccupied && order ? (
                <Text style={[styles.tableTime, { fontSize: Math.max(10, cellH * 0.11) }]}>
                  {order.waiter} · {order.openedAt}
                </Text>
              ) : (
                <Text style={[styles.tableFreeLabel, { fontSize: Math.max(10, cellH * 0.11) }]}>
                  {table.capacity} мест
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  zoneArrow: {
    width: 48,
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
    position: 'relative',
  },

  table: {
    position: 'absolute',
    borderRadius: theme.borderRadius,
    borderWidth: 1,
    padding: 10,
    justifyContent: 'space-between',
  },

  tableTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tableNumber: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tableAmount: {
    color: '#fff',
    fontWeight: '600',
  },
  tableTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  tableFreeLabel: {
    color: 'rgba(255,255,255,0.4)',
  },
});
