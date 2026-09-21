import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { useVaultStore } from '../stores/vaultStore';

type Props = {
  theme: any;
};

export const LockScreen: React.FC<Props> = ({ theme }) => {
  const unlock = useVaultStore((state) => state.unlock);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BlurView intensity={80} tint={theme.background === '#000000' ? 'dark' : 'light'} style={styles.blurContainer}>
        <View style={styles.iconWrapper}>
          <Ionicons name="lock-closed" size={64} color={theme.primary} />
        </View>
        <Text 
          style={[
            Typography.h1, 
            { marginTop: 24, marginBottom: 8 },
            Platform.OS === 'web' ? {
              backgroundImage: 'linear-gradient(45deg, #007AFF, #5AC8FA)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            } as any : { color: theme.primary }
          ]}
        >
          VaultOTP
        </Text>
        <Text style={[Typography.bodyMedium, { color: theme.textSecondary, textAlign: 'center', marginBottom: 40 }]}>
          Authenticate to access your 2FA codes
        </Text>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.primary }]} 
          onPress={() => unlock()}
          activeOpacity={0.8}
        >
          <Ionicons name="finger-print" size={24} color="#FFF" style={{ marginRight: 12 }} />
          <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '600' }}>Unlock Vault</Text>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  }
});
