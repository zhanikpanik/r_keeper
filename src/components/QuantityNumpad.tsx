import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/colors';
import { useOrderStore } from '../store/orderStore';

export const QuantityNumpad: React.FC = () => {
  const { selectedItemId, items, updateQuantity } = useOrderStore();
  const selectedItem = items.find(item => item.id === selectedItemId);
  
  const [inputValue, setInputValue] = useState('');

  // Reset input when item selection changes
  useEffect(() => {
    setInputValue('');
  }, [selectedItemId]);

  if (!selectedItem) return null;

  const handlePress = (num: string) => {
    const newValue = inputValue + num;
    // Don't allow more than 3 digits for sanity
    if (newValue.length > 3) return;
    setInputValue(newValue);
    const newQty = parseInt(newValue, 10);
    const delta = newQty - selectedItem.quantity;
    updateQuantity(selectedItem.id, delta);
  };

  const handleClear = () => {
    setInputValue('');
    // Reset to 1
    const delta = 1 - selectedItem.quantity;
    updateQuantity(selectedItem.id, delta);
  };

  const handleBackspace = () => {
    const newValue = inputValue.slice(0, -1);
    setInputValue(newValue);
    if (newValue) {
      const newQty = parseInt(newValue, 10);
      const delta = newQty - selectedItem.quantity;
      updateQuantity(selectedItem.id, delta);
    } else {
      const delta = 1 - selectedItem.quantity;
      updateQuantity(selectedItem.id, delta);
    }
  };

  const renderKey = (val: string, flex = 1) => (
    <View style={[styles.keyWrapper, { flex }]}>
      <TouchableOpacity style={styles.key} onPress={() => handlePress(val)}>
        <Text style={styles.keyText}>{val}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.display}>
        <Text style={styles.labelText}>Количество для {selectedItem.product.name}:</Text>
        <Text style={styles.valueText}>{inputValue || selectedItem.quantity}</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.row}>
          {renderKey('1')}
          {renderKey('2')}
          {renderKey('3')}
        </View>
        <View style={styles.row}>
          {renderKey('4')}
          {renderKey('5')}
          {renderKey('6')}
        </View>
        <View style={styles.row}>
          {renderKey('7')}
          {renderKey('8')}
          {renderKey('9')}
        </View>
        <View style={styles.row}>
          <View style={styles.keyWrapper}>
            <TouchableOpacity style={[styles.key, styles.clearKey]} onPress={handleClear}>
              <Text style={styles.keyText}>C</Text>
            </TouchableOpacity>
          </View>
          {renderKey('0')}
          <View style={styles.keyWrapper}>
            <TouchableOpacity style={styles.key} onPress={handleBackspace}>
              <Feather name="delete" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  display: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: theme.borderRadius,
    marginBottom: 8,
    alignItems: 'center',
  },
  labelText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  valueText: {
    color: theme.colors.textPrimary,
    fontSize: 32,
    fontWeight: 'bold',
  },
  grid: {
    flex: 1,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  keyWrapper: {
    padding: 2,
  },
  key: {
    flex: 1,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearKey: {
    backgroundColor: theme.colors.orderAlert,
  },
  keyText: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
  },
});
