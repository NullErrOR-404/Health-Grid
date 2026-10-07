import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import {
  Camera,
  FlipHorizontal,
  Mic,
  MicOff,
  PhoneOff,
  Sparkles,
  CheckCircle2,
  Circle,
  Database,
  Volume2,
} from 'lucide-react-native';
import { setJsonSecure, getJsonSecure, SECURE_KEYS } from '../services/secureStorageService';

interface ChecklistItem {
  id: string;
  label: string;
  confirmed: boolean;
}

interface TranscriptItem {
  id: string;
  speaker: 'Doctor' | 'Patient';
  text: string;
  time: string;
}

export default function LiveClinicScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: 'c1', label: 'Hold medicine strip steady in frame', confirmed: true },
    { id: 'c2', label: 'Clear lighting on affected skin area', confirmed: false },
    { id: 'c3', label: 'Confirm expiration date is visible', confirmed: false },
  ]);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([
    { id: 't1', speaker: 'Doctor', text: 'Live camera connected. Please hold the packaging close to the lens.', time: '00:12' },
  ]);

  useEffect(() => {
    // Load cached live transcripts from hardware Keystore
    (async () => {
      const cached = await getJsonSecure<TranscriptItem[]>(SECURE_KEYS.LIVE_TRANSCRIPT_CACHE, []);
      if (cached && cached.length > 0) {
        setTranscripts(cached);
      }
    })();
  }, []);

  const toggleCheck = async (id: string) => {
    const next = checklist.map((item) =>
      item.id === id ? { ...item, confirmed: !item.confirmed } : item
    );
    setChecklist(next);

    // Add dynamic turn to transcript and cache to hardware Keystore
    const updatedTranscripts: TranscriptItem[] = [
      ...transcripts,
      {
        id: `t_${Date.now()}`,
        speaker: 'Patient',
        text: `Confirmed checklist item: ${next.find((c) => c.id === id)?.label}`,
        time: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
      },
    ];
    setTranscripts(updatedTranscripts);
    await setJsonSecure(SECURE_KEYS.LIVE_TRANSCRIPT_CACHE, updatedTranscripts);
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Initializing Live Clinic hardware...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.permissionIconCircle}>
          <Camera size={36} color="#10B981" />
        </View>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionDesc}>
          HealthGrid AI Live Clinic requires camera access for real-time visual inspection of
          medicines, prescriptions, and symptoms.
        </Text>
        <TouchableOpacity style={styles.grantButton} onPress={requestPermission}>
          <Text style={styles.grantButtonText}>Enable Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Real Full-Bleed Native Camera Feed (Zero Doctor PIP Image) */}
      <CameraView style={styles.camera} facing={facing}>
        {/* Top Floating HUD */}
        <View style={styles.topHud}>
          <View style={styles.recBadge}>
            <View style={styles.recDot} />
            <Text style={styles.recText}>LIVE CLINIC • 08:24</Text>
          </View>
          <View style={styles.deviceCacheBadge}>
            <Database size={11} color="#38BDF8" />
            <Text style={styles.deviceCacheText}>Keystore Encrypted</Text>
          </View>
        </View>

        {/* Subtle Floating AI Voice Equalizer Indicator (renders only when speaking) */}
        {isSpeaking && (
          <View style={styles.speakerIndicator}>
            <Volume2 size={13} color="#10B981" />
            <Text style={styles.speakerText}>DocBot Speaking</Text>
            <View style={styles.eqWave}>
              <View style={[styles.eqBar, { height: 6 }]} />
              <View style={[styles.eqBar, { height: 12 }]} />
              <View style={[styles.eqBar, { height: 8 }]} />
              <View style={[styles.eqBar, { height: 14 }]} />
            </View>
          </View>
        )}

        {/* Bottom Drawer Overlay */}
        <View style={styles.bottomSheet}>
          {/* Dynamic Clinical Checklist */}
          <View style={styles.checklistCard}>
            <View style={styles.checklistHeader}>
              <Sparkles size={14} color="#10B981" />
              <Text style={styles.checklistTitle}>AI Vision Inspection</Text>
            </View>
            {checklist.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => toggleCheck(item.id)}
                style={styles.checkItem}
              >
                {item.confirmed ? (
                  <CheckCircle2 size={16} color="#10B981" />
                ) : (
                  <Circle size={16} color="#64748B" />
                )}
                <Text
                  style={[
                    styles.checkLabel,
                    item.confirmed && { color: '#E2E8F0', textDecorationLine: 'line-through' },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Call Controls Capsule */}
          <View style={styles.controlsRow}>
            <TouchableOpacity
              onPress={() => setIsMuted(!isMuted)}
              style={[styles.controlBtn, isMuted && { backgroundColor: '#7F1D1D' }]}
            >
              {isMuted ? <MicOff size={20} color="#FFF" /> : <Mic size={20} color="#FFF" />}
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleCameraFacing} style={styles.controlBtn}>
              <FlipHorizontal size={20} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsSpeaking(!isSpeaking)}
              style={styles.endCallBtn}
            >
              <PhoneOff size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1120' },
  camera: { flex: 1, justifyContent: 'space-between' },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0B1120',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: { color: '#94A3B8', marginTop: 12, fontSize: 14 },
  permissionIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  permissionTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  permissionDesc: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  grantButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  grantButtonText: { color: '#0F172A', fontWeight: '700', fontSize: 14 },
  topHud: {
    paddingTop: 54,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  recDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#EF4444', marginRight: 6 },
  recText: { color: '#F8FAFC', fontSize: 11, fontWeight: '700' },
  deviceCacheBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  deviceCacheText: { color: '#38BDF8', fontSize: 10, fontWeight: '600' },
  speakerIndicator: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    gap: 6,
  },
  speakerText: { color: '#10B981', fontSize: 11, fontWeight: '700' },
  eqWave: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  eqBar: { width: 2.5, backgroundColor: '#10B981', borderRadius: 1 },
  bottomSheet: { paddingHorizontal: 16, paddingBottom: 24 },
  checklistCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  checklistHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  checklistTitle: { color: '#F8FAFC', fontSize: 12, fontWeight: '700' },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  checkLabel: { color: '#94A3B8', fontSize: 12 },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  controlBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endCallBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
