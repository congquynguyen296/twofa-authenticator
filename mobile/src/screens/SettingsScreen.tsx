import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useVaultStore } from '../stores/vaultStore';
import { Metrics } from '../theme/metrics';
import { Ionicons } from '@expo/vector-icons';
import { GradientText } from '../components/GradientText';
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
        <GradientText style={Typography.h1}>
          Settings
        </GradientText>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="color-palette-outline" size={24} color={theme.textSecondary} />
              <Text style={[Typography.bodyMedium, { color: theme.text, marginLeft: 12 }]}>Theme</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => useVaultStore.getState().setTheme('light')} style={{ paddingHorizontal: 8 }}>
                <Text style={[Typography.body, { color: storeTheme === 'light' ? theme.primary : theme.textSecondary, fontWeight: storeTheme === 'light' ? 'bold' : 'normal' }]}>Light</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => useVaultStore.getState().setTheme('dark')} style={{ paddingHorizontal: 8 }}>
                <Text style={[Typography.body, { color: storeTheme === 'dark' ? theme.primary : theme.textSecondary, fontWeight: storeTheme === 'dark' ? 'bold' : 'normal' }]}>Dark</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => useVaultStore.getState().setTheme('system')} style={{ paddingHorizontal: 8 }}>
                <Text style={[Typography.body, { color: storeTheme === 'system' ? theme.primary : theme.textSecondary, fontWeight: storeTheme === 'system' ? 'bold' : 'normal' }]}>System</Text>
              </TouchableOpacity>
            </View>
          </View>
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
