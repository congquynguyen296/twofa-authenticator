import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import CryptoJS from 'crypto-js';
import { Platform } from 'react-native';

const SECURE_STORE_KEY = 'VAULT_MASTER_KEY';
const DEVICE_ID_KEY = 'VAULT_DEVICE_ID';

/**
 * Service to handle device biometrics, secure storage, and AES encryption.
 */
export class SecurityService {
  private static masterKey: string | null = null;
  private static deviceId: string | null = null;

  /**
   * Initializes the security service by loading or creating the master key.
   */
  static async initialize(): Promise<void> {
    if (this.masterKey) return;

    if (Platform.OS === 'web') {
      // Graceful fallback for Web
      let key = localStorage.getItem(SECURE_STORE_KEY);
      if (!key) {
        key = this.generateRandomKey();
        localStorage.setItem(SECURE_STORE_KEY, key);
      }
      this.masterKey = key;

      let dId = localStorage.getItem(DEVICE_ID_KEY);
      if (!dId) {
        dId = `WEB-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        localStorage.setItem(DEVICE_ID_KEY, dId);
      }
      this.deviceId = dId;
    } else {
      // Native Secure Storage
      let key = await SecureStore.getItemAsync(SECURE_STORE_KEY);
      if (!key) {
        key = this.generateRandomKey();
        await SecureStore.setItemAsync(SECURE_STORE_KEY, key, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
        });
      }
      this.masterKey = key;

      let dId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
      if (!dId) {
        dId = `DEV-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        await SecureStore.setItemAsync(DEVICE_ID_KEY, dId, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
        });
      }
      this.deviceId = dId;
    }
  }

  /**
   * Retrieves the current device ID.
   */
  static getDeviceID(): string {
    if (!this.deviceId) throw new Error('SecurityService not initialized');
    return this.deviceId;
  }

  /**
   * Encrypts plaintext data using AES.
   */
  static encryptData(plainText: string): string {
    if (!this.masterKey) throw new Error('SecurityService not initialized');
    return CryptoJS.AES.encrypt(plainText, this.masterKey).toString();
  }

  /**
   * Decrypts AES ciphertext back to plaintext.
   */
  static decryptData(cipherText: string): string {
    if (!this.masterKey) throw new Error('SecurityService not initialized');
    const bytes = CryptoJS.AES.decrypt(cipherText, this.masterKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Triggers the biometric or passcode prompt to authenticate the user.
   */
  static async authenticateUser(): Promise<boolean> {
    if (Platform.OS === 'web') {
      // Skip auth on Web
      return true;
    }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      // Device doesn't support or isn't set up for biometric/PIN
      return true; 
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Vault',
      fallbackLabel: 'Use PIN',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    return result.success;
  }

  private static generateRandomKey(): string {
    // Generate a secure random 256-bit hex string for AES
    return CryptoJS.lib.WordArray.random(32).toString();
  }
}
