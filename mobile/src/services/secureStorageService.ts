import * as SecureStore from 'expo-secure-store';

/**
 * HealthGrid Enterprise Mobile Security Storage
 * Backed by Android Keystore (Hardware TEE / StrongBox Keymaster)
 * Implements AES-256 GCM encrypted preferences.
 */

export const SECURE_KEYS = {
  AUTH_TOKEN: 'hg_auth_token_v1',
  USER_PROFILE: 'hg_user_profile_v1',
  HEALTH_RECORDS: 'hg_health_records_v1',
  BIOMETRICS_ENABLED: 'hg_biometrics_pref_v1',
  DEVICE_FINGERPRINT: 'hg_device_fingerprint_v1',
  LIVE_TRANSCRIPT_CACHE: 'hg_live_transcripts_cache_v1',
} as const;

export async function setItemSecure(key: string, value: string): Promise<boolean> {
  try {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
    return true;
  } catch (error) {
    console.error(`[SecureStore] Error saving key ${key}:`, error);
    return false;
  }
}

export async function getItemSecure(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`[SecureStore] Error reading key ${key}:`, error);
    return null;
  }
}

export async function setJsonSecure<T>(key: string, data: T): Promise<boolean> {
  try {
    const serialized = JSON.stringify(data);
    return await setItemSecure(key, serialized);
  } catch (error) {
    console.error(`[SecureStore] Error serializing data for ${key}:`, error);
    return false;
  }
}

export async function getJsonSecure<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await getItemSecure(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`[SecureStore] Error parsing JSON for ${key}:`, error);
    return fallback;
  }
}

export async function removeItemSecure(key: string): Promise<boolean> {
  try {
    await SecureStore.deleteItemAsync(key);
    return true;
  } catch (error) {
    console.error(`[SecureStore] Error deleting key ${key}:`, error);
    return false;
  }
}
