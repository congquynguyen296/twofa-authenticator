import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, useColorScheme, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVaultStore } from '../stores/vaultStore';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Metrics } from '../theme/metrics';
import { Ionicons } from '@expo/vector-icons';
import { TextField } from '../components/TextField';
import { GradientText } from '../components/GradientText';
import { PrimaryButton } from '../components/PrimaryButton';
import { CustomAlert } from '../components/CustomAlert';
import { useRoute } from '@react-navigation/native';

export const GroupScreen = () => {
  const systemTheme = useColorScheme();
  const route = useRoute<any>();
  const { theme: storeTheme, groups, addGroup, removeGroup, updateGroup } = useVaultStore();
  const isDarkMode = storeTheme === 'system' ? systemTheme === 'dark' : storeTheme === 'dark';
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [newGroupName, setNewGroupName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [alertConfig, setAlertConfig] = useState<{ visible: boolean; id: string; name: string }>({
    visible: false,
    id: '',
    name: ''
  });

  useEffect(() => {
    if (route.params?.openCreate) {
      setIsAdding(true);
    }
  }, [route.params?.openCreate]);

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert('Error', 'Group name cannot be empty');
      return;
    }
    try {
      await addGroup(newGroupName.trim(), 'folder');
      setNewGroupName('');
      setIsAdding(false);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleEditGroup = async (id: string, group: any) => {
    if (!editGroupName.trim()) {
      setEditingGroupId(null);
      return;
    }
    try {
      await updateGroup({ ...group, name: editGroupName.trim() });
      setEditingGroupId(null);
    } catch (e: any) {
      if (Platform.OS === 'web') alert(e.message);
      else Alert.alert('Error', e.message);
    }
  };

  const handleDeleteGroup = (id: string, name: string) => {
    setAlertConfig({ visible: true, id, name });
  };

  const confirmDeleteGroup = async () => {
    try {
      await removeGroup(alertConfig.id);
    } catch (e: any) {
      if (Platform.OS === 'web') alert(e.message);
      else Alert.alert('Error', e.message);
    } finally {
      setAlertConfig({ visible: false, id: '', name: '' });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <GradientText style={Typography.h1}>
          Groups
        </GradientText>
        <TouchableOpacity onPress={() => setIsAdding(!isAdding)} style={styles.headerBtn}>
          <Ionicons name={isAdding ? "close" : "add"} size={28} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {isAdding && (
        <View style={[styles.addForm, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TextField
            label="New Group Name"
            placeholder="e.g. Work, Personal"
            value={newGroupName}
            onChangeText={setNewGroupName}
            theme={theme}
            autoFocus
          />
          <View style={styles.row}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsAdding(false)}>
              <Text style={[Typography.bodyMedium, { color: theme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <PrimaryButton 
              title="Create" 
              theme={theme} 
              onPress={handleAddGroup} 
              style={{ flex: 1, marginTop: 0 }} 
            />
          </View>
        </View>
      )}

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={48} color={theme.textSecondary} />
            <Text style={[Typography.bodyMedium, { color: theme.textSecondary, marginTop: 16 }]}>
              No groups created yet.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.groupItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {editingGroupId === item.id ? (
              <View style={{ flex: 1 }}>
                <TextField
                  label="Rename Group"
                  placeholder="Group Name"
                  value={editGroupName}
                  onChangeText={setEditGroupName}
                  theme={theme}
                  autoFocus
                />
                <View style={[styles.row, { marginTop: 8 }]}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingGroupId(null)}>
                    <Text style={[Typography.bodyMedium, { color: theme.textSecondary }]}>Cancel</Text>
                  </TouchableOpacity>
                  <PrimaryButton 
                    title="Save" 
                    theme={theme} 
                    onPress={() => handleEditGroup(item.id, item)} 
                    style={{ flex: 1, marginTop: 0 }} 
                  />
                </View>
              </View>
            ) : (
              <>
                <View style={styles.groupInfo}>
                  <Ionicons name={item.icon as any || 'folder'} size={24} color={theme.primary} />
                  <Text style={[Typography.h3, { color: theme.text, marginLeft: 12 }]}>{item.name}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity 
                    onPress={() => {
                      setEditGroupName(item.name);
                      setEditingGroupId(item.id);
                    }} 
                    style={[styles.actionBtn, { marginRight: 8 }]}
                  >
                    <Ionicons name="pencil-outline" size={20} color={theme.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteGroup(item.id, item.name)} style={styles.actionBtn}>
                    <Ionicons name="trash-outline" size={20} color={theme.danger || '#FF3B30'} />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />

      {/* Footer removed as form is now at the top */}
      <CustomAlert
        visible={alertConfig.visible}
        theme={theme}
        title="Delete Group"
        message={`Are you sure you want to delete the group "${alertConfig.name}"? Accounts in this group will not be deleted, but they will be unassigned.`}
        confirmText="Delete"
        confirmStyle="destructive"
        onCancel={() => setAlertConfig({ visible: false, id: '', name: '' })}
        onConfirm={confirmDeleteGroup}
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
  headerBtn: {
    padding: Metrics.spacing.xs,
  },
  addForm: {
    marginHorizontal: Metrics.spacing.xl,
    marginBottom: Metrics.spacing.md,
    padding: Metrics.spacing.md,
    borderRadius: Metrics.borderRadius.md,
    borderWidth: 1,
  },
  listContent: {
    paddingHorizontal: Metrics.spacing.xl,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Metrics.spacing.md,
    borderRadius: Metrics.borderRadius.md,
    borderWidth: 1,
    marginBottom: Metrics.spacing.sm,
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionBtn: {
    padding: Metrics.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Metrics.spacing.md,
  },
  cancelBtn: {
    padding: Metrics.spacing.md,
    marginRight: Metrics.spacing.md,
  }
});
