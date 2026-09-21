import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, Alert, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useVaultStore } from '../stores/vaultStore';
import { TextField } from '../components/TextField';
import { PrimaryButton } from '../components/PrimaryButton';
import { Metrics } from '../theme/metrics';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export const AddAccountScreen: React.FC<Props> = ({ navigation }) => {
  const systemTheme = useColorScheme();
  const { addAccount, groups, theme: storeTheme } = useVaultStore();

  const isDarkMode = storeTheme === 'system' 
    ? systemTheme === 'dark'
    : storeTheme === 'dark';

  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [issuer, setIssuer] = useState('');
  const [accountName, setAccountName] = useState('');
  const [secret, setSecret] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!secret) {
      Alert.alert('Error', 'Secret key is required');
      return;
    }
    setLoading(true);
    try {
      await addAccount({
        issuer,
        accountName: accountName || 'Unknown',
        secret: secret.replace(/\s/g, '').toUpperCase(),
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        groupId: selectedGroup
      });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[Typography.body, { color: theme.primary }]}>Cancel</Text>
        </TouchableOpacity>
        <Text 
          style={[
            Typography.h3, 
            Platform.OS === 'web' ? {
              backgroundImage: 'linear-gradient(45deg, #007AFF, #5AC8FA)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            } as any : { color: theme.primary }
          ]}
        >
          Add Account
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Scanner')}>
          <Text style={[Typography.body, { color: theme.primary }]}>Scan QR</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <TextField
          label="Issuer"
          theme={theme}
          placeholder="e.g. GitHub"
          value={issuer}
          onChangeText={setIssuer}
        />

        <TextField
          label="Account Name"
          theme={theme}
          placeholder="e.g. user@example.com"
          value={accountName}
          onChangeText={setAccountName}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextField
          label="Secret Key"
          theme={theme}
          placeholder="JBSWY3DPEHPK3PXP"
          value={secret}
          onChangeText={setSecret}
          autoCapitalize="characters"
        />

        {groups.length > 0 && (
          <View style={styles.groupPicker}>
            <Text style={[Typography.caption, { color: theme.textSecondary, marginBottom: 8 }]}>Assign to Group (Optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity 
                style={[styles.groupChip, !selectedGroup && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                onPress={() => setSelectedGroup(undefined)}
              >
                <Text style={[Typography.caption, { color: !selectedGroup ? '#FFF' : theme.textSecondary }]}>None</Text>
              </TouchableOpacity>
              
              {groups.map(group => (
                <TouchableOpacity 
                  key={group.id}
                  style={[styles.groupChip, selectedGroup === group.id && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                  onPress={() => setSelectedGroup(group.id)}
                >
                  <Text style={[Typography.caption, { color: selectedGroup === group.id ? '#FFF' : theme.textSecondary }]}>{group.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <PrimaryButton 
          title="Add Account"
          theme={theme}
          onPress={handleSave}
          loading={loading}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Metrics.spacing.xl,
    paddingVertical: Metrics.spacing.lg,
  },
  form: {
    padding: Metrics.spacing.xl,
  },
  groupPicker: {
    marginBottom: Metrics.spacing.lg,
  },
  groupChip: {
    paddingHorizontal: Metrics.spacing.lg,
    paddingVertical: Metrics.spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.3)',
    marginRight: Metrics.spacing.sm,
  }
});
