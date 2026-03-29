import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/colors';
import { useShiftStore } from '../store/shiftStore';

const formatAmount = (n: number): string =>
  n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';

const formatTime = (date: Date): string =>
  `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

const formatDate = (date: Date): string => {
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const formatDuration = (start: Date, end: Date): string => {
  const diff = end.getTime() - start.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours === 0) return `${minutes} мин`;
  return `${hours} ч ${minutes} мин`;
};

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirmClose: () => void;
}

export const CloseShiftModal: React.FC<Props> = ({ visible, onClose, onConfirmClose }) => {
  const currentShift = useShiftStore((s) => s.currentShift);

  if (!currentShift) return null;

  const now = new Date();
  const expectedCash = currentShift.startingCash + currentShift.cashTotal;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Закрытие смены</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Z-Report title */}
            <Text style={styles.reportTitle}>Z-отчет</Text>
            <Text style={styles.reportDate}>{formatDate(now)}</Text>

            {/* Shift info */}
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Кассир</Text>
              <Text style={styles.infoValue}>{currentShift.cashier}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Смена открыта</Text>
              <Text style={styles.infoValue}>{formatTime(currentShift.openedAt)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Длительность</Text>
              <Text style={styles.infoValue}>{formatDuration(currentShift.openedAt, now)}</Text>
            </View>

            {/* Sales summary */}
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.statLabel}>Количество заказов</Text>
              <Text style={styles.statValue}>{currentShift.totalOrders}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.statLabel}>Выручка</Text>
              <Text style={styles.statValue}>{formatAmount(currentShift.totalRevenue)}</Text>
            </View>

            {/* Payment breakdown */}
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>По способам оплаты</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Наличные</Text>
              <Text style={styles.infoValue}>
                {currentShift.cashPayments} заказов · {formatAmount(currentShift.cashTotal)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Карта</Text>
              <Text style={styles.infoValue}>
                {currentShift.cardPayments} заказов · {formatAmount(currentShift.cardTotal)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Другое</Text>
              <Text style={styles.infoValue}>
                {currentShift.otherPayments} заказов · {formatAmount(currentShift.otherTotal)}
              </Text>
            </View>

            {/* Cash in drawer */}
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Касса</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Наличные на начало</Text>
              <Text style={styles.infoValue}>{formatAmount(currentShift.startingCash)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Поступления наличными</Text>
              <Text style={styles.infoValue}>{formatAmount(currentShift.cashTotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Ожидаемая сумма в кассе</Text>
              <Text style={styles.totalValue}>{formatAmount(expectedCash)}</Text>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirmClose} activeOpacity={0.8}>
              <Text style={styles.confirmText}>Закрыть смену</Text>
            </TouchableOpacity>
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
    width: '40%',
    maxWidth: 480,
    minWidth: 360,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    paddingHorizontal: 20,
  },
  reportTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 2,
    height: 48,
    backgroundColor: '#D32F2F',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
