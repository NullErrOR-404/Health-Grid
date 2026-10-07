import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  MessageSquare,
  Camera,
  FolderLock,
  Siren,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react-native';
import ChatScreen from './src/screens/ChatScreen';
import LiveClinicScreen from './src/screens/LiveClinicScreen';
import RecordsHubScreen from './src/screens/RecordsHubScreen';
import EmergencyScreen from './src/screens/EmergencyScreen';
import { evaluateDeviceIntegrity, DeviceIntegrityReport } from './src/services/deviceIntegrityService';

type Tab = 'chat' | 'clinic' | 'records' | 'emergency';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [securityReport, setSecurityReport] = useState<DeviceIntegrityReport | null>(null);

  useEffect(() => {
    (async () => {
      const report = await evaluateDeviceIntegrity();
      setSecurityReport(report);
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.rootContainer}>
        {/* Main View Area */}
        <View style={styles.contentArea}>
          {activeTab === 'chat' && <ChatScreen onNavigate={(t) => setActiveTab(t as Tab)} />}
          {activeTab === 'clinic' && <LiveClinicScreen />}
          {activeTab === 'records' && <RecordsHubScreen />}
          {activeTab === 'emergency' && <EmergencyScreen />}
        </View>

        {/* Bottom Navigation Dock */}
        <View style={styles.navDock}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'chat' && styles.tabButtonActive]}
            onPress={() => setActiveTab('chat')}
          >
            <MessageSquare size={20} color={activeTab === 'chat' ? '#10B981' : '#64748B'} />
            <Text style={[styles.tabLabel, activeTab === 'chat' && styles.tabLabelActive]}>
              DocBot AI
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'clinic' && styles.tabButtonActive]}
            onPress={() => setActiveTab('clinic')}
          >
            <Camera size={20} color={activeTab === 'clinic' ? '#10B981' : '#64748B'} />
            <Text style={[styles.tabLabel, activeTab === 'clinic' && styles.tabLabelActive]}>
              Live Clinic
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'records' && styles.tabButtonActive]}
            onPress={() => setActiveTab('records')}
          >
            <FolderLock size={20} color={activeTab === 'records' ? '#10B981' : '#64748B'} />
            <Text style={[styles.tabLabel, activeTab === 'records' && styles.tabLabelActive]}>
              Records Hub
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'emergency' && styles.tabEmergencyActive]}
            onPress={() => setActiveTab('emergency')}
          >
            <Siren size={20} color={activeTab === 'emergency' ? '#EF4444' : '#64748B'} />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'emergency' && { color: '#EF4444', fontWeight: '700' },
              ]}
            >
              108 SOS
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  contentArea: {
    flex: 1,
  },
  navDock: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  tabEmergencyActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  tabLabel: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#10B981',
    fontWeight: '700',
  },
});
