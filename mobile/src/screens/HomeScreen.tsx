import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, useColorScheme, StatusBar, ScrollView, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useVaultStore } from '../stores/vaultStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AccountCard } from '../components/AccountCard';
import { EmptyState } from '../components/EmptyState';
import { Metrics } from '../theme/metrics';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const systemTheme = useColorScheme();
  const { accounts, groups, loadVault, isLoading, theme: storeTheme } = useVaultStore();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const isDarkMode = storeTheme === 'system' 
    ? systemTheme === 'dark'
    : storeTheme === 'dark';

  const theme = isDarkMode ? Colors.dark : Colors.light;

  useEffect(() => {
    loadVault();
  }, []);

  const filteredAccounts = accounts.filter(a => {
    const matchesGroup = selectedGroup ? a.groupId === selectedGroup : true;
    const matchesSearch = 
      (a.issuer && a.issuer.toLowerCase().includes(searchQuery.toLowerCase())) || 
      a.accountName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
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
          VaultOTP
        </Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={[
          styles.searchBarWrapper,
          isFocused ? (Platform.OS === 'web' ? {
            backgroundImage: 'linear-gradient(45deg, #007AFF, #5AC8FA)'
          } as any : { backgroundColor: theme.primary }) : { backgroundColor: 'transparent' }
        ]}>
          <View style={[
            styles.searchBar, 
            { backgroundColor: theme.surface, borderColor: isFocused ? 'transparent' : theme.border }
          ]}>
            <Ionicons name="search" size={20} color={isFocused ? theme.primary : theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search accounts..."
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity 
            style={[styles.filterChip, !selectedGroup && { backgroundColor: theme.primary, borderColor: theme.primary }]}
            onPress={() => setSelectedGroup(null)}
          >
            <Text style={[Typography.caption, { color: !selectedGroup ? '#FFF' : theme.textSecondary }]}>All</Text>
          </TouchableOpacity>
          
          {groups.map(group => (
            <TouchableOpacity 
              key={group.id}
              style={[styles.filterChip, selectedGroup === group.id && { backgroundColor: theme.primary, borderColor: theme.primary }]}
              onPress={() => setSelectedGroup(group.id)}
            >
              <Text style={[Typography.caption, { color: selectedGroup === group.id ? '#FFF' : theme.textSecondary }]}>{group.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <EmptyState message="Loading vault..." theme={theme} />
      ) : accounts.length === 0 ? (
        <EmptyState message="No accounts yet. Add your first account!" theme={theme} />
      ) : filteredAccounts.length === 0 ? (
        <EmptyState message="No accounts in this group." theme={theme} />
      ) : (
        <FlatList
          data={filteredAccounts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AccountCard account={item} theme={theme} />}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: Metrics.spacing.sm }}
        />
      )}
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
  searchContainer: {
    paddingHorizontal: Metrics.spacing.xl,
    marginBottom: Metrics.spacing.md,
  },
  searchBarWrapper: {
    borderRadius: 18, // 16 + 2px padding
    padding: 2, // 2px gradient border thickness when focused
    marginHorizontal: -2, // Offset padding so layout doesn't shift
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    paddingVertical: Platform.OS === 'web' ? 4 : 0,
    ...(Platform.OS === 'web' && { outlineStyle: 'none' } as any)
  },
  filterContainer: {
    marginBottom: Metrics.spacing.md,
  },
  filterScroll: {
    paddingHorizontal: Metrics.spacing.xl,
  },
  filterChip: {
    paddingHorizontal: Metrics.spacing.lg,
    paddingVertical: Metrics.spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.3)',
    marginRight: Metrics.spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: Metrics.spacing.lg,
  }
});
