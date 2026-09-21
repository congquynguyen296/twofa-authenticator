import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppState, AppStateStatus, useColorScheme } from 'react-native';

import { TabNavigator } from './src/navigation/TabNavigator';
import { AddAccountScreen } from './src/screens/AddAccountScreen';
import { ScannerScreen } from './src/screens/ScannerScreen';
import { EditAccountScreen } from './src/screens/EditAccountScreen';

import { useVaultStore } from './src/stores/vaultStore';
import { Colors } from './src/theme/colors';

export type RootStackParamList = {
  MainTabs: undefined;
  AddAccount: undefined;
  Scanner: undefined;
  EditAccount: { account: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const { theme: storeTheme } = useVaultStore();
  const systemTheme = useColorScheme();
  const isDarkMode = storeTheme === 'system' ? systemTheme === 'dark' : storeTheme === 'dark';
  const theme = isDarkMode ? Colors.dark : Colors.light;



  const navTheme = isDarkMode ? DarkTheme : DefaultTheme;
  const customNavTheme = {
    ...navTheme,
    colors: {
      ...navTheme.colors,
      background: theme.background,
    },
  };

  return (
    <SafeAreaProvider style={{ backgroundColor: theme.background }}>

      <NavigationContainer theme={customNavTheme}>
        <Stack.Navigator
          initialRouteName="MainTabs"
          screenOptions={{ 
            headerShown: false,
            animation: 'slide_from_bottom',
            contentStyle: { backgroundColor: theme.background }
          }}
        >
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen 
            name="AddAccount" 
            component={AddAccountScreen} 
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen 
            name="Scanner" 
            component={ScannerScreen} 
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen 
            name="EditAccount" 
            component={EditAccountScreen} 
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
