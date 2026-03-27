import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Alert } from 'react-native';
import { theme } from '../theme/colors';
import { PosHeader } from '../components/PosHeader';
import { OrderPanel } from '../components/OrderPanel';
import { CategoryMenu } from '../components/CategoryMenu';
import { ProductGrid } from '../components/ProductGrid';
import { ItemActionsMenu } from '../components/ItemActionsMenu';
import { ModifierGrid } from '../components/ModifierGrid';
import { SearchMode } from '../components/SearchMode';
import { useOrderStore } from '../store/orderStore';

const GAP = 4;
const PADDING = 8;

export const PosScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { selectedItemId, items, getTotal, saveCurrentOrder, selectItem, tableNumber, guests, isQuickCheck } = useOrderStore();
  const selectedItem = items.find(i => i.id === selectedItemId);
  const isItemSelected = !!selectedItem;
  const total = getTotal();
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleBack = () => {
    if (items.length > 0) {
      Alert.alert(
        'Несохранённые изменения',
        'Сохранить заказ перед выходом?',
        [
          { text: 'Не сохранять', style: 'destructive', onPress: () => navigation?.navigate('Orders') },
          { text: 'Отмена', style: 'cancel' },
          { text: 'Сохранить', onPress: () => { saveCurrentOrder(); navigation?.navigate('Orders'); } },
        ]
      );
    } else {
      navigation?.navigate('Orders');
    }
  };

  const handleSave = () => {
    if (items.length === 0) {
      Alert.alert('Пустой заказ', 'Добавьте хотя бы одно блюдо', [{ text: 'OK' }]);
      return;
    }
    saveCurrentOrder();
    navigation?.navigate('Orders');
  };

  const handleSearchOpen = () => {
    setSearchMode(true);
    setSearchQuery('');
  };

  const handleSearchClose = () => {
    setSearchMode(false);
    setSearchQuery('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar hidden />
      <View style={styles.root}>
        {/* ═══ HEADER ═══ */}
        <PosHeader
          onBack={handleBack}
          searchMode={searchMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchOpen={handleSearchOpen}
          onSearchClose={handleSearchClose}
          tableNumber={tableNumber}
          guestCount={guests.length}
          isQuickCheck={isQuickCheck}
        />

        {/* ═══ MAIN CONTENT ═══ */}
        <View style={styles.mainRow}>
          {/* ── Left: Order Panel (always visible) ── */}
          <View style={styles.leftCol}>
            <OrderPanel />
          </View>

          <View style={{ width: GAP }} />

          {searchMode ? (
            /* Search mode: products + keyboard fill the right area */
            <View style={styles.searchRightCol}>
              <SearchMode
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </View>
          ) : (
            <>
              {/* ── Middle: Categories or Actions ── */}
              <View style={styles.midCol}>
                {isItemSelected ? <ItemActionsMenu /> : <CategoryMenu />}
              </View>

              <View style={{ width: GAP }} />

              {/* ── Right: Products or Modifiers ── */}
              <View style={styles.rightCol}>
                {isItemSelected ? <ModifierGrid /> : <ProductGrid />}
              </View>
            </>
          )}
        </View>

        {/* ═══ FOOTER ═══ */}
        <View style={[styles.footerRow, { paddingHorizontal: PADDING }]}>
          <TouchableOpacity style={styles.paymentBtn}>
            <Text style={styles.paymentLabel}>Оплата</Text>
            <Text style={styles.paymentAmount}>{formatAmount(total)} ₽</Text>
          </TouchableOpacity>

          <View style={{ width: GAP }} />

          {isItemSelected ? (
            <>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => selectItem(null)}>
                <Text style={styles.cancelText}>Отмена</Text>
              </TouchableOpacity>
              <View style={{ width: GAP }} />
              <TouchableOpacity style={styles.doneBtn} onPress={() => selectItem(null)}>
                <Text style={styles.doneText}>Готово</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.secondaryBtn}>
                <Text style={styles.secondaryText}>Скидки{'\n'}и наценки</Text>
              </TouchableOpacity>
              <View style={{ width: GAP }} />
              <TouchableOpacity style={styles.secondaryBtn}>
                <Text style={styles.secondaryText}>Ввести код</Text>
              </TouchableOpacity>
              <View style={{ width: GAP }} />
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>Сохранить заказ</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const formatAmount = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  root: { flex: 1 },

  mainRow: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: PADDING,
    paddingTop: GAP,
  },
  leftCol: {
    flex: 0.35,
    borderRadius: theme.borderRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  midCol: {
    flex: 0.25,
    borderRadius: theme.borderRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  rightCol: {
    flex: 0.40,
    borderRadius: theme.borderRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  searchRightCol: {
    flex: 0.65,
  },

  footerRow: {
    height: 56,
    flexDirection: 'row',
    paddingVertical: GAP,
  },
  paymentBtn: {
    flex: 0.35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#00C853',
    borderRadius: theme.borderRadius,
    paddingHorizontal: 16,
  },
  paymentLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentAmount: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D32F2F',
    borderRadius: theme.borderRadius,
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  doneBtn: {
    flex: 1.6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00C853',
    borderRadius: theme.borderRadius,
  },
  doneText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryBtn: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
  },
  secondaryText: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  saveBtn: {
    flex: 1.6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: theme.borderRadius,
    borderWidth: 1,
    borderColor: '#00C853',
  },
  saveText: {
    color: '#00C853',
    fontSize: 15,
    fontWeight: '600',
  },
});
