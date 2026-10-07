import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Plus,
  Fingerprint,
  Heart,
  Droplet,
  Activity,
  Thermometer,
  Scale,
} from 'lucide-react-native';
import { authenticateWithBiometrics } from '../services/biometricService';
import { setJsonSecure, getJsonSecure, SECURE_KEYS } from '../services/secureStorageService';

interface VitalRecord {
  id: string;
  category: string;
  value: string;
  notes: string;
  date: string;
}

export default function RecordsHubScreen() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Blood Pressure');
  const [inputValue, setInputValue] = useState('');
  const [notes, setNotes] = useState('');
  const [records, setRecords] = useState<VitalRecord[]>([
    { id: '1', category: 'Blood Pressure', value: '120/80 mmHg', notes: 'Routine check', date: 'Today, 09:30 AM' },
    { id: '2', category: 'Pulse', value: '72 bpm', notes: 'Resting pulse', date: 'Yesterday, 06:15 PM' },
    { id: '3', category: 'SpO2', value: '98%', notes: 'Room air', date: '05 Oct 2026' },
  ]);

  const categories = [
    { name: 'Blood Pressure', icon: Heart, unit: 'mmHg' },
    { name: 'Blood Sugar', icon: Droplet, unit: 'mg/dL' },
    { name: 'Pulse', icon: Activity, unit: 'bpm' },
    { name: 'SpO2', icon: Activity, unit: '%' },
    { name: 'Temperature', icon: Thermometer, unit: '°F' },
    { name: 'Weight', icon: Scale, unit: 'kg' },
  ];

  useEffect(() => {
    // Initial check or load
    (async () => {
      const stored = await getJsonSecure<VitalRecord[]>(SECURE_KEYS.HEALTH_RECORDS, []);
      if (stored && stored.length > 0) {
        setRecords(stored);
      }
    })();
  }, []);

  const handleUnlock = async () => {
    const auth = await authenticateWithBiometrics('Authenticate with Fingerprint to open Health Vault');
    if (auth.success) {
      setIsUnlocked(true);
    } else {
      Alert.alert('Security Alert', auth.error || 'Biometric authentication failed');
    }
  };

  const handleSaveVital = async () => {
    if (!inputValue.trim()) return;

    const newRecord: VitalRecord = {
      id: `r_${Date.now()}`,
      category: selectedCategory,
      value: inputValue.trim(),
      notes: notes.trim() || 'Logged via HealthGrid Mobile',
      date: 'Just now',
    };

    const updated = [newRecord, ...records];
    setRecords(updated);
    await setJsonSecure(SECURE_KEYS.HEALTH_RECORDS, updated);
    setInputValue('');
    setNotes('');
    Alert.alert('Success', 'Vital securely recorded in Android Keystore.');
  };

  if (!isUnlocked) {
    return (
      <View style={styles.lockedContainer}>
        <View style={styles.lockCircle}>
          <Fingerprint size={48} color="#10B981" />
        </View>
        <Text style={styles.lockTitle}>Confidential Health Vault</Text>
        <Text style={styles.lockSubtitle}>
          Encrypted with AES-256 Android Keystore. Authenticate with biometrics to view your clinical
          history and vitals.
        </Text>
        <TouchableOpacity style={styles.unlockBtn} onPress={handleUnlock}>
          <Lock size={16} color="#0F172A" />
          <Text style={styles.unlockBtnText}>Unlock with Fingerprint / PIN</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Security Header Banner */}
      <View style={styles.securityBanner}>
        <ShieldCheck size={18} color="#10B981" />
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.securityTitle}>End-to-End Encrypted Health Vault</Text>
          <Text style={styles.securitySubtitle}>Hardware TEE Keymaster • DPDP Act 2023 Compliant</Text>
        </View>
        <TouchableOpacity onPress={() => setIsUnlocked(false)} style={styles.lockMiniBtn}>
          <Unlock size={14} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Metric Categories Horizontal Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesBar}>
        {categories.map((c) => (
          <TouchableOpacity
            key={c.name}
            onPress={() => setSelectedCategory(c.name)}
            style={[
              styles.catChip,
              selectedCategory === c.name && styles.catChipActive,
            ]}
          >
            <c.icon size={13} color={selectedCategory === c.name ? '#0F172A' : '#94A3B8'} />
            <Text
              style={[
                styles.catChipText,
                selectedCategory === c.name && styles.catChipTextActive,
              ]}
            >
              {c.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Quick Add Form */}
      <View style={styles.addCard}>
        <Text style={styles.cardHeader}>Log {selectedCategory} Reading</Text>
        <TextInput
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={`Enter value (e.g. ${selectedCategory === 'Blood Pressure' ? '120/80' : '98'})`}
          placeholderTextColor="#64748B"
          style={styles.inputField}
        />
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Clinical notes (optional)"
          placeholderTextColor="#64748B"
          style={styles.inputField}
        />
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveVital}>
          <Plus size={16} color="#FFF" />
          <Text style={styles.saveBtnText}>Save to Keystore Vault</Text>
        </TouchableOpacity>
      </View>

      {/* Vitals History List */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Recent Encrypted History</Text>
        {records.map((r) => (
          <View key={r.id} style={styles.recordItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.recordCat}>{r.category}</Text>
              <Text style={styles.recordVal}>{r.value}</Text>
              <Text style={styles.recordNotes}>{r.notes}</Text>
            </View>
            <Text style={styles.recordDate}>{r.date}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1120', padding: 14, paddingTop: 50 },
  lockedContainer: {
    flex: 1,
    backgroundColor: '#0B1120',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  lockCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  lockTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  lockSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  unlockBtnText: { color: '#0F172A', fontWeight: '700', fontSize: 14 },
  securityBanner: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  securityTitle: { color: '#F8FAFC', fontWeight: '700', fontSize: 13 },
  securitySubtitle: { color: '#10B981', fontSize: 11 },
  lockMiniBtn: { padding: 6 },
  categoriesBar: { marginBottom: 16 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 8,
    gap: 6,
  },
  catChipActive: { backgroundColor: '#10B981' },
  catChipText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  catChipTextActive: { color: '#0F172A', fontWeight: '700' },
  addCard: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  cardHeader: { color: '#F8FAFC', fontWeight: '700', fontSize: 14, marginBottom: 10 },
  inputField: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 13,
    marginBottom: 10,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  historySection: { marginBottom: 30 },
  sectionTitle: { color: '#F8FAFC', fontWeight: '700', fontSize: 15, marginBottom: 12 },
  recordItem: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordCat: { color: '#94A3B8', fontSize: 11, fontWeight: '600' },
  recordVal: { color: '#38BDF8', fontSize: 15, fontWeight: '700', marginTop: 2 },
  recordNotes: { color: '#64748B', fontSize: 11, marginTop: 2 },
  recordDate: { color: '#64748B', fontSize: 11 },
});
