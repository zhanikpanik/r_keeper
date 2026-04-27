import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/colors';
import { useOrderStore } from '../store/orderStore';
import { useShiftStore } from '../store/shiftStore';
import { supabase } from '../utils/supabase';
import { Order } from '../types';

const GAP = 8;
const COL_GAP = 8;
const PADDING = 8;

const formatAmount = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const METHOD_LABEL: Record<string, string> = {
  cash: 'Наличные',
  card: 'Карта',
  none: 'Без оплаты',
};

interface Payment {
  method: string;
  amount: number;
  change_amount: number;
  close_reason: string | null;
}

const formatTime = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
};

export const PaidCheckScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { currentOrderId, orders, closeOrder } = useOrderStore();
  const currentShift = useShiftStore((s) => s.currentShift);

  // All closed orders for current shift
  const closedOrders = orders
    .filter(o => (o.status === 'paid' || o.status === 'cancelled'))
    .sort((a, b) => (b.closedAt ?? b.openedAt) > (a.closedAt ?? a.openedAt) ? 1 : -1);

  const initialOrder = orders.find(o => o.id === currentOrderId) ?? closedOrders[0];
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(initialOrder ?? null);

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(true);

  useEffect(() => {
    if (!selectedOrder) return;
    setLoadingPayment(true);
    setPayment(null);
    supabase
      .from('payments')
      .select('method, amount, change_amount, close_reason')
      .eq('order_id', selectedOrder.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setPayment(data as Payment);
        setLoadingPayment(false);
      });
  }, [selectedOrder?.id]);

  const handleBack = () => {
    closeOrder();
    navigation?.navigate('Orders');
  };

  const handleRefund = async () => {
    if (!selectedOrder) return;
    useOrderStore.setState((state) => ({
      orders: state.orders.map(o =>
        o.id === selectedOrder.id ? { ...o, status: 'active' as const } : o
      ),
    }));
    await supabase.from('orders').update({ status: 'active', closed_at: null }).eq('id', selectedOrder.id);
    await supabase.from('payments').delete().eq('order_id', selectedOrder.id);
    navigation?.navigate('Pos');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar hidden />
      <View style={styles.root}>

        {/* ═══ HEADER ═══ */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Text style={styles.backText}>Назад</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Закрытые заказы</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* ═══ MAIN ═══ */}
        <View style={styles.mainRow}>

          {/* ── Left: Closed orders list ── */}
          <View style={styles.leftCol}>
            <View style={styles.listPanel}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {closedOrders.length === 0 && (
                  <Text style={styles.emptyText}>Нет закрытых заказов</Text>
                )}
                {closedOrders.map((o) => (
                  <TouchableOpacity
                    key={o.id}
                    style={[
                      styles.listRow,
                      selectedOrder?.id === o.id && styles.listRowSelected,
                      o.status === 'cancelled' && styles.listRowCancelled,
                    ]}
                    onPress={() => setSelectedOrder(o)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.listRowTop}>
                      <Text style={styles.listRowNum}>#{o.number}</Text>
                      <Text style={styles.listRowAmount}>{formatAmount(o.totalAmount)} ₽</Text>
                    </View>
                    <Text style={styles.listRowSub}>
                      {o.tableNumber ? `Стол ${o.tableNumber}` : 'Быстрый чек'}{' · '}{formatTime(o.closedAt ?? o.openedAt)}
                    </Text>
                    {o.items.length > 0 ? (
                      <View style={styles.listRowPreviewWrap}>
                        <Text style={styles.listRowPreview} numberOfLines={1}>
                          {o.items.map(i => i.product.name).filter((n, idx, arr) => arr.indexOf(n) === idx).join(', ')}
                        </Text>
                        <LinearGradient
                          colors={[selectedOrder?.id === o.id ? 'rgba(51,51,51,0)' : 'rgba(42,42,42,0)', selectedOrder?.id === o.id ? theme.colors.surfaceLight : theme.colors.surface]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.listRowFade}
                        />
                      </View>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={{ width: COL_GAP }} />

          {/* ── Right: Selected order detail ── */}
          <View style={styles.rightCol}>
            {!selectedOrder ? (
              <View style={styles.emptyDetail}>
                <Text style={styles.emptyText}>Выберите заказ</Text>
              </View>
            ) : (
              <View style={styles.detailPanel}>
                {/* Meta */}
                <View style={styles.metaBlock}>
                  <View style={[styles.badge, selectedOrder.status === 'cancelled' ? styles.badgeCancelled : styles.badgePaid]}>
                    <Text style={[styles.badgeText, selectedOrder.status === 'cancelled' ? styles.badgeCancelledText : styles.badgePaidText]}>
                      {selectedOrder.status === 'cancelled' ? 'Без оплаты' : 'Оплачен'}
                    </Text>
                  </View>
                  <Text style={styles.metaLabel}>Заказ #{selectedOrder.number}</Text>
                  <View style={styles.metaRow}>
                    {selectedOrder.openedAt ? <Text style={styles.metaValue}>{formatDateTime(selectedOrder.openedAt)}</Text> : null}
                    {selectedOrder.closedAt ? <Text style={styles.metaDot}>→</Text> : null}
                    {selectedOrder.closedAt ? <Text style={styles.metaValue}>{formatDateTime(selectedOrder.closedAt)}</Text> : null}
                  </View>
                  <View style={styles.metaRow}>
                    {selectedOrder.waiter ? <Text style={styles.metaValue}>{selectedOrder.waiter}</Text> : null}
                    {selectedOrder.zone ? <Text style={styles.metaDot}>·</Text> : null}
                    {selectedOrder.zone ? <Text style={styles.metaValue}>{selectedOrder.zone}</Text> : null}
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Items */}
                <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
                  {selectedOrder.items.length === 0 && (
                    <Text style={styles.emptyText}>Нет позиций</Text>
                  )}
                  {selectedOrder.items.map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                      <Text style={styles.itemQty}>{item.quantity}×</Text>
                      <Text style={styles.itemName} numberOfLines={1}>{item.product.name}</Text>
                      <Text style={styles.itemPrice}>{formatAmount(item.product.price * item.quantity)} ₽</Text>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.divider} />

                {/* Total */}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Итого</Text>
                  <Text style={styles.totalAmount}>{formatAmount(selectedOrder.totalAmount)} ₽</Text>
                </View>

                {/* Payment */}
                {loadingPayment ? (
                  <ActivityIndicator color="#00C853" style={{ marginTop: 8 }} />
                ) : payment ? (
                  <View style={styles.paymentBlock}>
                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>Оплата</Text>
                      <Text style={styles.paymentValue}>{METHOD_LABEL[payment.method] ?? payment.method}</Text>
                    </View>
                    {payment.method === 'cash' && (
                      <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Сдача</Text>
                        <Text style={styles.paymentValue}>{formatAmount(payment.change_amount)} ₽</Text>
                      </View>
                    )}
                    {payment.method === 'none' && payment.close_reason && (
                      <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Причина</Text>
                        <Text style={styles.paymentValue}>{payment.close_reason}</Text>
                      </View>
                    )}
                  </View>
                ) : null}

                <View style={styles.divider} />

                {/* Actions */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity style={[styles.actionBtn, { flex: 1 }]}>
                    <Feather name="printer" size={18} color={theme.colors.textPrimary} />
                    <Text style={styles.actionText}>Напечатать чек</Text>
                  </TouchableOpacity>

                  {selectedOrder.status !== 'cancelled' && (
                    <TouchableOpacity style={[styles.actionBtn, styles.refundBtn, { flex: 1 }]} onPress={handleRefund}>
                      <Feather name="rotate-ccw" size={18} color="#fff" />
                      <Text style={styles.refundText}>Возврат</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  root: { flex: 1, backgroundColor: '#1A1A1A' },

  // Header
  header: {
    height: 44,
    flexDirection: 'row',
    paddingHorizontal: PADDING,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerRight: { width: 80 },
  backBtn: {
    height: 44,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius,
  },
  backText: { color: theme.colors.textPrimary, fontSize: 17, fontWeight: '600' },
  headerTitle: { color: theme.colors.textPrimary, fontSize: 17, fontWeight: '700' },

  // Main layout
  mainRow: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: PADDING,
    paddingBottom: PADDING,
    minHeight: 0,
  },
  leftCol: { flex: 0.28, minHeight: 0 },
  rightCol: { flex: 0.72, minHeight: 0 },

  // Left: order list
  listPanel: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius,
    padding: 4,
  },
  listRow: {
    flexDirection: 'column',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius,
    marginBottom: 2,
    gap: 2,
  },
  listRowSelected: { backgroundColor: theme.colors.surfaceLight },
  listRowCancelled: { opacity: 0.6 },
  listRowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listRowNum: { color: theme.colors.textPrimary, fontSize: 17, fontWeight: '700' },
  listRowAmount: { color: theme.colors.textPrimary, fontSize: 17, fontWeight: '600' },
  listRowSub: { color: theme.colors.textSecondary, fontSize: 15 },
  listRowPreviewWrap: { overflow: 'hidden', position: 'relative' },
  listRowPreview: { color: theme.colors.textSecondary, fontSize: 15, opacity: 0.8 },
  listRowFade: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 40 },

  // Right: detail panel
  detailPanel: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius,
    padding: PADDING,
  },
  emptyDetail: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },

  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius,
    marginBottom: 6,
  },
  badgePaid: { backgroundColor: '#0A3D1F' },
  badgePaidText: { color: '#00C853' },
  badgeCancelled: { backgroundColor: '#3D0A0A' },
  badgeCancelledText: { color: '#FF8A80' },
  badgeText: { fontSize: 15, fontWeight: '700' },

  metaBlock: { gap: 3, marginBottom: 10 },
  metaLabel: { color: theme.colors.textPrimary, fontSize: 19, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  metaValue: { color: theme.colors.textSecondary, fontSize: 15 },
  metaDot: { color: theme.colors.textSecondary, fontSize: 15 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 10 },

  itemsList: { flex: 1 },
  emptyText: { color: theme.colors.textSecondary, fontSize: 17, padding: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, gap: 8 },
  itemQty: { color: theme.colors.textSecondary, fontSize: 17, width: 30 },
  itemName: { color: theme.colors.textPrimary, fontSize: 17, flexShrink: 1 },
  itemPrice: { color: theme.colors.textPrimary, fontSize: 17, fontWeight: '600' },

  totalRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  totalLabel: { color: theme.colors.textSecondary, fontSize: 17 },
  totalAmount: { color: theme.colors.textPrimary, fontSize: 19, fontWeight: '700' },

  paymentBlock: { gap: 5 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  paymentLabel: { color: theme.colors.textSecondary, fontSize: 17 },
  paymentValue: { color: theme.colors.textPrimary, fontSize: 17, fontWeight: '600' },

  actionsRow: {
    flexDirection: 'row',
    gap: GAP,
    marginTop: GAP,
  },
  actionBtn: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
    paddingHorizontal: 14,
  },
  actionText: { color: theme.colors.textPrimary, fontSize: 17, fontWeight: '600' },
  refundBtn: { backgroundColor: '#D32F2F' },
  refundText: { color: '#fff', fontSize: 17, fontWeight: '700' },

});
