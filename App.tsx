import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LogBox } from 'react-native';
import { OrdersScreen } from './src/screens/OrdersScreen';
import { PosScreen } from './src/screens/PosScreen';
import { PaymentScreen } from './src/screens/PaymentScreen';
import { LockScreen } from './src/screens/LockScreen';
import { OpenShiftScreen } from './src/screens/OpenShiftScreen';
import { useShiftStore } from './src/store/shiftStore';
import { useVenueStore } from './src/store/venueStore';

// Ignore specific warnings coming from react-native-web or navigation libraries
LogBox.ignoreLogs([
  'props.pointerEvents is deprecated',
  'Blocked aria-hidden on an element',
]);

const Stack = createStackNavigator();

export default function App() {
  const currentUser = useShiftStore((s) => s.currentUser);
  const hasShift = useShiftStore((s) => s.currentShift !== null);
  const fetchVenue = useVenueStore((s) => s.fetchVenue);

  // Load venue data (users/tables/zones) on app start for PIN validation
  useEffect(() => {
    fetchVenue();
  }, []);

  // Determine initial route
  const getInitialRoute = () => {
    if (!currentUser) return 'Lock';
    if (!hasShift) return 'OpenShift';
    return 'Orders';
  };

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={getInitialRoute()}
        screenOptions={{
          headerShown: false,
          animation: 'none', 
        }}
      >
        <Stack.Screen name="Lock" component={LockScreen} />
        <Stack.Screen name="OpenShift" component={OpenShiftScreen} />
        <Stack.Screen name="Orders" component={OrdersScreen} />
        <Stack.Screen name="Pos" component={PosScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
