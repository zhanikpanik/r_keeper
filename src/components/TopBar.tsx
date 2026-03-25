import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { theme } from '../theme/colors';

export const TopBar: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.leftGroup}>
        <TouchableOpacity style={styles.navButton}>
          <Feather name="chevron-left" size={24} color={theme.colors.tabActive} />
        </TouchableOpacity>
        
        <View style={styles.waiterContainer}>
          <Text style={styles.waiterText}>Все официанты</Text>
        </View>
        
        <TouchableOpacity style={styles.navButton}>
          <Feather name="chevron-right" size={24} color={theme.colors.tabActive} />
        </TouchableOpacity>
      </View>

      <View style={styles.rightGroup}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>По официантам</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.notificationButton}>
          <MaterialCommunityIcons name="bell" size={20} color="#FF9800" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>2</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="search" size={20} color={theme.colors.tabActive} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 50,
    flexDirection: 'row',
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8EAF6', // Light lavender
    borderRadius: theme.borderRadius,
    height: '100%',
    overflow: 'hidden',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    gap: 8,
  },
  navButton: {
    width: 44,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waiterContainer: {
    height: '100%',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  waiterText: {
    color: theme.colors.tabActive,
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButton: {
    height: '100%',
    backgroundColor: '#E8EAF6',
    borderRadius: theme.borderRadius,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: theme.colors.tabActive,
    fontSize: 14,
    fontWeight: 'bold',
  },
  notificationButton: {
    width: 50,
    height: '100%',
    backgroundColor: '#FFF3E0', // Light orange
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'transparent',
  },
  badgeText: {
    color: '#FF9800',
    fontSize: 10,
    fontWeight: 'bold',
    position: 'absolute',
    left: 12,
    top: -2,
  },
  iconButton: {
    width: 50,
    height: '100%',
    backgroundColor: '#E8EAF6',
    borderRadius: theme.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
