import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, Alert, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useVaultStore } from '../stores/vaultStore';
import { TextField } from '../components/TextField';
import { PrimaryButton } from '../components/PrimaryButton';
import { CustomAlert } from '../components/CustomAlert';
import { Metrics } from '../theme/metrics';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
  route: any; // Account object passed via params
};

export const EditAccountScreen: React.FC<Props> = ({ navigation, route }) => {
  const account = route.params?.account;
  const systemTheme = useColorScheme();
  const { updateAccount, removeAccount, groups, theme: storeTheme } = useVaultStore();

  const isDarkMode = storeTheme === 'system' ? systemTheme === 'dark' : storeTheme === 'dark';
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [issuer, setIssuer] = useState(account?.issuer || '');
  const [accountName, setAccountName] = useState(account?.accountName || '');
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>(account?.groupId);
  const [loading, setLoading] = useState(false);
  const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);

  if (!account) {
    return null;
  }

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateAccount({
        ...account,
        issuer,
        accountName,
        groupId: selectedGroup
      });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setDeleteAlertVisible(true);
  };

  const confirmDelete = async () => {
    setDeleteAlertVisible(false);
    try {
      await removeAccount(account.id);
      navigation.goBack();
    } catch (e: any) {
      if (Platform.OS === 'web') alert(e.message);
      else Alert.alert('Error', e.message);
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
          Edit Account
        </Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.form}>
        <TextField
          label="Issuer"
          theme={theme}
          value={issuer}
          onChangeText={setIssuer}
        />

        <TextField
          label="Account Name"
          theme={theme}
          value={accountName}
          onChangeText={setAccountName}
          autoCapitalize="none"
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
          title="Save Changes"
          theme={theme}
          onPress={handleSave}
          loading={loading}
        />

        <TouchableOpacity 
          style={[styles.deleteButton, { borderColor: theme.danger || '#FF3B30' }]}
          onPress={handleDelete}
        >
          <Text style={[Typography.bodyMedium, { color: theme.danger || '#FF3B30' }]}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      <CustomAlert
        visible={deleteAlertVisible}
        theme={theme}
        title="Delete Account"
        message="Are you sure you want to delete this account? This cannot be undone."
        confirmText="Delete"
        confirmStyle="destructive"
        onCancel={() => setDeleteAlertVisible(false)}
        onConfirm={confirmDelete}
      />
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
  deleteButton: {
    padding: Metrics.spacing.lg,
    borderRadius: Metrics.borderRadius.md,
    alignItems: 'center',
    marginTop: Metrics.spacing.xl,
    borderWidth: 1,
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
