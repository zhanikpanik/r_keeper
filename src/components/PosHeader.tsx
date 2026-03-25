import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme/colors';

interface Props {
  onBack: () => void;
}

export const PosHeader: React.FC<Props> = ({ onBack }) => {
  return (
    <View style={styles.container}>
      {/* Left Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backText}>Назад</Text>
      </TouchableOpacity>

      {/* Middle Context */}
      <View style={styles.middleContext}>
        <View style={styles.contextTopRow}>
          <Text style={styles.contextTitle}>Редактировать заказ</Text>
          <Text style={styles.contextTime}>12:40</Text>
        </View>
        <Text style={styles.contextDetails}>
          Стол: 4   Гостей: 3   Основной   Общий   Константинопольский
        </Text>
      </View>

      {/* Right Actions */}
      <View style={styles.rightActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>По гостям</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconButton}>
          <MaterialCommunityIcons name="bell" size={20} color={theme.colors.textPrimary} />
          <Text style={styles.badgeText}>2</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="search" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
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
    marginHorizontal: 16,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius,
    paddingHorizontal: 16,
    paddingVertical: 8,
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
});
