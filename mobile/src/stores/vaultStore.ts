import { create } from 'zustand';
import { AuthenticatorAccount, AccountGroup } from '../types';
import { vaultService } from '../services/vaultService';
import { Platform } from 'react-native';
import { mockAccounts } from '../mocks/vaultMocks';

interface VaultState {
  accounts: AuthenticatorAccount[];
  groups: AccountGroup[];
  isLoading: boolean;
  error: string | null;
  theme: 'system' | 'light' | 'dark';
  isLocked: boolean;
  
  // Actions
  unlock: () => Promise<boolean>;
  lock: () => void;
  loadVault: () => Promise<void>;
  setTheme: (theme: 'system' | 'light' | 'dark') => void;
  addAccount: (account: Omit<AuthenticatorAccount, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAccount: (account: AuthenticatorAccount) => Promise<void>;
  removeAccount: (id: string) => Promise<void>;
  
  addGroup: (name: string, icon?: string) => Promise<void>;
  removeGroup: (id: string) => Promise<void>;
  updateGroup: (group: AccountGroup) => Promise<void>;

  syncToCloud: () => Promise<void>;
  syncFromCloud: (deviceId?: string) => Promise<void>;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useVaultStore = create<VaultState>((set, get) => ({
  accounts: [],
  groups: [],
  isLoading: false,
  error: null,
  theme: 'system',
  isLocked: true, // App starts locked

  setTheme: (theme) => set({ theme }),

  lock: () => set({ isLocked: true }),

  unlock: async () => {
    // Only attempt to initialize security and authenticate when asked
    const { SecurityService } = require('../services/securityService');
    await SecurityService.initialize();
    
    const success = await SecurityService.authenticateUser();
    if (success) {
      set({ isLocked: false });
      return true;
    }
    return false;
  },

  loadVault: async () => {
    set({ isLoading: true, error: null });
    try {
      if (Platform.OS === 'web') {
        // Fallback to mocks on Web due to SQLite wasm limitations
        set({ accounts: mockAccounts, groups: [], isLoading: false });
        return;
      }
      await vaultService.init();
      const accounts = await vaultService.getAccounts();
      const groups = await vaultService.getGroups();
      set({ accounts, groups, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addAccount: async (accountData) => {
    try {
      const newAccount = await vaultService.addAccount(accountData);
      set({ accounts: [newAccount, ...get().accounts] });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateAccount: async (account) => {
    try {
      const updatedAccount = await vaultService.updateAccount(account);
      set({
        accounts: get().accounts.map((a) => (a.id === account.id ? updatedAccount : a)),
      });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  removeAccount: async (id) => {
    try {
      await vaultService.removeAccount(id);
      set({ accounts: get().accounts.filter((a) => a.id !== id) });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  addGroup: async (name, icon) => {
    try {
      const newGroup = await vaultService.addGroup(name, icon);
      set({ groups: [...get().groups, newGroup] });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  removeGroup: async (id) => {
    try {
      await vaultService.removeGroup(id);
      set({
        groups: get().groups.filter((g) => g.id !== id),
        accounts: get().accounts.map((a) => (a.groupId === id ? { ...a, groupId: undefined } : a)),
      });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateGroup: async (group) => {
    try {
      const updatedGroup = await vaultService.updateGroup(group);
      set({
        groups: get().groups.map((g) => (g.id === group.id ? updatedGroup : g)),
      });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  syncToCloud: async () => {
    set({ isLoading: true, error: null });
    try {
      const { SecurityService } = require('../services/securityService');
      const { SyncService } = require('../services/syncService');
      
      const currentAccounts = get().accounts;
      const currentGroups = get().groups;
      const vaultData = { accounts: currentAccounts, groups: currentGroups };
      const jsonStr = JSON.stringify(vaultData);
      const encryptedData = SecurityService.encryptData(jsonStr);
      
      await SyncService.pushVault(encryptedData);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  syncFromCloud: async (deviceId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const { SecurityService } = require('../services/securityService');
      const { SyncService } = require('../services/syncService');
      
      const encryptedData = await SyncService.pullVault(deviceId);
      const jsonStr = SecurityService.decryptData(encryptedData);
      const vaultData = JSON.parse(jsonStr);
      
      // Handle legacy backups that were just an array of accounts
      const isLegacy = Array.isArray(vaultData);
      const accounts = isLegacy ? vaultData : (vaultData.accounts || []);
      const groups = isLegacy ? [] : (vaultData.groups || []);
      
      if (Platform.OS !== 'web') {
        await vaultService.restoreVaultData(accounts, groups);
      }
      set({ accounts, groups, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  }
}));
