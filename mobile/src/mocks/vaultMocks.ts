import { AuthenticatorAccount } from '../types';

export const mockAccounts: AuthenticatorAccount[] = [
  {
    id: '1',
    issuer: 'Apple',
    accountName: 'steve@apple.com',
    secret: 'JBSWY3DPEHPK3PXP',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '2',
    issuer: 'Google',
    accountName: 'user@gmail.com',
    secret: 'JBSWY3DPEHPK3PXP',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '3',
    issuer: 'GitHub',
    accountName: 'octocat',
    secret: 'JBSWY3DPEHPK3PXP',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
];
