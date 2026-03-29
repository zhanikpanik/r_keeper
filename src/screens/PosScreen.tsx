import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { theme } from '../theme/colors';
import { PosHeader } from '../components/PosHeader';
import { OrderPanel } from '../components/OrderPanel';
import { CategoryMenu } from '../components/CategoryMenu';
import { ProductGrid } from '../components/ProductGrid';
import { ItemActionsMenu } from '../components/ItemActionsMenu';
import { ModifierGrid } from '../components/ModifierGrid';
import { SearchMode } from '../components/SearchMode';
import { useOrderStore } from '../store/orderStore';
import { OrderSettingsMenu, OrderSetting } from '../components/OrderSettingsMenu';
import { OrderSettingsDetail } from '../components/OrderSettingsDetail';

const GAP = 4;
const COL_GAP = 8;
const PADDING = 8;

export const PosScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { selectedItemId, items, getTotal, closeOrder, selectItem, tableNumber, guests, isQuickCheck } = useOrderStore();
  const selectedItem = items.find(i => i.id === selectedItemId);
  const isItemSelected = !!selectedItem;
  const total = getTotal();
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [activeSetting, setActiveSetting] = useState<OrderSetting>(null);

  const handleBack = () => {
    closeOrder();
    navigation?.navigate('Orders');
  };

  const toggleEditMode = () => {
    if (editMode) {
      setEditMode(false);
      setActiveSetting(null);
    } else {
      setEditMode(true);
      selectItem(null); // deselect any item
    }
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
          editMode={editMode}
          onToggleEditMode={toggleEditMode}
        />

        {/* ═══ MAIN CONTENT ═══ */}
        <View style={styles.mainRow}>
          {/* ── Left: Order Panel (always visible) ── */}
          <View style={styles.leftCol}>
            <OrderPanel />
          </View>

          <View style={{ width: COL_GAP }} />

          {searchMode ? (
            <View style={styles.searchRightCol}>
              <SearchMode
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </View>
          ) : editMode ? (
            <>
              {/* ── Middle: Order settings menu ── */}
              <View style={styles.midCol}>
                <OrderSettingsMenu
                  activeSetting={activeSetting}
                  onSelectSetting={setActiveSetting}
                />
              </View>

              <View style={{ width: COL_GAP }} />

              {/* ── Right: Setting detail ── */}
              <View style={styles.rightCol}>
                <OrderSettingsDetail setting={activeSetting} />
              </View>
            </>
          ) : (
            <>
              {/* ── Middle: Categories or Actions ── */}
              <View style={styles.midCol}>
                {isItemSelected ? <ItemActionsMenu /> : <CategoryMenu />}
              </View>

              <View style={{ width: COL_GAP }} />

              {/* ── Right: Products or Modifiers ── */}
              <View style={styles.rightCol}>
                {isItemSelected ? <ModifierGrid /> : <ProductGrid />}
              </View>
            </>
          )}
        </View>

        {/* ═══ FOOTER ═══ */}
        <View style={[styles.footerRow, { paddingHorizontal: PADDING }]}>
          {/* ── Left: Оплата + Пречек (matches order panel) ── */}
          <View style={styles.footerLeft}>
            <TouchableOpacity style={styles.precheckBtn}>
              <Text style={styles.precheckText}>Пречек</Text>
            </TouchableOpacity>
            <View style={{ width: GAP }} />
            <TouchableOpacity style={styles.paymentBtn} onPress={() => navigation?.navigate('Payment')}>
              <Text style={styles.paymentLabel}>Оплата</Text>
              <Text style={styles.paymentAmount}>{formatAmount(total)} ₽</Text>
            </TouchableOpacity>
          </View>

          <View style={{ width: GAP }} />

          {isItemSelected ? (
            <>
              {/* ── Middle + Right: Отмена + Готово (item editing) ── */}
              <View style={styles.footerMid}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => selectItem(null)}>
                  <Text style={styles.cancelText}>Отмена</Text>
                </TouchableOpacity>
              </View>
              <View style={{ width: GAP }} />
              <View style={styles.footerRight}>
                <TouchableOpacity style={styles.doneBtn} onPress={() => selectItem(null)}>
                  <Text style={styles.doneText}>Готово</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* ── Middle: Скидки + Ввести код (matches categories) ── */}
              <View style={styles.footerMid}>
                <TouchableOpacity style={styles.secondaryBtn}>
                  <Text style={styles.secondaryText}>Скидки{'\n'}и наценки</Text>
                </TouchableOpacity>
                <View style={{ width: GAP }} />
                <TouchableOpacity style={styles.secondaryBtn}>
                  <Text style={styles.secondaryText}>Ввести код</Text>
                </TouchableOpacity>
              </View>
              <View style={{ width: GAP }} />
              {/* ── Right: Готово (matches products) ── */}
              <View style={styles.footerRight}>
                <TouchableOpacity style={styles.doneBtn} onPress={handleBack}>
                  <Text style={styles.doneText}>Готово</Text>
                </TouchableOpacity>
              </View>
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
  root: { flex: 1, backgroundColor: '#000000' },

  mainRow: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: PADDING,
    paddingTop: GAP,
    paddingBottom: COL_GAP,
  },
  leftCol: {
    flex: 0.35,
    overflow: 'hidden',
    borderRadius: theme.borderRadius,
  },
  midCol: {
    flex: 0.25,
    overflow: 'hidden',
    borderRadius: theme.borderRadius,
  },
  rightCol: {
    flex: 0.40,
    overflow: 'hidden',
    borderRadius: theme.borderRadius,
  },
  searchRightCol: {
    flex: 0.65,
  },

  footerRow: {
    height: 56,
    flexDirection: 'row',
    paddingVertical: GAP,
  },
  footerLeft: {
    flex: 0.35,
    flexDirection: 'row',
  },
  footerMid: {
    flex: 0.25,
    flexDirection: 'row',
  },
  footerRight: {
    flex: 0.40,
  },
  paymentBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#00C853',
    borderRadius: theme.borderRadius,
    paddingHorizontal: 12,
  },
  paymentLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  paymentAmount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  precheckBtn: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
  },
  precheckText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryBtn: {
    flex: 1,
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
    flex: 1,
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

});
