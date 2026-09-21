import React from 'react';
import { View, TouchableOpacity, StyleSheet, useColorScheme, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { ScannerScreen } from '../screens/ScannerScreen';
import { SyncScreen } from '../screens/SyncScreen';
import { GroupScreen } from '../screens/GroupScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { FabMenu } from '../components/FabMenu';
import { Colors } from '../theme/colors';
import { useVaultStore } from '../stores/vaultStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const Tab = createBottomTabNavigator();

const CustomTabBarButton = ({ children, onPress, theme }: any) => {
  return (
    <View style={styles.customButtonContainer}>
      <TouchableOpacity
        style={styles.customButton}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={[styles.cutoutWrapper, { backgroundColor: theme.background }]}>
          <LinearGradient
            colors={['#007AFF', '#5AC8FA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            <Ionicons name="add" size={32} color="#FFF" />
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export const TabNavigator = () => {
  const systemTheme = useColorScheme();
  const storeTheme = useVaultStore((state) => state.theme);
  const isDarkMode = storeTheme === 'system' ? systemTheme === 'dark' : storeTheme === 'dark';
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [isFabOpen, setIsFabOpen] = React.useState(false);

  const handleFabSelect = (action: 'scan' | 'group' | 'account') => {
    setIsFabOpen(false);
    
    // Wait for the FAB menu closing animation (200ms) to complete before navigating
    // This prevents UI stuttering
    setTimeout(() => {
      if (action === 'scan') navigation.navigate('Scanner');
      if (action === 'account') navigation.navigate('AddAccount');
      if (action === 'group') {
        navigation.navigate('MainTabs', { 
          screen: 'Groups',
          params: { openCreate: true }
        });
      }
    }, 200);
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        safeAreaInsets={{ bottom: 0 }}
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarIconStyle: {
            margin: 0,
            height: '100%',
          },
          tabBarStyle: {
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 24 : 16,
            left: 20,
            right: 20,
            elevation: 0,
            backgroundColor: isDarkMode ? 'rgba(28, 28, 30, 0.8)' : 'rgba(255, 255, 255, 0.95)',
            borderRadius: 35,
          height: 65,
          paddingBottom: 0,
          paddingTop: 0,
          borderWidth: 1,
          borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          ...Platform.select({
            web: { boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' } as any,
            default: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.15,
              shadowRadius: 10,
            }
          })
        },
        tabBarItemStyle: {
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarBackground: () => (
          <View style={{ flex: 1, borderRadius: 35, overflow: 'hidden' }}>
            <BlurView 
              tint={isDarkMode ? 'dark' : 'light'} 
              intensity={80} 
              style={StyleSheet.absoluteFill} 
            />
          </View>
        ),
      }}
    >
      <Tab.Screen 
        name="TabHome" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'} size={28} color={focused ? theme.primary : theme.textSecondary} />
            </View>
          ),
        }}
      />
      
      <Tab.Screen 
        name="Groups" 
        component={GroupScreen} 
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name={focused ? 'folder' : 'folder-outline'} size={28} color={focused ? theme.primary : theme.textSecondary} />
            </View>
          ),
        }}
      />
      
      <Tab.Screen 
        name="TabAdd" 
        component={View} 
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            setIsFabOpen(true);
          },
        }}
        options={{
          tabBarButton: (props) => <CustomTabBarButton {...props} theme={theme} />
        }}
      />

      <Tab.Screen 
        name="TabSync" 
        component={SyncScreen} 
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name={focused ? 'cloud-done' : 'cloud-offline-outline'} size={28} color={focused ? theme.primary : theme.textSecondary} />
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="TabSettings" 
        component={SettingsScreen} 
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name={focused ? 'settings' : 'settings-outline'} size={28} color={focused ? theme.primary : theme.textSecondary} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
      <FabMenu isOpen={isFabOpen} onClose={() => setIsFabOpen(false)} onSelect={handleFabSelect} />
    </View>
  );
};

const styles = StyleSheet.create({
  customButtonContainer: {
    top: -24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customButton: {
    borderRadius: 38,
  },
  cutoutWrapper: {
    padding: 6, // Creates the gap between navbar and button
    borderRadius: 38, // 32 (button radius) + 6 (padding)
  },
  gradientButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 16px rgba(0, 122, 255, 0.4)'
      } as any,
      default: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 5,
      }
    }),
  }
});
