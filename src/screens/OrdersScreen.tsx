import React, { useState } from 'react';
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paid'>('all');
  const [reportVisible, setReportVisible] = useState(false);
  const [shiftInfoVisible, setShiftInfoVisible] = useState(false);
  const [closeShiftVisible, setCloseShiftVisible] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [sortMode, setSortMode] = useState<'time' | 'table'>('time');
  const closeShift = useShiftStore((s) => s.closeShift);
  const logout = useShiftStore((s) => s.logout);
  const [searchQuery, setSearchQuery] = useState('');
  const isOrders = activeTab === 'orders';
  const venueZones = useVenueStore((s) => s.zones);

  // Data is fetched once at App level — no need to re-fetch on mount

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

  // ── Filter orders by status ──
  const statusFiltered = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter);

  // ── Filter orders by search ──
  const filteredOrders = searchQuery.trim()
    ? statusFiltered.filter((o) => {
        const q = searchQuery.toLowerCase();
        return (
          o.number.toLowerCase().includes(q) ||
          (o.tableNumber && o.tableNumber.toLowerCase().includes(q)) ||
          o.waiter.toLowerCase().includes(q) ||
          (o.zone && o.zone.toLowerCase().includes(q))
        );
      })
    : statusFiltered;

  const STATUS_LABELS: Record<string, string> = {
    all: 'Все заказы',
    active: 'Открытые заказы',
    paid: 'Закрытые заказы',
  };

  const SORT_LABELS: Record<string, string> = {
    time: 'По времени',
    table: 'По столам',
  };

  // ── Sort ──
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortMode === 'table') return (a.tableNumber || '').localeCompare(b.tableNumber || '', undefined, { numeric: true });
    return 0; // 'time' — already sorted by DB query
  });

  // ── Pagination (orders only) ──
  const totalItems = sortedOrders.length;
  const needsPagination = totalItems > ORDER_SLOTS;
  const slotsThisView = needsPagination ? ORDER_SLOTS - 1 : ORDER_SLOTS;
  const totalPages = needsPagination ? Math.ceil(totalItems / slotsThisView) : 1;
  const pageItems = sortedOrders.slice(page * slotsThisView, page * slotsThisView + slotsThisView);


  const handleQuickCheck = () => {
    createQuickCheck();
    navigation.navigate('Pos');
  };

  const handleSelectOrder = (orderId: string) => {
    openOrder(orderId);
    const order = useOrderStore.getState().orders.find(o => o.id === orderId);
    navigation.navigate(order?.status === 'paid' ? 'PaidCheck' : 'Pos');
  };

  // ── Table tap ──
  const handleTablePress = (table: VenueTable, existingOrder?: Order) => {
    if (existingOrder) {
      openOrder(existingOrder.id);
      navigation.navigate(existingOrder.status === 'paid' ? 'PaidCheck' : 'Pos');
    } else {
      createOrderForTable(table.id, table.number, table.zone);
      navigation.navigate('Pos');
    }
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
          {searchActive ? (
            <View style={styles.searchInputWrap}>
              <SearchIcon size={18} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Номер, стол, официант..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={(text) => { setSearchQuery(text); setPage(0); }}
                autoFocus
              />
              <TouchableOpacity onPress={() => { setSearchActive(false); setSearchQuery(''); setPage(0); }} style={styles.searchCloseBtn}>
                <Feather name="x" size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Status filter chip */}
              <View style={styles.dropdownWrap}>
                <TouchableOpacity
                  style={styles.filterChip}
                  onPress={() => { setStatusDropdownOpen(o => !o); setSortDropdownOpen(false); }}
                >
                  <Text style={styles.filterChipText}>{STATUS_LABELS[statusFilter]}</Text>
                  <Feather name="chevron-down" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
                {statusDropdownOpen && (
                  <View style={styles.dropdown}>
                    {(['all', 'active', 'paid'] as const).map(s => (
                      <TouchableOpacity
                        key={s}
                        style={[styles.dropdownItem, statusFilter === s && styles.dropdownItemActive]}
                        onPress={() => { setStatusFilter(s); setStatusDropdownOpen(false); setPage(0); }}
                      >
                        <Text style={[styles.dropdownItemText, statusFilter === s && styles.dropdownItemTextActive]}>
                          {STATUS_LABELS[s]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Sort chip — only on orders tab */}
              {isOrders && (
                <View style={[styles.dropdownWrap, { marginLeft: GAP }]}>
                  <TouchableOpacity
                    style={styles.filterChip}
                    onPress={() => { setSortDropdownOpen(o => !o); setStatusDropdownOpen(false); }}
                  >
                    <Text style={styles.filterChipText}>{SORT_LABELS[sortMode]}</Text>
                    <Feather name="chevron-down" size={16} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                  {sortDropdownOpen && (
                    <View style={styles.dropdown}>
                      {(['time', 'table'] as const).map(s => (
                        <TouchableOpacity
                          key={s}
                          style={[styles.dropdownItem, sortMode === s && styles.dropdownItemActive]}
                          onPress={() => { setSortMode(s); setSortDropdownOpen(false); }}
                        >
                          <Text style={[styles.dropdownItemText, sortMode === s && styles.dropdownItemTextActive]}>{SORT_LABELS[s]}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Spacer */}
              <View style={{ flex: 1 }} />

              {/* Notification */}
              <TouchableOpacity style={[styles.iconBtn, { marginRight: GAP }]}>
                <NotificationIcon size={22} color={theme.colors.textPrimary} />
              </TouchableOpacity>

              {/* Search icon */}
              <TouchableOpacity style={styles.iconBtn} onPress={() => { setSearchActive(true); setStatusDropdownOpen(false); setSortDropdownOpen(false); }}>
                <SearchIcon size={22} color={theme.colors.textPrimary} />
              </TouchableOpacity>
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
                        <TouchableOpacity style={styles.actionFull} onPress={handleQuickCheck}>
                          <Feather name="plus" size={24} color="#fff" />
                          <Text style={[styles.actionLabel, { fontSize: 14 }]}>Новый{'\n'}заказ</Text>
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
  safeArea: { flex: 1, backgroundColor: '#1A1A1A' },
  root: { flex: 1, backgroundColor: '#1A1A1A' },

  headerRow: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: PADDING,
    zIndex: 1000,
    overflow: 'visible',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: theme.borderRadius,
    paddingHorizontal: 14,
    height: 44,
    gap: 6,
    minWidth: 140,
  },
  filterChipText: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: '600' },
  dropdownWrap: { position: 'relative', zIndex: 100 },
  dropdown: {
    position: 'absolute',
    top: 48,
    left: 0,
    minWidth: 200,
    backgroundColor: '#2a2a2a',
    borderRadius: theme.borderRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    zIndex: 200,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemActive: { backgroundColor: 'rgba(0,200,83,0.15)' },
  dropdownItemText: { color: theme.colors.textSecondary, fontSize: 14 },
  dropdownItemTextActive: { color: '#00C853', fontWeight: '600' },
  iconBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#333',
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: theme.borderRadius,
    paddingHorizontal: 12,
    gap: 8,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 15,
    paddingVertical: 0,
    outlineStyle: 'none',
  } as any,
  searchCloseBtn: { padding: 4 },

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
  actionFull: {
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
