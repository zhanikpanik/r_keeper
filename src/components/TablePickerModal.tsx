import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, LayoutChangeEvent } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/colors';
import { useOrderStore } from '../store/orderStore';
import { floorZones, FloorTable, SIZE_W, SIZE_H } from '../mocks/floorPlan';

const GAP = 8;

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const TablePickerModal: React.FC<Props> = ({ visible, onClose }) => {
  const { tableId } = useOrderStore();
  const orders = useOrderStore((s) => s.orders);
  const [zoneIdx, setZoneIdx] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const zone = floorZones[zoneIdx];

  const handleLayout = (e: LayoutChangeEvent) => {
    setCanvasSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  };

  const getOrderForTable = (id: string) => {
    return orders.find(o => o.tableId === id && o.status !== 'inactive');
  };

  const getTableColor = (table: FloorTable): string => {
    if (table.id === tableId) return theme.colors.tabActive; // current table = purple
    const order = getOrderForTable(table.id);
    if (!order) return theme.colors.surfaceLight; // free
    if (order.status === 'alert') return theme.colors.orderAlert;
    return theme.colors.orderActive; // occupied
  };

  const handleSelect = (table: FloorTable) => {
    useOrderStore.setState((state) => ({
      tableNumber: table.number,
      tableId: table.id,
      orders: state.orders.map(o =>
        o.id === state.currentOrderId
          ? { ...o, tableNumber: table.number, tableId: table.id, zone: table.zone }
          : o
      ),
    }));
    onClose();
  };

  // Grid calculations
  const cellFromW = canvasSize.w > 0 ? (canvasSize.w - (zone.cols - 1) * GAP) / zone.cols : 0;
  const cellFromH = canvasSize.h > 0 ? (canvasSize.h - (zone.rows - 1) * GAP) / zone.rows : 0;
  const cellSize = Math.min(cellFromW, cellFromH);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Выбор стола</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Zone selector */}
          <View style={styles.zoneRow}>
            <TouchableOpacity
              style={styles.zoneArrow}
              onPress={() => setZoneIdx(i => Math.max(0, i - 1))}
              disabled={zoneIdx === 0}
            >
              <Feather name="chevron-left" size={20} color={zoneIdx === 0 ? '#555' : '#fff'} />
            </TouchableOpacity>
            <Text style={styles.zoneName}>{zone.name}</Text>
            <TouchableOpacity
              style={styles.zoneArrow}
              onPress={() => setZoneIdx(i => Math.min(floorZones.length - 1, i + 1))}
              disabled={zoneIdx === floorZones.length - 1}
            >
              <Feather name="chevron-right" size={20} color={zoneIdx === floorZones.length - 1 ? '#555' : '#fff'} />
            </TouchableOpacity>
          </View>

          {/* Floor plan canvas */}
          <View style={styles.canvas} onLayout={handleLayout}>
            {cellSize > 0 && (() => {
              const gridW = zone.cols * cellSize + (zone.cols - 1) * GAP;
              const gridH = zone.rows * cellSize + (zone.rows - 1) * GAP;
              const offsetX = (canvasSize.w - gridW) / 2;
              const offsetY = (canvasSize.h - gridH) / 2;

              return zone.tables.map((table) => {
                const bgColor = getTableColor(table);
                const isCurrent = table.id === tableId;
                const order = getOrderForTable(table.id);

                const sw = SIZE_W[table.size];
                const sh = SIZE_H[table.size];
                const left = offsetX + table.col * (cellSize + GAP);
                const top = offsetY + table.row * (cellSize + GAP);
                const width = cellSize * sw + GAP * (sw - 1);
                const height = cellSize * sh + GAP * (sh - 1);
                const radius = Math.min(width, height) * 0.2;
                const fontSize = Math.max(14, Math.min(28, cellSize * 0.3));

                return (
                  <TouchableOpacity
                    key={table.id}
                    activeOpacity={0.7}
                    onPress={() => handleSelect(table)}
                    style={[
                      styles.table,
                      {
                        left, top, width, height,
                        backgroundColor: bgColor,
                        borderRadius: radius,
                        borderWidth: isCurrent ? 2 : 0,
                        borderColor: '#fff',
                      },
                    ]}
                  >
                    <Text style={[styles.tableNumber, { fontSize }]}>
                      {table.number}
                    </Text>
                    {order && (
                      <Text style={[styles.tableInfo, { fontSize: fontSize * 0.45 }]}>
                        Занят
                      </Text>
                    )}
                    {isCurrent && (
                      <Text style={[styles.tableInfo, { fontSize: fontSize * 0.45 }]}>
                        Текущий
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              });
            })()}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.surfaceLight }]} />
              <Text style={styles.legendText}>Свободный</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.orderActive }]} />
              <Text style={styles.legendText}>Занят</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.tabActive }]} />
              <Text style={styles.legendText}>Текущий</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '65%',
    maxWidth: 800,
    minWidth: 500,
    height: '75%',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
  },
  zoneArrow: {
    width: 40,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoneName: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  canvas: {
    flex: 1,
    margin: 16,
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
  tableInfo: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
});
