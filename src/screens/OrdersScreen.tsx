import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView, StatusBar, useWindowDimensions } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme/colors';
import { OrderCard } from '../components/OrderCard';
import { FloorPlan } from '../components/FloorPlan';
import { BottomTabBar } from '../components/BottomTabBar';
import { useOrderStore } from '../store/orderStore';
import { FloorTable } from '../mocks/floorPlan';
import { Order } from '../types';

const COLUMNS = 4;
const GAP = 8;
const PADDING = 8;

const getRows = (height: number): number => {
  if (height < 500) return 2;
  if (height < 800) return 3;
  if (height < 1000) return 4;
  return 5;
};

export const OrdersScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'tables'>('orders');
  const [page, setPage] = useState(0);
  const orders = useOrderStore((s) => s.orders);
  const createOrderForTable = useOrderStore((s) => s.createOrderForTable);
  const createQuickCheck = useOrderStore((s) => s.createQuickCheck);
  const openOrder = useOrderStore((s) => s.openOrder);
  const isOrders = activeTab === 'orders';

  // ── Dynamic rows based on screen height ──
  const { height } = useWindowDimensions();
  const ROWS = getRows(height);
  const CELLS_PER_PAGE = COLUMNS * ROWS;
  const ORDER_SLOTS = CELLS_PER_PAGE - 1; // cell 0 = action buttons

  // ── Pagination (orders only) ──
  const totalItems = orders.length;
  const needsPagination = totalItems > ORDER_SLOTS;
  const slotsThisView = needsPagination ? ORDER_SLOTS - 1 : ORDER_SLOTS;
  const totalPages = needsPagination ? Math.ceil(totalItems / slotsThisView) : 1;
  const pageItems = orders.slice(page * slotsThisView, page * slotsThisView + slotsThisView);

  // ── "Новый заказ" → switch to tables tab to pick a table ──
  const handleNewOrder = () => {
    setActiveTab('tables');
  };

  const handleQuickCheck = () => {
    createQuickCheck();
    navigation.navigate('Pos');
  };

  const handleSelectOrder = (orderId: string) => {
    openOrder(orderId);
    navigation.navigate('Pos');
  };

  // ── Table tap from floor plan ──
  const handleTablePress = (table: FloorTable, existingOrder?: Order) => {
    if (existingOrder) {
      // Table has an active order → open it
      openOrder(existingOrder.id);
    } else {
      // Free table → create new order
      createOrderForTable(table.id, table.number, table.zone);
    }
    navigation.navigate('Pos');
  };

  const handlePageUp = () => setPage((p) => Math.max(0, p - 1));
  const handlePageDown = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  // ── Build flat cell list for orders grid ──
  type Cell =
    | { kind: 'actions' }
    | { kind: 'order'; data: Order }
    | { kind: 'pagination' }
    | { kind: 'empty' };

  const cells: Cell[] = [{ kind: 'actions' }];
  pageItems.forEach((item) => cells.push({ kind: 'order', data: item }));
  if (needsPagination) cells.push({ kind: 'pagination' });
  while (cells.length < CELLS_PER_PAGE) cells.push({ kind: 'empty' });

  const rows: Cell[][] = [];
  for (let r = 0; r < ROWS; r++) {
    rows.push(cells.slice(r * COLUMNS, r * COLUMNS + COLUMNS));
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar hidden />
      <View style={styles.root}>

        {/* ═══ HEADER ROW ═══ */}
        <View style={[styles.headerRow, { marginHorizontal: PADDING, marginBottom: GAP }]}>
          <View style={[styles.filterBox, { flex: 2, marginRight: GAP }]}>
            <TouchableOpacity style={styles.filterArrow}>
              <Feather name="chevron-left" size={22} color={theme.colors.tabActive} />
            </TouchableOpacity>
            <View style={styles.filterCenter}>
              <Text style={styles.filterLabel}>{isOrders ? 'Все официанты' : 'Все залы'}</Text>
            </View>
            <TouchableOpacity style={styles.filterArrow}>
              <Feather name="chevron-right" size={22} color={theme.colors.tabActive} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.toggleBtn, { flex: 1, marginRight: GAP }]}>
            <Text style={styles.toggleLabel}>{isOrders ? 'По официантам' : 'По залам'}</Text>
          </TouchableOpacity>

          <View style={[styles.headerRight, { flex: 1 }]}>
            <TouchableOpacity style={[styles.bellBtn, { marginRight: GAP }]}>
              <MaterialCommunityIcons name="bell" size={20} color="#FF9800" />
              <Text style={styles.bellBadge}>2</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchBtn}>
              <Feather name="search" size={20} color={theme.colors.tabActive} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══ CONTENT ═══ */}
        {isOrders ? (
          /* Orders grid */
          <View style={[styles.gridArea, { marginHorizontal: PADDING }]}>
            {rows.map((row, rowIdx) => (
              <View
                key={rowIdx}
                style={[styles.gridRow, rowIdx < ROWS - 1 ? { marginBottom: GAP } : undefined]}
              >
                {row.map((cell, colIdx) => (
                  <View
                    key={colIdx}
                    style={[styles.cellWrap, colIdx < COLUMNS - 1 ? { marginRight: GAP } : undefined]}
                  >
                    {cell.kind === 'actions' && (
                      <View style={styles.actionsCell}>
                        <TouchableOpacity style={[styles.actionHalf, { marginRight: GAP }]} onPress={handleNewOrder}>
                          <Feather name="plus" size={24} color="#fff" />
                          <Text style={styles.actionLabel}>Новый{'\n'}заказ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionHalf} onPress={handleQuickCheck}>
                          <Feather name="plus" size={24} color="#fff" />
                          <Text style={styles.actionLabel}>Быстрый{'\n'}чек</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {cell.kind === 'order' && (
                      <OrderCard order={cell.data} onPress={() => handleSelectOrder(cell.data.id)} />
                    )}

                    {cell.kind === 'pagination' && (
                      <View style={styles.paginationCell}>
                        <TouchableOpacity
                          style={[styles.pageHalf, page === 0 && styles.pageDisabled]}
                          onPress={handlePageUp}
                          disabled={page === 0}
                        >
                          <Feather name="chevron-up" size={28} color={page === 0 ? '#999' : theme.colors.tabActive} />
                        </TouchableOpacity>
                        <View style={styles.pageDivider} />
                        <TouchableOpacity
                          style={[styles.pageHalf, page >= totalPages - 1 && styles.pageDisabled]}
                          onPress={handlePageDown}
                          disabled={page >= totalPages - 1}
                        >
                          <Feather name="chevron-down" size={28} color={page >= totalPages - 1 ? '#999' : theme.colors.tabActive} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : (
          /* Floor plan */
          <View style={[styles.floorPlanArea, { marginHorizontal: PADDING }]}>
            <FloorPlan onTablePress={handleTablePress} />
          </View>
        )}

        {/* ═══ BOTTOM TAB BAR ═══ */}
        <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  root: { flex: 1 },

  headerRow: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: PADDING,
  },
  filterBox: {
    flexDirection: 'row',
    backgroundColor: '#E8EAF6',
    borderRadius: theme.borderRadius,
    overflow: 'hidden',
  },
  filterArrow: { width: 44, justifyContent: 'center', alignItems: 'center' },
  filterCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(91,79,232,0.15)',
  },
  filterLabel: { color: theme.colors.tabActive, fontSize: 15, fontWeight: '600' },
  toggleBtn: {
    backgroundColor: '#E8EAF6',
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleLabel: { color: theme.colors.tabActive, fontSize: 14, fontWeight: '600' },
  headerRight: { flexDirection: 'row' },
  bellBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  bellBadge: { color: '#FF9800', fontSize: 14, fontWeight: 'bold' },
  searchBtn: {
    flex: 1,
    backgroundColor: '#E8EAF6',
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },

  gridArea: { flex: 1, marginBottom: GAP },
  gridRow: { flex: 1, flexDirection: 'row' },
  cellWrap: { flex: 1, borderRadius: theme.borderRadius, overflow: 'hidden' },

  floorPlanArea: {
    flex: 1,
    marginBottom: GAP,
    borderRadius: theme.borderRadius,
    overflow: 'hidden',
  },

  actionsCell: { flex: 1, flexDirection: 'row' },
  actionHalf: {
    flex: 1,
    backgroundColor: '#00C853',
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  actionLabel: { color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'center' },

  paginationCell: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#E8EAF6',
    borderRadius: theme.borderRadius,
    overflow: 'hidden',
  },
  pageHalf: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pageDisabled: { opacity: 0.4 },
  pageDivider: { width: 1, backgroundColor: 'rgba(91,79,232,0.15)' },
});
