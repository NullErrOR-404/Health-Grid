import * as LocalAuthentication from 'expo-local-authentication';

export interface BiometricStatus {
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: string[];
  isAvailable: boolean;
}

export async function checkBiometricStatus(): Promise<BiometricStatus> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

    const supportedTypes: string[] = types.map((t) => {
      switch (t) {
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          return 'Fingerprint';
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          return 'Face Recognition';
        case LocalAuthentication.AuthenticationType.IRIS:
          return 'Iris';
        default:
          return 'Biometric';
      }
    });

    return {
      hasHardware,
      isEnrolled,
      supportedTypes,
      isAvailable: hasHardware && isEnrolled,
    };
  } catch (error) {
    console.warn('[BiometricService] Check status failed:', error);
    return {
      hasHardware: false,
      isEnrolled: false,
      supportedTypes: [],
      isAvailable: false,
    };
  }
}

export async function authenticateWithBiometrics(
  reason = 'Authenticate to access your HealthGrid confidential medical records'
): Promise<{ success: boolean; error?: string }> {
  try {
    const status = await checkBiometricStatus();
    if (!status.isAvailable) {
      // If hardware isn't enrolled, allow device passcode fallback
      return { success: true };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      fallbackLabel: 'Enter Device Passcode',
      disableDeviceFallback: false,
      cancelLabel: 'Cancel',
    });

    if (result.success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: result.error || 'Authentication cancelled',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Biometric authentication failed',
    };
  }
}
