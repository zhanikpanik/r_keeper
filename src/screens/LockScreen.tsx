import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { theme } from '../theme/colors';
import { LockIcon } from '../components/Icons';

const CORRECT_PIN = '1234';
const PIN_LENGTH = 4;

interface Props {
  navigation: any;
}

export const LockScreen: React.FC<Props> = ({ navigation }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = useCallback((digit: string) => {
    setError(false);
    const newPin = pin + digit;

    if (newPin.length === PIN_LENGTH) {
      if (newPin === CORRECT_PIN) {
        setPin('');
        navigation.goBack();
      } else {
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 500);
      }
    } else {
      setPin(newPin);
    }
  }, [pin, navigation]);

  const handleDelete = useCallback(() => {
    setError(false);
    setPin((p) => p.slice(0, -1));
  }, []);

  const dots = Array.from({ length: PIN_LENGTH }, (_, i) => (
    <View
      key={i}
      style={[
        styles.dot,
        i < pin.length && styles.dotFilled,
        error && styles.dotError,
      ]}
    />
  ));

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'del'],
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar hidden />
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconWrap}>
            <LockIcon size={48} color={theme.colors.textSecondary} />
          </View>

          {/* Title */}
          <Text style={styles.title}>r_keeper</Text>
          <Text style={styles.subtitle}>Введите PIN-код</Text>

          {/* Dots */}
          <View style={styles.dotsRow}>{dots}</View>

          {/* Error text */}
          {error && <Text style={styles.errorText}>Неверный PIN</Text>}

          {/* Numpad */}
          <View style={styles.numpad}>
            {keys.map((row, rowIdx) => (
              <View key={rowIdx} style={styles.numRow}>
                {row.map((key) => {
                  if (key === '') {
                    return <View key="empty" style={styles.numKey} />;
                  }
                  if (key === 'del') {
                    return (
                      <TouchableOpacity
                        key="del"
                        style={styles.numKey}
                        onPress={handleDelete}
                        activeOpacity={0.6}
                      >
                        <Text style={styles.delText}>⌫</Text>
                      </TouchableOpacity>
                    );
                  }
                  return (
                    <TouchableOpacity
                      key={key}
                      style={styles.numKey}
                      onPress={() => handleDigit(key)}
                      activeOpacity={0.6}
                    >
                      <Text style={styles.numText}>{key}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconWrap: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 32,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    height: 30,
    alignItems: 'center',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.textSecondary,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: theme.colors.tabActive,
    borderColor: theme.colors.tabActive,
  },
  dotError: {
    backgroundColor: '#D32F2F',
    borderColor: '#D32F2F',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
    height: 20,
  },
  numpad: {
    marginTop: 16,
  },
  numRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  numKey: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numText: {
    fontSize: 28,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  delText: {
    fontSize: 24,
    color: theme.colors.textSecondary,
  },
});
