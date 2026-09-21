import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useVaultStore } from '../stores/vaultStore';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (action: 'scan' | 'group' | 'account') => void;
};

export const FabMenu: React.FC<Props> = ({ isOpen, onClose, onSelect }) => {
  const storeTheme = useVaultStore((state) => state.theme);
  const systemTheme = useColorScheme();
  const isDarkMode = storeTheme === 'system' ? systemTheme === 'dark' : storeTheme === 'dark';
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
        tension: 50,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen]);

  const bgOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const getTransform = (angle: number, distance: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      opacity: animation,
      transform: [
        {
          translateX: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, Math.cos(rad) * distance],
          }),
        },
        {
          translateY: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, Math.sin(rad) * distance],
          }),
        },
        {
          scale: animation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.5, 1.2, 1],
          }),
        },
      ],
    };
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={isOpen ? "auto" : "none"}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#000', opacity: bgOpacity }]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} disabled={!isOpen} />
      </Animated.View>

      <View style={styles.menuContainer} pointerEvents={isOpen ? "box-none" : "none"}>
        {/* Item 1: Create Group (Angle: 270 straight up) */}
        <Animated.View style={[styles.menuItemWrapper, getTransform(270, 160)]}>
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: theme.surface }]} 
            onPress={() => onSelect('group')}
            disabled={!isOpen}
          >
            <Ionicons name="folder-outline" size={26} color={theme.primary} />
          </TouchableOpacity>
          <Text style={[styles.menuLabel, { color: theme.text }]}>New Group</Text>
        </Animated.View>

        {/* Item 2: Scan QR (Angle: 220 up-left) */}
        <Animated.View style={[styles.menuItemWrapper, getTransform(215, 130)]}>
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: theme.surface }]} 
            onPress={() => onSelect('scan')}
            disabled={!isOpen}
          >
            <Ionicons name="qr-code-outline" size={26} color={theme.primary} />
          </TouchableOpacity>
          <Text style={[styles.menuLabel, { color: theme.text }]}>Scan QR</Text>
        </Animated.View>

        {/* Item 3: Add Account (Angle: 320 up-right) */}
        <Animated.View style={[styles.menuItemWrapper, getTransform(325, 130)]}>
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: theme.surface }]} 
            onPress={() => onSelect('account')}
            disabled={!isOpen}
          >
            <Ionicons name="keypad-outline" size={26} color={theme.primary} />
          </TouchableOpacity>
          <Text style={[styles.menuLabel, { color: theme.text }]}>Manual Entry</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    position: 'absolute',
    bottom: 50, // Positioned near the FAB
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemWrapper: {
    position: 'absolute',
    alignItems: 'center',
  },
  menuItem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    marginBottom: 8,
  },
  menuLabel: {
    ...Typography.caption,
    fontWeight: '600',
    textShadowColor: 'rgba(255,255,255,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
