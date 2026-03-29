import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme/colors';

interface Props {
  onBack: () => void;
  searchMode: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchOpen: () => void;
  onSearchClose: () => void;
  tableNumber: string;
  guestCount: number;
  isQuickCheck?: boolean;
  editMode?: boolean;
  onToggleEditMode?: () => void;
}

export const PosHeader: React.FC<Props> = ({
  onBack, searchMode, searchQuery, onSearchChange, onSearchOpen, onSearchClose,
  tableNumber, guestCount, isQuickCheck, editMode, onToggleEditMode,
}) => {
  if (searchMode) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={onSearchClose}>
          <Text style={styles.backText}>Назад</Text>
        </TouchableOpacity>

        <View style={styles.searchContext}>
          <Text style={styles.contextTitle}>Редактировать заказ</Text>
        </View>

        <View style={styles.searchInputWrap}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder=""
            placeholderTextColor={theme.colors.textSecondary}
            autoFocus
          />
        </View>

        <TouchableOpacity style={styles.clearBtn} onPress={() => onSearchChange('')}>
          <Text style={styles.clearText}>Очистить</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={onSearchClose}>
          <Feather name="x" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backText}>Назад</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.middleContext, editMode && styles.middleContextActive]} onPress={onToggleEditMode} activeOpacity={0.7}>
        <View style={styles.contextTopRow}>
          <Text style={[styles.contextTitle, editMode && styles.contextTitleActive]}>{editMode ? 'Настройки заказа' : 'Редактировать заказ'}</Text>
          <Text style={styles.contextTime}>
            {new Date().getHours().toString().padStart(2, '0')}:{new Date().getMinutes().toString().padStart(2, '0')}
          </Text>
        </View>
        <Text style={styles.contextDetails}>
          {isQuickCheck
            ? `Быстрый чек   Гостей: ${guestCount}`
            : `Стол: ${tableNumber || '—'}   Гостей: ${guestCount}   Основной   Общий`
          }
        </Text>
      </TouchableOpacity>

      <View style={styles.rightActions}>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialCommunityIcons name="bell" size={20} color={theme.colors.textPrimary} />
          <Text style={styles.badgeText}>2</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={onSearchOpen}>
          <Feather name="search" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 52,
    flexDirection: 'row',
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  backButton: {
    height: 44,
    paddingHorizontal: 24,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius,
  },
  backText: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
  },
  middleContext: {
    flex: 1,
    height: 44,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  contextTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contextTitle: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  middleContextActive: {
    backgroundColor: theme.colors.actionMenuPurple,
  },
  contextTitleActive: {
    color: '#fff',
  },
  contextTime: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  contextDetails: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    height: 44,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  iconButton: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    position: 'absolute',
    top: 10,
    right: 8,
    color: theme.colors.textPrimary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Search mode
  searchContext: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputWrap: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#00C853',
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  searchInput: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    height: '100%',

  },
  clearBtn: {
    height: 44,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
});
