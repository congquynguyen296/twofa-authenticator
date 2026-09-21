import * as SQLite from 'expo-sqlite';
import { AuthenticatorAccount, AccountGroup } from '../types';

// The database instance
const dbName = 'vaultotp.db';
let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async () => {
  if (db) return db;
  
  db = await SQLite.openDatabaseAsync(dbName);
  
  // Create tables
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY NOT NULL,
      issuer TEXT NOT NULL,
      accountName TEXT NOT NULL,
      secret TEXT NOT NULL,
      algorithm TEXT NOT NULL,
      digits INTEGER NOT NULL,
      period INTEGER NOT NULL,
      groupId TEXT,
      icon TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      icon TEXT,
      sortOrder INTEGER NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );
  `);
  
  return db;
};

export const getAccounts = async (): Promise<AuthenticatorAccount[]> => {
  if (!db) await initDatabase();
  return await db!.getAllAsync<AuthenticatorAccount>('SELECT * FROM accounts ORDER BY createdAt DESC');
};

export const saveAccount = async (account: AuthenticatorAccount): Promise<void> => {
  if (!db) await initDatabase();
  await db!.runAsync(
    `INSERT OR REPLACE INTO accounts (id, issuer, accountName, secret, algorithm, digits, period, groupId, icon, createdAt, updatedAt) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      account.id, 
      account.issuer, 
      account.accountName, 
      account.secret, 
      account.algorithm, 
      account.digits, 
      account.period, 
      account.groupId || null, 
      account.icon || null, 
      account.createdAt, 
      account.updatedAt
    ]
  );
};

export const deleteAccount = async (id: string): Promise<void> => {
  if (!db) await initDatabase();
  await db!.runAsync('DELETE FROM accounts WHERE id = ?', [id]);
};

// Groups
export const getGroups = async (): Promise<AccountGroup[]> => {
  if (!db) await initDatabase();
  return await db!.getAllAsync<AccountGroup>('SELECT * FROM groups ORDER BY sortOrder ASC');
};

export const saveGroup = async (group: AccountGroup): Promise<void> => {
  if (!db) await initDatabase();
  await db!.runAsync(
    `INSERT OR REPLACE INTO groups (id, name, icon, sortOrder, createdAt, updatedAt) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [group.id, group.name, group.icon || null, group.sortOrder, group.createdAt, group.updatedAt]
  );
};

export const deleteGroup = async (id: string): Promise<void> => {
  if (!db) await initDatabase();
  await db!.runAsync('DELETE FROM groups WHERE id = ?', [id]);
  // Also remove groupId from accounts
  await db!.runAsync('UPDATE accounts SET groupId = NULL WHERE groupId = ?', [id]);
};
