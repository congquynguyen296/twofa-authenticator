import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, useColorScheme, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVaultStore } from '../stores/vaultStore';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Metrics } from '../theme/metrics';
import { Ionicons } from '@expo/vector-icons';
import { SecurityService } from '../services/securityService';
import { TextField } from '../components/TextField';
import { PrimaryButton } from '../components/PrimaryButton';
import { CustomAlert } from '../components/CustomAlert';
import { GradientText } from '../components/GradientText';

export const SyncScreen = () => {
  const systemTheme = useColorScheme();
  const { theme: storeTheme, syncToCloud, syncFromCloud } = useVaultStore();
  const isDarkMode = storeTheme === 'system' ? systemTheme === 'dark' : storeTheme === 'dark';
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [deviceId, setDeviceId] = useState('');
  const [restoreId, setRestoreId] = useState('');
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [restoreAlertVisible, setRestoreAlertVisible] = useState(false);

  useEffect(() => {
    try {
      const id = SecurityService.getDeviceID();
      setDeviceId(id);
    } catch (e) {
      // Ignore if not initialized
    }
  }, []);

  const handlePush = async () => {
    setIsPushing(true);
    try {
      await syncToCloud();
      Alert.alert('Success', 'Your vault has been securely backed up to the cloud.');
    } catch (e: any) {
      Alert.alert('Backup Failed', e.message);
    } finally {
      setIsPushing(false);
    }
  };

  const isPullingRef = React.useRef(false);

  const handlePull = () => {
    if (isPullingRef.current) return;
    
    if (!restoreId && !deviceId) {
      if (Platform.OS === 'web') alert('Please enter a Device ID to restore from');
      else Alert.alert('Error', 'Please enter a Device ID to restore from');
      return;
    }
    
    setRestoreAlertVisible(true);
  };

  const confirmRestore = async () => {
    setRestoreAlertVisible(false);
    isPullingRef.current = true;
    setIsPulling(true);
    try {
      await syncFromCloud(restoreId || deviceId);
      if (Platform.OS === 'web') alert('Your vault has been restored from the cloud.');
      else Alert.alert('Success', 'Your vault has been restored from the cloud.');
      setRestoreId('');
    } catch (e: any) {
      if (Platform.OS === 'web') alert(e.message);
      else Alert.alert('Restore Failed', e.message);
    } finally {
      setIsPulling(false);
      isPullingRef.current = false;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <GradientText style={Typography.h1}>
            Cloud Sync
          </GradientText>
          <Text style={[Typography.body, { color: theme.textSecondary, marginTop: 8 }]}>
            Securely backup your encrypted vault to our Zero-Knowledge cloud.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="cloud-upload" size={24} color={theme.primary} />
            <Text style={[Typography.h3, { color: theme.text, marginLeft: 12 }]}>Backup Vault</Text>
          </View>
          <Text style={[Typography.caption, { color: theme.textSecondary, marginBottom: 16 }]}>
            Your Device ID is your unique cloud identifier. Write it down if you plan to move to a new phone.
          </Text>
          
          <View style={[styles.idBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <Text style={[Typography.caption, { color: theme.textSecondary }]}>Your Device ID:</Text>
            <Text style={[Typography.code, { color: theme.primary, fontSize: 16, marginTop: 4 }]}>{deviceId || 'Loading...'}</Text>
          </View>

          <PrimaryButton 
            title="Sync to Cloud" 
            theme={theme} 
            onPress={handlePush} 
            loading={isPushing} 
            disabled={isPulling}
          />
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="cloud-download" size={24} color={theme.primary} />
            <Text style={[Typography.h3, { color: theme.text, marginLeft: 12 }]}>Restore Vault</Text>
          </View>
          <Text style={[Typography.caption, { color: theme.textSecondary, marginBottom: 16 }]}>
            Enter a Device ID from your previous phone to restore your cloud backup.
          </Text>

          <TextField
            label="Recovery Device ID"
            placeholder="e.g. DEV-1A2B3C4D"
            theme={theme}
            value={restoreId}
            onChangeText={setRestoreId}
            autoCapitalize="characters"
          />

          <PrimaryButton 
            title="Restore from Cloud" 
            theme={theme} 
            onPress={handlePull} 
            loading={isPulling} 
            disabled={isPushing}
          />
        </View>
      </ScrollView>
      
      <CustomAlert
        visible={restoreAlertVisible}
        theme={theme}
        title="Warning"
        message="Restoring from the cloud will overwrite your current local accounts. Are you sure?"
        confirmText="Restore"
        confirmStyle="destructive"
        onCancel={() => setRestoreAlertVisible(false)}
        onConfirm={confirmRestore}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: Metrics.spacing.xl,
    paddingBottom: 100, // Space for TabBar
  },
  header: {
    marginBottom: Metrics.spacing.xl,
  },
  card: {
    padding: Metrics.spacing.lg,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: Metrics.spacing.lg,
    ...Metrics.shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Metrics.spacing.md,
  },
  idBox: {
    padding: Metrics.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: Metrics.spacing.lg,
    alignItems: 'center',
  }
});
