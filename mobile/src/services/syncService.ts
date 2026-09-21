import { SecurityService } from './securityService';

// Fallback to localhost for dev testing
const API_BASE_URL = 'http://localhost:8080/api';

export const SyncService = {
  /**
   * Pushes the encrypted vault payload to the cloud
   */
  async pushVault(encryptedData: string): Promise<void> {
    const deviceId = SecurityService.getDeviceID();
    
    const response = await fetch(`${API_BASE_URL}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-ID': deviceId,
      },
      body: JSON.stringify({ data: encryptedData }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to sync to cloud');
    }
  },

  /**
   * Pulls the encrypted vault payload from the cloud
   */
  async pullVault(customDeviceId?: string): Promise<string> {
    const deviceId = customDeviceId || SecurityService.getDeviceID();
    
    const response = await fetch(`${API_BASE_URL}/sync`, {
      method: 'GET',
      headers: {
        'X-Device-ID': deviceId,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to pull from cloud');
    }

    const json = await response.json();
    return json.data;
  },
};
