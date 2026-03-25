import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { theme } from '../theme/colors';
import { PosHeader } from '../components/PosHeader';
import { OrderPanel } from '../components/OrderPanel';
import { ItemActionsMenu } from '../components/ItemActionsMenu';
import { ModifierGrid } from '../components/ModifierGrid';

export const PosScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const handleBack = () => {
    if (navigation) {
      navigation.navigate('Orders');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar hidden />
      <View style={styles.container}>
        {/* Top Header Row */}
        <PosHeader onBack={handleBack} />

        {/* Main 3-Column Content */}
        <View style={styles.mainContent}>
          {/* Left Column: Order Receipt (approx 35%) */}
          <View style={styles.leftColumn}>
            <OrderPanel />
          </View>

          {/* Middle Column: Item Actions Grid (approx 25%) */}
          <View style={styles.middleColumn}>
            <ItemActionsMenu />
          </View>

          {/* Right Column: Modifier Selection Grid (approx 40%) */}
          <View style={styles.rightColumn}>
            <ModifierGrid />
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
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  leftColumn: {
    flex: 0.35,
    backgroundColor: theme.colors.surfaceDeep,
    borderRadius: theme.borderRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  middleColumn: {
    flex: 0.25,
    backgroundColor: theme.colors.surfaceDeep,
    borderRadius: theme.borderRadius,
    overflow: 'hidden',
  },
  rightColumn: {
    flex: 0.40,
    backgroundColor: theme.colors.surfaceDeep,
    borderRadius: theme.borderRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
});
