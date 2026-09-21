import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useVaultStore } from '../stores/vaultStore';
import { Metrics } from '../theme/metrics';
import { Ionicons } from '@expo/vector-icons';

export const SettingsScreen = () => {
  const systemTheme = useColorScheme();
  const { theme: storeTheme, lock } = useVaultStore();

  const isDarkMode = storeTheme === 'system' 
    ? systemTheme === 'dark'
    : storeTheme === 'dark';

  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text 
          style={[
            Typography.h1, 
            Platform.OS === 'web' ? {
              backgroundImage: 'linear-gradient(45deg, #007AFF, #5AC8FA)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            } as any : { color: theme.primary }
          ]}
        >
          Settings
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TouchableOpacity style={styles.row} onPress={lock}>
            <View style={styles.rowLeft}>
              <Ionicons name="lock-closed-outline" size={24} color={theme.primary} />
              <Text style={[Typography.bodyMedium, { color: theme.text, marginLeft: 12 }]}>Lock Vault</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="information-circle-outline" size={24} color={theme.textSecondary} />
              <Text style={[Typography.bodyMedium, { color: theme.text, marginLeft: 12 }]}>App Version</Text>
            </View>
            <Text style={[Typography.body, { color: theme.textSecondary }]}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Metrics.spacing.xl,
    paddingVertical: Metrics.spacing.lg,
  },
  content: {
    padding: Metrics.spacing.xl,
  },
  section: {
    borderRadius: Metrics.borderRadius.md,
    borderWidth: 1,
    marginBottom: Metrics.spacing.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Metrics.spacing.md,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
