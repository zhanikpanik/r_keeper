import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/colors';
import { SearchIcon, NotificationIcon } from './Icons';

interface Props {
  onBack: () => void;
  searchMode: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchOpen: () => void;
  onSearchClose: () => void;
  tableNumber: string;
  waiter: string;
  guestCount: number;
  isQuickCheck?: boolean;
  onTablePress?: () => void;
  onWaiterPress?: () => void;
  onCommentPress?: () => void;
}

export const PosHeader: React.FC<Props> = ({
  onBack, searchMode, searchQuery, onSearchChange, onSearchOpen, onSearchClose,
  tableNumber, waiter, guestCount, isQuickCheck,
  onTablePress, onWaiterPress, onCommentPress,
}) => {
  const time = `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`;

  if (searchMode) {
    return (
      <View style={styles.container}>
        <View style={styles.leftSection}>
          <TouchableOpacity style={styles.backButton} onPress={onSearchClose}>
            <Text style={styles.backText}>Назад</Text>
          </TouchableOpacity>

          {!isQuickCheck && (
            <>
              <TouchableOpacity style={[styles.chip, { marginLeft: 6 }]} onPress={onTablePress} activeOpacity={0.7}>
                <Text style={styles.chipLabel}>Стол</Text>
                <Text style={styles.chipValue}>{tableNumber || '—'}</Text>
                <Feather name="chevron-down" size={14} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.chip, { marginLeft: 6 }]} onPress={onWaiterPress} activeOpacity={0.7}>
                <Text style={styles.chipLabel}>Официант</Text>
                <Text style={styles.chipValue}>{waiter}</Text>
                <Feather name="chevron-down" size={14} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.searchRightSection}>
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>Назад</Text>
        </TouchableOpacity>

        {isQuickCheck ? (
          <View style={[styles.chipStatic, { marginLeft: 6 }]}>
            <Text style={styles.chipText}>Быстрый чек</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity style={[styles.chip, { marginLeft: 6 }]} onPress={onTablePress} activeOpacity={0.7}>
              <Text style={styles.chipLabel}>Стол</Text>
              <Text style={styles.chipValue}>{tableNumber || '—'}</Text>
              <Feather name="chevron-down" size={14} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.chip, { marginLeft: 6 }]} onPress={onWaiterPress} activeOpacity={0.7}>
              <Text style={styles.chipLabel}>Официант</Text>
              <Text style={styles.chipValue}>{waiter}</Text>
              <Feather name="chevron-down" size={14} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Right actions */}
      <View style={styles.rightActions}>
        <TouchableOpacity style={styles.iconButton} onPress={onCommentPress}>
          <Feather name="message-square" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <NotificationIcon size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={onSearchOpen}>
          <SearchIcon size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.timeText}>{time}</Text>
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

  // Left section — matches order panel width
  leftSection: {
    flex: 0.35,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
    paddingHorizontal: 12,
    gap: 6,
  },
  chipLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  chipValue: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  chipStatic: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
    paddingHorizontal: 12,
  },
  chipText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextSub: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },

  // Right actions
  rightActions: {
    flex: 0.65,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginLeft: 4,
  },

  // Search mode
  searchRightSection: {
    flex: 0.65,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
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
    outlineStyle: 'none',
  } as any,
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
