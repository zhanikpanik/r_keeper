import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LogBox } from 'react-native';
import { OrdersScreen } from './src/screens/OrdersScreen';
import { PosScreen } from './src/screens/PosScreen';

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
        initialRouteName="Orders"
        screenOptions={{
          headerShown: false,
          animation: 'none', 
        }}
      >
        <Stack.Screen name="Orders" component={OrdersScreen} />
        <Stack.Screen name="Pos" component={PosScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

