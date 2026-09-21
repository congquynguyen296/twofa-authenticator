import * as db from '../storage/database';
import { AuthenticatorAccount, AccountGroup } from '../types';
import { SecurityService } from './securityService';

const generateId = () => Math.random().toString(36).substring(2, 15);

export const vaultService = {
  async init(): Promise<void> {
    await SecurityService.initialize();
    await db.initDatabase();
  },

  async getAccounts(): Promise<AuthenticatorAccount[]> {
    const rawAccounts = await db.getAccounts();
    // Decrypt secrets
    return rawAccounts.map(account => {
      try {
        if (account.secret) {
          account.secret = SecurityService.decryptData(account.secret);
        }
      } catch (e) {
        console.error('Failed to decrypt account secret', account.id);
      }
      return account;
    });
  },

  async getGroups(): Promise<AccountGroup[]> {
    return await db.getGroups();
  },

  async addAccount(accountData: Omit<AuthenticatorAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<AuthenticatorAccount> {
    const newAccount: AuthenticatorAccount = {
      ...accountData,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    // Encrypt before saving
    const encryptedAccount = { ...newAccount, secret: SecurityService.encryptData(newAccount.secret) };
    await db.saveAccount(encryptedAccount);
    
    // Return unencrypted version for state
    return newAccount;
  },

  async updateAccount(account: AuthenticatorAccount): Promise<AuthenticatorAccount> {
    const updatedAccount = { ...account, updatedAt: Date.now() };
    const encryptedAccount = { ...updatedAccount, secret: SecurityService.encryptData(updatedAccount.secret) };
    await db.saveAccount(encryptedAccount);
    return updatedAccount;
  },

  async restoreVaultData(accounts: AuthenticatorAccount[], groups: AccountGroup[]): Promise<void> {
    // Wipe existing data
    const currentAccounts = await db.getAccounts();
    for (const acc of currentAccounts) {
      await db.deleteAccount(acc.id);
    }
    const currentGroups = await db.getGroups();
    for (const g of currentGroups) {
      await db.deleteGroup(g.id);
    }
    
    // Insert new groups
    for (const g of groups) {
      await db.saveGroup(g);
    }
    
    // Insert new accounts
    for (const acc of accounts) {
      const encryptedAccount = { ...acc, secret: SecurityService.encryptData(acc.secret) };
      await db.saveAccount(encryptedAccount);
    }
  },

  async removeAccount(id: string): Promise<void> {
    await db.deleteAccount(id);
  },

  async addGroup(name: string, icon?: string): Promise<AccountGroup> {
    const groups = await db.getGroups();
    const newGroup: AccountGroup = {
      id: generateId(),
      name,
      icon,
      sortOrder: groups.length,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.saveGroup(newGroup);
    return newGroup;
  },

  async removeGroup(id: string): Promise<void> {
    await db.deleteGroup(id);
  },

  async updateGroup(group: AccountGroup): Promise<AccountGroup> {
    const updatedGroup = { ...group, updatedAt: Date.now() };
    await db.saveGroup(updatedGroup);
    return updatedGroup;
  }
};
