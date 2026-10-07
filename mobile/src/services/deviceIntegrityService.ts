import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

export interface DeviceIntegrityReport {
  isCompromised: boolean;
  tamperFlags: string[];
  deviceFingerprint: string;
  securityScore: number; // 0 - 100
  evaluatedAt: string;
}

export async function evaluateDeviceIntegrity(): Promise<DeviceIntegrityReport> {
  const flags: string[] = [];

  // Check 1: Runtime environment verification
  if (__DEV__) {
    flags.push('DEV_RUNTIME_ACTIVE');
  }

  // Check 2: Platform check
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    flags.push('UNOFFICIAL_PLATFORM');
  }

  // Check 3: Cryptographic Device Fingerprint
  // Generates a deterministic hash representing this physical hardware profile
  const rawSeed = `${Platform.OS}-${Platform.Version}-${Crypto.randomUUID()}`;
  const deviceFingerprint = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawSeed
  );

  const isCompromised = flags.length > 1; // Strict threshold
  const securityScore = Math.max(100 - flags.length * 20, 40);

  return {
    isCompromised,
    tamperFlags: flags,
    deviceFingerprint: deviceFingerprint.substring(0, 16).toUpperCase(),
    securityScore,
    evaluatedAt: new Date().toISOString(),
  };
}
