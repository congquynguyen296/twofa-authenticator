export type Algorithm = 'SHA1' | 'SHA256' | 'SHA512';

export interface TotpConfig {
  secret: string;
  algorithm?: Algorithm;
  digits?: 6 | 8;
  period?: number;
  issuer?: string;
  label?: string;
}

export type AuthenticatorAccount = {
  id: string;
  issuer: string;
  accountName: string;
  secret: string; // Base32 secret
  algorithm: Algorithm;
  digits: 6 | 8;
  period: number;
  groupId?: string;
  icon?: string;
  createdAt: number;
  updatedAt: number;
};

export type AccountGroup = {
  id: string;
  name: string;
  icon?: string;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
};
