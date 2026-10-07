import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import {
  Siren,
  PhoneCall,
  MapPin,
  Compass,
  Building2,
  Bed,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react-native';

export default function EmergencyScreen() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState<string>('Locating nearest landmark...');
  const [isLocating, setIsLocating] = useState(true);

  const nearbyCasualties = [
    {
      name: 'Rajiv Gandhi Government General Hospital (RGGGH)',
      distance: '2.4 km',
      eta: '6 mins',
      emergencyBeds: 14,
      icuBeds: 3,
      status: 'Open 24/7 • Trauma Center',
    },
    {
      name: 'Government Multi Super Speciality Hospital (Omandurar)',
      distance: '3.8 km',
      eta: '9 mins',
      emergencyBeds: 8,
      icuBeds: 2,
      status: 'Open 24/7 • Cardiac Ready',
    },
    {
      name: 'Government Kilpauk Medical College Hospital',
      distance: '5.1 km',
      eta: '14 mins',
      emergencyBeds: 19,
      icuBeds: 5,
      status: 'Open 24/7 • Burns & Trauma',
    },
  ];

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setAddress('Location permission denied. Please share manually on 108 call.');
          setIsLocating(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        const rev = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        if (rev && rev.length > 0) {
          const r = rev[0];
          setAddress(`${r.name || r.street || ''}, ${r.district || r.city || ''}, ${r.postalCode || ''}`);
        } else {
          setAddress(`GPS: ${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
        }
      } catch (err) {
        console.warn('GPS location error:', err);
        setAddress('GPS location unavailable. Dispatch coordinates pending.');
      } finally {
        setIsLocating(false);
      }
    })();
  }, []);

  const handleCall108 = () => {
    Linking.openURL('tel:108').catch(() => {
      Alert.alert('Calling Emergency', 'Dial 108 directly on your keypad.');
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* High-Alert Emergency Banner */}
      <View style={styles.alertBanner}>
        <View style={styles.sirenCircle}>
          <Siren size={32} color="#EF4444" />
        </View>
        <Text style={styles.alertTitle}>108 EMERGENCY CASUALTY DISPATCH</Text>
        <Text style={styles.alertSubtitle}>
          Immediate medical assistance, trauma telemetry, and priority hospital admission.
        </Text>

        <TouchableOpacity style={styles.call108Button} onPress={handleCall108}>
          <PhoneCall size={22} color="#FFFFFF" />
          <Text style={styles.call108Text}>CALL 108 AMBULANCE NOW</Text>
        </TouchableOpacity>
      </View>

      {/* Real GPS Location Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MapPin size={16} color="#38BDF8" />
          <Text style={styles.cardTitle}>Your Live Dispatch Location</Text>
        </View>
        {isLocating ? (
          <View style={styles.locatingRow}>
            <ActivityIndicator size="small" color="#38BDF8" />
            <Text style={styles.locatingText}>Locking high-precision GPS satellite fix...</Text>
          </View>
        ) : (
          <View>
            <Text style={styles.addressText}>{address}</Text>
            {location && (
              <Text style={styles.coordsText}>
                Coordinates: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Nearest 24/7 Casualty Centers */}
      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Nearby Government Casualty Centers</Text>
        {nearbyCasualties.map((h, i) => (
          <View key={i} style={styles.hospitalCard}>
            <View style={styles.hospitalHeader}>
              <Building2 size={16} color="#10B981" />
              <Text style={styles.hospitalName} numberOfLines={1}>
                {h.name}
              </Text>
            </View>
            <Text style={styles.hospitalStatus}>{h.status}</Text>
            <View style={styles.hospitalMetrics}>
              <View style={styles.metricItem}>
                <Compass size={12} color="#94A3B8" />
                <Text style={styles.metricLabel}>{h.distance} • {h.eta}</Text>
              </View>
              <View style={styles.metricItem}>
                <Bed size={12} color="#10B981" />
                <Text style={styles.bedLabel}>{h.emergencyBeds} ER Beds Available</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1120', padding: 14, paddingTop: 50 },
  alertBanner: {
    backgroundColor: '#1E1218',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  sirenCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  alertTitle: { color: '#F87171', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  alertSubtitle: {
    color: '#CBD5E1',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  call108Button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 10,
  },
  call108Text: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  card: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  cardTitle: { color: '#F8FAFC', fontWeight: '700', fontSize: 13 },
  locatingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  locatingText: { color: '#94A3B8', fontSize: 12 },
  addressText: { color: '#E2E8F0', fontSize: 13, fontWeight: '600', lineHeight: 18 },
  coordsText: { color: '#64748B', fontSize: 11, marginTop: 4 },
  section: { marginBottom: 30 },
  sectionHeading: { color: '#F8FAFC', fontWeight: '700', fontSize: 15, marginBottom: 12 },
  hospitalCard: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  hospitalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  hospitalName: { color: '#F8FAFC', fontWeight: '700', fontSize: 13, flex: 1 },
  hospitalStatus: { color: '#94A3B8', fontSize: 11, marginBottom: 10 },
  hospitalMetrics: { flexDirection: 'row', justifyContent: 'space-between' },
  metricItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metricLabel: { color: '#94A3B8', fontSize: 11 },
  bedLabel: { color: '#10B981', fontSize: 11, fontWeight: '600' },
});
