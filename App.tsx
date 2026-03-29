import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LogBox } from 'react-native';
import { OrdersScreen } from './src/screens/OrdersScreen';
import { PosScreen } from './src/screens/PosScreen';
import { PaymentScreen } from './src/screens/PaymentScreen';
import { LockScreen } from './src/screens/LockScreen';
import { OpenShiftScreen } from './src/screens/OpenShiftScreen';

// Ignore specific warnings coming from react-native-web or navigation libraries
LogBox.ignoreLogs([
  'props.pointerEvents is deprecated',
  'Blocked aria-hidden on an element',
]);

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="OpenShift"
        screenOptions={{
          headerShown: false,
          animation: 'none', 
        }}
      >
        <Stack.Screen name="OpenShift" component={OpenShiftScreen} />
        <Stack.Screen name="Orders" component={OrdersScreen} />
        <Stack.Screen name="Pos" component={PosScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="Lock" component={LockScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

