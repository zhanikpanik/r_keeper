import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { theme } from '../theme/colors';
import { useOrderStore } from '../store/orderStore';
import { useShiftStore } from '../store/shiftStore';
import { supabase } from '../utils/supabase';

const VENUE_ID = '00000000-0000-0000-0000-000000000010';

const formatAmount = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

type PaymentMethod = 'cash' | 'card' | 'none';

const CLOSE_REASONS = [
  'За счёт заведения',
  'Ошибка официанта',
  'Ошибка кухни',
  'Гость ушёл',
  'Другое',
];

export const PaymentScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { currentOrderId, items, getTotal, orders } = useOrderStore();
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [cashInput, setCashInput] = useState('');
  const [printReceipt, setPrintReceipt] = useState(true);
  const [closeReason, setCloseReason] = useState<string | null>(null);

  const total = getTotal();
  const cashAmount = cashInput ? parseInt(cashInput, 10) : 0;
  const change = cashAmount > total ? cashAmount - total : 0;
  const canPay = method === 'card' || (method === 'none' && closeReason !== null) || (method === 'cash' && cashAmount >= total);

  const handleNumPress = (num: string) => {
    if (cashInput.length > 7) return;
    setCashInput(prev => prev + num);
  };

  const handleBackspace = () => {
    setCashInput(prev => prev.slice(0, -1));
  };

  const handleExact = () => {
    setCashInput(String(total));
  };

  const handlePay = async () => {
    if (!canPay || !currentOrderId) return;

    const shiftId = useShiftStore.getState().currentShift?.id ?? null;

    // Record payment in shift store
    if (method !== 'none') {
      useShiftStore.getState().recordPayment(method, total);
    }

    // Insert payment record into Supabase
    const { error: payError } = await supabase.from('payments').insert({
      order_id: currentOrderId,
      venue_id: VENUE_ID,
      shift_id: shiftId,
      method: method === 'none' ? 'none' : method,
      amount: total,
      change_amount: method === 'cash' ? Math.max(0, cashAmount - total) : 0,
      close_reason: method === 'none' ? (closeReason ?? '') : null,
    });
    if (payError) console.error('insert payment:', payError.message);

    // Update order status and sync to Supabase
    const newStatus = method === 'none' ? 'cancelled' as const : 'paid' as const;
    useOrderStore.setState((state) => ({
      orders: state.orders.map(o =>
        o.id === currentOrderId
          ? { ...o, status: newStatus, closedAt: new Date().toISOString(), closeReason: method === 'none' ? (closeReason ?? '') : undefined }
          : o
      ),
    }));

    // Close order (will sync the paid status + closed_at to Supabase)
    useOrderStore.getState().closeOrder();
    navigation?.navigate('Orders');
  };

  const handleCancel = () => {
    navigation?.goBack();
  };

  const renderKey = (label: string, onPress: () => void, flex = 1) => (
    <View style={[styles.keyWrap, { flex }]}>
      <TouchableOpacity style={styles.key} onPress={onPress} activeOpacity={0.6}>
        <Text style={styles.keyText}>{label}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar hidden />
      <View style={styles.root}>
        {/* ── Left Panel ── */}
        <View style={styles.leftPanel}>
          {/* Total */}
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Итого</Text>
            <Text style={styles.totalAmount}>{formatAmount(total)} ₽</Text>
          </View>

          {/* Payment method */}
          <View style={styles.methodSection}>
            <TouchableOpacity
              style={[styles.methodBtn, method === 'cash' && styles.methodActive]}
              onPress={() => { setMethod('cash'); setCashInput(''); setCloseReason(null); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.methodText, method === 'cash' && styles.methodTextActive]}>
                Наличные
              </Text>
            </TouchableOpacity>
            <View style={{ width: 8 }} />
            <TouchableOpacity
              style={[styles.methodBtn, method === 'card' && styles.methodActive]}
              onPress={() => { setMethod('card'); setCloseReason(null); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.methodText, method === 'card' && styles.methodTextActive]}>
                Карта
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.methodSection}>
            <TouchableOpacity
              style={[styles.methodBtn, method === 'none' && styles.methodActiveRed]}
              onPress={() => { setMethod('none'); setCashInput(''); setCloseReason(null); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.methodText, method === 'none' && styles.methodTextActive]}>
                Без оплаты
              </Text>
            </TouchableOpacity>
          </View>

          {/* Cash change info */}
          {method === 'cash' && cashAmount > 0 && cashAmount >= total && (
            <View style={styles.changeSection}>
              <Text style={styles.changeLabel}>Сдача</Text>
              <Text style={styles.changeAmount}>{formatAmount(change)} ₽</Text>
            </View>
          )}

          {/* Print receipt toggle */}
          <TouchableOpacity
            style={styles.receiptToggle}
            onPress={() => setPrintReceipt(!printReceipt)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, printReceipt && styles.checkboxChecked]}>
              {printReceipt && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.receiptText}>Напечатать чек</Text>
          </TouchableOpacity>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.7}>
              <Text style={styles.cancelText}>Отмена</Text>
            </TouchableOpacity>
            <View style={{ width: 8 }} />
            {method === 'none' ? (
              <TouchableOpacity
                style={[styles.payBtnRed, !canPay && styles.payBtnDisabled]}
                onPress={handlePay}
                disabled={!canPay}
                activeOpacity={0.7}
              >
                <Text style={styles.payText}>Закрыть без оплаты</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.payBtn, !canPay && styles.payBtnDisabled]}
                onPress={handlePay}
                disabled={!canPay}
                activeOpacity={0.7}
              >
                <Text style={styles.payText}>Оплатить</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Right Panel: Numpad ── */}
        <View style={styles.rightPanel}>
          {method === 'cash' ? (
            <>
              {/* Display */}
              <View style={styles.numpadDisplay}>
                <Text style={styles.displayValue}>
                  {cashInput ? formatAmount(parseInt(cashInput, 10)) : '0'}
                </Text>
                <Text style={styles.displayCurrency}>₽</Text>
              </View>

              {/* Quick exact button */}
              <View style={styles.quickRow}>
                <TouchableOpacity style={styles.exactBtn} onPress={handleExact} activeOpacity={0.6}>
                  <Text style={styles.exactText}>Без сдачи — {formatAmount(total)} ₽</Text>
                </TouchableOpacity>
              </View>

              {/* Numpad */}
              <View style={styles.numpad}>
                <View style={styles.numRow}>
                  {renderKey('7', () => handleNumPress('7'))}
                  {renderKey('8', () => handleNumPress('8'))}
                  {renderKey('9', () => handleNumPress('9'))}
                </View>
                <View style={styles.numRow}>
                  {renderKey('4', () => handleNumPress('4'))}
                  {renderKey('5', () => handleNumPress('5'))}
                  {renderKey('6', () => handleNumPress('6'))}
                </View>
                <View style={styles.numRow}>
                  {renderKey('1', () => handleNumPress('1'))}
                  {renderKey('2', () => handleNumPress('2'))}
                  {renderKey('3', () => handleNumPress('3'))}
                </View>
                <View style={styles.numRow}>
                  {renderKey('0', () => handleNumPress('0'))}
                  {renderKey('00', () => handleNumPress('00'))}
                  <View style={styles.keyWrap}>
                    <TouchableOpacity style={styles.key} onPress={handleBackspace} activeOpacity={0.6}>
                      <Text style={styles.keyText}>←</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </>
          ) : method === 'card' ? (
            <View style={styles.cardMode}>
              <Text style={styles.cardIcon}>💳</Text>
              <Text style={styles.cardTitle}>Оплата картой</Text>
              <Text style={styles.cardAmount}>{formatAmount(total)} ₽</Text>
              <Text style={styles.cardHint}>Приложите карту к терминалу</Text>
            </View>
          ) : (
            <View style={styles.reasonPanel}>
              <Text style={styles.reasonTitle}>Укажите причину</Text>
              {CLOSE_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[styles.reasonBtn, closeReason === reason && styles.reasonBtnActive]}
                  onPress={() => setCloseReason(reason)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.reasonText, closeReason === reason && styles.reasonTextActive]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const GAP = 2;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  root: { flex: 1, flexDirection: 'row', padding: 16 },

  // Left panel
  leftPanel: {
    flex: 0.4,
    marginRight: 16,
  },
  totalSection: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
    padding: 24,
    marginBottom: 16,
  },
  totalLabel: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    marginBottom: 8,
  },
  totalAmount: {
    color: theme.colors.textPrimary,
    fontSize: 48,
    fontWeight: 'bold',
  },

  methodSection: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  methodBtn: {
    flex: 1,
    height: 56,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodActive: {
    backgroundColor: theme.colors.actionMenuPurple,
  },
  methodActiveRed: {
    backgroundColor: '#D32F2F',
  },
  methodText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  methodTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },

  changeSection: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changeLabel: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  changeAmount: {
    color: '#00C853',
    fontSize: 28,
    fontWeight: 'bold',
  },

  receiptToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
    padding: 16,
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.actionMenuPurple,
    borderColor: theme.colors.actionMenuPurple,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  receiptText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
  },

  actionRow: {
    flexDirection: 'row',
    height: 56,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#D32F2F',
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  payBtn: {
    flex: 1.5,
    backgroundColor: '#00C853',
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payBtnRed: {
    flex: 1.5,
    backgroundColor: '#D32F2F',
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payBtnDisabled: {
    opacity: 0.4,
  },
  payText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Right panel
  rightPanel: {
    flex: 0.6,
  },

  numpadDisplay: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'baseline',
    backgroundColor: '#191919',
    borderRadius: theme.borderRadius,
    padding: 24,
    marginBottom: 8,
  },
  displayValue: {
    color: theme.colors.textPrimary,
    fontSize: 48,
    fontWeight: '300',
  },
  displayCurrency: {
    color: theme.colors.textSecondary,
    fontSize: 24,
    fontWeight: '300',
    marginLeft: 8,
  },

  quickRow: {
    marginBottom: 8,
  },
  exactBtn: {
    height: 48,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exactText: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },

  numpad: {
    flex: 1,
  },
  numRow: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: GAP,
  },
  keyWrap: {
    flex: 1,
    marginHorizontal: GAP / 2,
  },
  key: {
    flex: 1,
    backgroundColor: '#191919',
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    color: theme.colors.textPrimary,
    fontSize: 28,
    fontWeight: '300',
  },

  // Card mode
  cardMode: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#191919',
    borderRadius: theme.borderRadius,
  },
  cardIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardAmount: {
    color: theme.colors.textPrimary,
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  cardHint: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  confirmWarning: {
    color: '#FF5252',
    fontSize: 18,
    fontWeight: '600',
  },
  reasonPanel: {
    flex: 1,
    padding: 16,
  },
  reasonTitle: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  reasonBtn: {
    height: 56,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  reasonBtnActive: {
    backgroundColor: '#D32F2F',
  },
  reasonText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  reasonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
