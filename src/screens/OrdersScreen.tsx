import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, SafeAreaView, StatusBar, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/colors';
import { SearchIcon, NotificationIcon } from '../components/Icons';
import { OrderCard } from '../components/OrderCard';
import { FloorPlan } from '../components/FloorPlan';
import { BottomTabBar } from '../components/BottomTabBar';
import { FunctionsModal } from '../components/FunctionsModal';
import { SalesReportModal } from '../components/SalesReportModal';
import { ShiftInfoModal } from '../components/ShiftInfoModal';
import { CloseShiftModal } from '../components/CloseShiftModal';
import { useShiftStore } from '../store/shiftStore';
import { useOrderStore } from '../store/orderStore';
import { useMenuStore } from '../store/menuStore';
import { useVenueStore, VenueTable } from '../store/venueStore';
import { Order } from '../types';

const getCols = (width: number): number => {
  if (width < 1200) return 4;
  if (width < 1800) return 5;
  return 6;
};
const GAP = 8;
const PADDING = 8;

const getRows = (height: number): number => {
  if (height < 800) return 4;
  if (height < 1200) return 5;
  return 6;
};

export const OrdersScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'tables'>('orders');
  const [page, setPage] = useState(0);
  const orders = useOrderStore((s) => s.orders);
  const createOrderForTable = useOrderStore((s) => s.createOrderForTable);
  const createQuickCheck = useOrderStore((s) => s.createQuickCheck);
  const openOrder = useOrderStore((s) => s.openOrder);
  const [menuVisible, setMenuVisible] = useState(false);
  const [zoneIdx, setZoneIdx] = useState(0);
  const [waiterFilterIdx, setWaiterFilterIdx] = useState(-1); // -1 = all
  const [reportVisible, setReportVisible] = useState(false);
  const [shiftInfoVisible, setShiftInfoVisible] = useState(false);
  const [closeShiftVisible, setCloseShiftVisible] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const closeShift = useShiftStore((s) => s.closeShift);
  const logout = useShiftStore((s) => s.logout);
  const [searchQuery, setSearchQuery] = useState('');
  const isOrders = activeTab === 'orders';
  const fetchMenu = useMenuStore((s) => s.fetchMenu);
  const fetchVenue = useVenueStore((s) => s.fetchVenue);
  const fetchOrders = useOrderStore((s) => s.fetchOrders);
  const venueZones = useVenueStore((s) => s.zones);
  const waiters = useVenueStore((s) => s.waiters);

  useEffect(() => {
    fetchMenu();
    fetchVenue();
    fetchOrders();
  }, []);

  // ── Dynamic rows based on screen height ──
  const { height, width } = useWindowDimensions();
  const ROWS = getRows(height);
  const COLUMNS = getCols(width);
  const CELLS_PER_PAGE = COLUMNS * ROWS;
  const ORDER_SLOTS = CELLS_PER_PAGE - 1; // cell 0 = action buttons

  // ── Scale factor for card text ──
  // Available grid height = screen - header(44+GAP) - tabbar(~56) - padding
  const gridHeight = height - 44 - GAP - 56 - PADDING * 2;
  const cardHeight = (gridHeight - GAP * (ROWS - 1)) / ROWS;
  const scale = Math.max(0.8, Math.min(1.5, cardHeight / 120));

  // ── Filter orders by waiter ──
  const waiterFilterName = waiterFilterIdx >= 0 ? waiters[waiterFilterIdx]?.name : null;
  const waiterFiltered = waiterFilterName
    ? orders.filter((o) => o.waiter === waiterFilterName)
    : orders;

  // ── Filter orders by search ──
  const filteredOrders = searchQuery.trim()
    ? waiterFiltered.filter((o) => {
        const q = searchQuery.toLowerCase();
        return (
          o.number.toLowerCase().includes(q) ||
          (o.tableNumber && o.tableNumber.toLowerCase().includes(q)) ||
          o.waiter.toLowerCase().includes(q) ||
          (o.zone && o.zone.toLowerCase().includes(q))
        );
      })
    : waiterFiltered;

  // ── Pagination (orders only) ──
  const totalItems = filteredOrders.length;
  const needsPagination = totalItems > ORDER_SLOTS;
  const slotsThisView = needsPagination ? ORDER_SLOTS - 1 : ORDER_SLOTS;
  const totalPages = needsPagination ? Math.ceil(totalItems / slotsThisView) : 1;
  const pageItems = filteredOrders.slice(page * slotsThisView, page * slotsThisView + slotsThisView);

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

  // ── Table tap ──
  const handleTablePress = (table: VenueTable, existingOrder?: Order) => {
    if (existingOrder) {
      openOrder(existingOrder.id);
    } else {
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
  while (cells.length < CELLS_PER_PAGE) cells.push({ kind: 'empty' });
  // Always place pagination at the last cell (bottom-right)
  if (needsPagination) cells[CELLS_PER_PAGE - 1] = { kind: 'pagination' };

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
            <TouchableOpacity
              style={styles.filterArrow}
              onPress={() => {
                if (isOrders) {
                  setWaiterFilterIdx(i => Math.max(-1, i - 1));
                  setPage(0);
                } else if (venueZones.length > 0) {
                  setZoneIdx(i => Math.max(0, i - 1));
                }
              }}
            >
              <Feather name="chevron-left" size={22} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.filterCenter}>
              <Text style={[styles.filterLabel, { fontSize: 16 }]}>
                {isOrders
                  ? (waiterFilterIdx < 0 ? 'Все официанты' : (waiters[waiterFilterIdx]?.name || 'Все официанты'))
                  : (venueZones[zoneIdx]?.name || 'Загрузка...')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.filterArrow}
              onPress={() => {
                if (isOrders) {
                  setWaiterFilterIdx(i => Math.min(waiters.length - 1, i + 1));
                  setPage(0);
                } else if (venueZones.length > 0) {
                  setZoneIdx(i => Math.min(venueZones.length - 1, i + 1));
                }
              }}
            >
              <Feather name="chevron-right" size={22} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {searchActive ? (
            <View style={[styles.searchInputWrap, { flex: 2 }]}>
              <SearchIcon size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { fontSize: 16 }]}
                placeholder="Номер, стол, официант..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={(text) => { setSearchQuery(text); setPage(0); }}
                autoFocus
              />
              <TouchableOpacity
                onPress={() => { setSearchActive(false); setSearchQuery(''); setPage(0); }}
                style={styles.searchCloseBtn}
              >
                <Feather name="x" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.reportBtn, { flex: 1, marginRight: GAP }]}
                onPress={() => setReportVisible(true)}
              >
                <Text style={[styles.reportLabel, { fontSize: 14 }]}>Отчет</Text>
              </TouchableOpacity>

              <View style={[styles.headerRight, { flex: 1 }]}>
                <TouchableOpacity style={[styles.bellBtn, { marginRight: GAP }]}>
                  <NotificationIcon size={28} color="#FF9800" />
                  <Text style={[styles.bellBadge, { fontSize: 14 }]}>2</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.searchBtn} onPress={() => setSearchActive(true)}>
                  <SearchIcon size={28} color={theme.colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </>
          )}
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
                          <Text style={[styles.actionLabel, { fontSize: 14 }]}>Новый{'\n'}заказ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionHalf} onPress={handleQuickCheck}>
                          <Feather name="plus" size={24} color="#fff" />
                          <Text style={[styles.actionLabel, { fontSize: 14 }]}>Быстрый{'\n'}чек</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {cell.kind === 'order' && (
                      <OrderCard order={cell.data} onPress={() => handleSelectOrder(cell.data.id)} scale={scale} />
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
            <FloorPlan onTablePress={handleTablePress} zoneIdx={zoneIdx} />
          </View>
        )}

        {/* ═══ BOTTOM TAB BAR ═══ */}
        <BottomTabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onMenuPress={() => setMenuVisible(true)}
          onLockPress={() => navigation.navigate('Lock', { mode: 'lock' })}
          scale={scale}
        />

        <FunctionsModal
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          onOpenReport={() => setReportVisible(true)}
          onOpenShiftInfo={() => setShiftInfoVisible(true)}
          onCloseShift={() => setCloseShiftVisible(true)}
          onLogout={() => {
            logout();
            navigation.replace('Lock');
          }}
        />
        <SalesReportModal visible={reportVisible} onClose={() => setReportVisible(false)} />
        <ShiftInfoModal visible={shiftInfoVisible} onClose={() => setShiftInfoVisible(false)} />
        <CloseShiftModal
          visible={closeShiftVisible}
          onClose={() => setCloseShiftVisible(false)}
          onConfirmClose={() => {
            closeShift();
            setCloseShiftVisible(false);
            navigation.replace('OpenShift');
          }}
        />
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
    backgroundColor: '#333',
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
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterLabel: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: '600' },
  reportBtn: {
    backgroundColor: '#333',
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportLabel: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: '600' },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: theme.borderRadius,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 15,
    paddingVertical: 0,
    outlineStyle: 'none',
  } as any,
  searchCloseBtn: {
    padding: 4,
  },
  headerRight: { flexDirection: 'row' },
  bellBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  bellBadge: { color: '#FF9800', fontSize: 14, fontWeight: 'bold' },
  searchBtn: {
    flex: 1,
    backgroundColor: '#333',
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
    backgroundColor: '#333',
    borderRadius: theme.borderRadius,
    overflow: 'hidden',
  },
  pageHalf: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pageDisabled: { opacity: 0.4 },
  pageDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
});
