import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/colors';

const DRAWER_WIDTH = 320;

interface MenuItem {
  id: string;
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onOpenReport: () => void;
  onOpenShiftInfo: () => void;
  onCloseShift: () => void;
}

export const FunctionsModal: React.FC<Props> = ({ visible, onClose, onOpenReport, onOpenShiftInfo, onCloseShift }) => {
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const isVisible = useRef(false);

  useEffect(() => {
    if (visible) {
      isVisible.current = true;
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (isVisible.current) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const items: MenuItem[] = [
    {
      id: 'report',
      label: 'Отчет за смену',
      onPress: () => {
        onClose();
        setTimeout(() => onOpenReport(), 300);
      },
    },
    {
      id: 'shift',
      label: 'Текущая смена',
      onPress: () => {
        onClose();
        setTimeout(() => onOpenShiftInfo(), 300);
      },
    },
    {
      id: 'closeShift',
      label: 'Закрыть смену',
      onPress: () => {
        onClose();
        setTimeout(() => onCloseShift(), 300);
      },
    },
    {
      id: 'devices',
      label: 'Принтеры и устройства',
      disabled: true,
    },
    {
      id: 'cashDrawer',
      label: 'Денежный ящик',
      disabled: true,
    },
    {
      id: 'clearCache',
      label: 'Обновить данные',
      disabled: true,
    },
    {
      id: 'logout',
      label: 'Выход',
      disabled: true,
    },
  ];

  const [shouldRender, setShouldRender] = React.useState(false);

  useEffect(() => {
    if (visible) setShouldRender(true);
  }, [visible]);

  useEffect(() => {
    if (!visible && !shouldRender) return;
    if (!visible) {
      const timer = setTimeout(() => setShouldRender(false), 250);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!shouldRender) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      {/* Overlay */}
      <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
      </Animated.View>

      {/* Drawer */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Функции</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={22} color="#aaa" />
          </TouchableOpacity>
        </View>

        {/* Sections */}
        <View style={styles.body}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, item.disabled && styles.menuItemDisabled]}
              onPress={item.onPress}
              disabled={item.disabled}
              activeOpacity={0.7}
            >
              <Text style={[styles.menuLabel, item.disabled && styles.menuLabelDisabled]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: theme.colors.surface,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.08)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
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
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 14,
    marginBottom: 2,
  },
  menuItemDisabled: {
    opacity: 0.35,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  menuLabelDisabled: {
    color: theme.colors.textSecondary,
  },
});
