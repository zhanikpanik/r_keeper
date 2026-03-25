import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView, StatusBar, useWindowDimensions } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme/colors';
import { OrderCard } from '../components/OrderCard';
import { TableCard } from '../components/TableCard';
import { BottomTabBar } from '../components/BottomTabBar';
import { mockOrders, mockTables } from '../mocks/mockData';
import { useOrderStore } from '../store/orderStore';

const COLUMNS = 4;
const ROWS = 5;
const GAP = 8;
const PADDING = 8;
const CELLS_PER_PAGE = COLUMNS * ROWS; // 20
const ORDER_SLOTS = CELLS_PER_PAGE - 1; // 19 (cell 0 = action buttons)

export const OrdersScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { width: ww, height: wh } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<'orders' | 'tables'>('orders');
  const [page, setPage] = useState(0);
  const clearOrder = useOrderStore((s) => s.clearOrder);
  const isOrders = activeTab === 'orders';

  // ── Data & pagination ──
  const allItems = isOrders ? mockOrders : mockTables;
  const totalItems = allItems.length;
  const needsPagination = totalItems > ORDER_SLOTS;
  const slotsThisView = needsPagination ? ORDER_SLOTS - 1 : ORDER_SLOTS; // 18 if paginated, 19 if not
  const totalPages = needsPagination ? Math.ceil(totalItems / slotsThisView) : 1;
  const pageItems = allItems.slice(page * slotsThisView, page * slotsThisView + slotsThisView);

  const handleNewOrder = () => { clearOrder(); navigation.navigate('Pos'); };
  const handleQuickCheck = () => { navigation.navigate('Pos'); };
  const handleSelect = (_id: string) => { navigation.navigate('Pos'); };
  const handlePageUp = () => setPage((p) => Math.max(0, p - 1));
  const handlePageDown = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  // ── Build flat cell list (always exactly 20 cells) ──
  type Cell =
    | { kind: 'actions' }
    | { kind: 'order'; data: typeof mockOrders[0] }
    | { kind: 'table'; data: typeof mockTables[0] }
    | { kind: 'pagination' }
    | { kind: 'empty' };

  const cells: Cell[] = [];
  if (isOrders) cells.push({ kind: 'actions' });
  pageItems.forEach((item) => {
    if (isOrders) cells.push({ kind: 'order', data: item as typeof mockOrders[0] });
    else cells.push({ kind: 'table', data: item as typeof mockTables[0] });
  });
  if (needsPagination) cells.push({ kind: 'pagination' });
  while (cells.length < CELLS_PER_PAGE) cells.push({ kind: 'empty' });

  // ── Build rows ──
  const rows: Cell[][] = [];
  for (let r = 0; r < ROWS; r++) {
    rows.push(cells.slice(r * COLUMNS, r * COLUMNS + COLUMNS));
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar hidden />
      <View style={styles.root}>

        {/* ═══ HEADER ROW (flex: 0.5 relative to card rows) ═══ */}
        <View style={[styles.headerRow, { marginHorizontal: PADDING, marginBottom: GAP }]}>
          {/* Col 1–2: Waiter filter */}
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

          {/* Col 3: Toggle */}
          <TouchableOpacity style={[styles.toggleBtn, { flex: 1, marginRight: GAP }]}>
            <Text style={styles.toggleLabel}>{isOrders ? 'По официантам' : 'По залам'}</Text>
          </TouchableOpacity>

          {/* Col 4: Bell + Search */}
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

        {/* ═══ GRID — 5 rows, flex-based so it always fills exactly ═══ */}
        <View style={[styles.gridArea, { marginHorizontal: PADDING }]}>
          {rows.map((row, rowIdx) => (
            <View
              key={rowIdx}
              style={[
                styles.gridRow,
                rowIdx < ROWS - 1 ? { marginBottom: GAP } : undefined,
              ]}
            >
              {row.map((cell, colIdx) => (
                <View
                  key={colIdx}
                  style={[
                    styles.cellWrap,
                    colIdx < COLUMNS - 1 ? { marginRight: GAP } : undefined,
                  ]}
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
                    <OrderCard order={cell.data} onPress={() => handleSelect(cell.data.id)} />
                  )}

                  {cell.kind === 'table' && (
                    <TableCard table={cell.data} onPress={() => handleSelect(cell.data.id)} />
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

                  {/* empty = nothing rendered, just takes space */}
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* ═══ BOTTOM TAB BAR ═══ */}
        <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  root: { flex: 1 },

  /* ── Header ── */
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

  /* ── Grid ── */
  gridArea: {
    flex: 1,
    marginBottom: GAP,
  },
  gridRow: {
    flex: 1,         // each row stretches equally → 5 equal rows
    flexDirection: 'row',
  },
  cellWrap: {
    flex: 1,         // each cell stretches equally → 4 equal columns
    borderRadius: theme.borderRadius,
    overflow: 'hidden',
  },

  /* ── Action cell ── */
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

  /* ── Pagination cell ── */
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
