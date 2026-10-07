import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Send, Volume2, ShieldCheck, HeartPulse, Sparkles, AlertCircle } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { askDocBot, MobileChatMessage } from '../services/mobileAiService';
import { setJsonSecure, getJsonSecure, SECURE_KEYS } from '../services/secureStorageService';

export default function ChatScreen({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [messages, setMessages] = useState<MobileChatMessage[]>([
    {
      id: 'm1',
      sender: 'doctor',
      text: 'Vanakkam! I am DocBot, your 24/7 AI Family Doctor. How are you feeling today?',
      timestamp: 'Just now',
      options: ['Check Symptoms', 'Headache & Fever', 'Chest Discomfort', 'Skin Rash'],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVitalsOpen, setIsVitalsOpen] = useState(false);
  const [vitals, setVitals] = useState({ bp: '120/80', pulse: '72', spo2: '98' });
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Load cached consultation if available
    (async () => {
      const cached = await getJsonSecure<MobileChatMessage[] | null>('hg_last_chat_messages', null);
      if (cached && cached.length > 0) {
        setMessages(cached);
      }
    })();
  }, []);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: MobileChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: 'Just now',
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    if (!customText) setInput('');
    setIsLoading(true);

    try {
      const response = await askDocBot(textToSend, nextMessages);
      const doctorMsg: MobileChatMessage = {
        id: `d_${Date.now()}`,
        sender: 'doctor',
        text: response.text,
        timestamp: 'Just now',
        options: response.options,
        isEmergency: response.isEmergency,
      };

      const updated = [...nextMessages, doctorMsg];
      setMessages(updated);
      await setJsonSecure('hg_last_chat_messages', updated);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text: string) => {
    Speech.stop();
    Speech.speak(text, {
      language: 'en-IN',
      pitch: 1.0,
      rate: 1.05,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#0B1120' }}
    >
      {/* Top Mobile Clinical HUD */}
      <View
        style={{
          paddingTop: 50,
          paddingHorizontal: 16,
          paddingBottom: 12,
          backgroundColor: '#0F172A',
          borderBottomWidth: 1,
          borderBottomColor: '#1E293B',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: '#065F46',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
            }}
          >
            <Sparkles size={20} color="#10B981" />
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#F8FAFC', fontWeight: '700', fontSize: 16 }}>DocBot AI</Text>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#10B981',
                  marginLeft: 8,
                }}
              />
            </View>
            <Text style={{ color: '#94A3B8', fontSize: 11 }}>24/7 Clinical Triage • DPDP Secured</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setIsVitalsOpen(!isVitalsOpen)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isVitalsOpen ? '#065F46' : '#1E293B',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 16,
          }}
        >
          <HeartPulse size={14} color="#10B981" />
          <Text style={{ color: '#E2E8F0', fontSize: 12, marginLeft: 4, fontWeight: '600' }}>
            Vitals
          </Text>
        </TouchableOpacity>
      </View>

      {/* Expandable Vitals Bar */}
      {isVitalsOpen && (
        <View
          style={{
            backgroundColor: '#1E293B',
            padding: 12,
            borderBottomWidth: 1,
            borderBottomColor: '#334155',
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#94A3B8', fontSize: 10, textTransform: 'uppercase' }}>BP</Text>
            <Text style={{ color: '#F8FAFC', fontSize: 13, fontWeight: '700' }}>{vitals.bp}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#94A3B8', fontSize: 10, textTransform: 'uppercase' }}>Pulse</Text>
            <Text style={{ color: '#38BDF8', fontSize: 13, fontWeight: '700' }}>
              {vitals.pulse} bpm
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#94A3B8', fontSize: 10, textTransform: 'uppercase' }}>SpO2</Text>
            <Text style={{ color: '#10B981', fontSize: 13, fontWeight: '700' }}>{vitals.spo2}%</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleSend(`My vitals are BP: ${vitals.bp}, Pulse: ${vitals.pulse}, SpO2: ${vitals.spo2}%`)}
            style={{
              backgroundColor: '#0F766E',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '600' }}>Share</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Chat Messages Feed */}
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        style={{ flex: 1, padding: 14 }}
      >
        {messages.map((item) => (
          <View
            key={item.id}
            style={{
              marginBottom: 16,
              alignItems: item.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <View
              style={{
                maxWidth: '85%',
                backgroundColor:
                  item.sender === 'user'
                    ? '#047857'
                    : item.isEmergency
                    ? '#7F1D1D'
                    : '#1E293B',
                borderRadius: 18,
                padding: 14,
                borderBottomRightRadius: item.sender === 'user' ? 4 : 18,
                borderBottomLeftRadius: item.sender === 'doctor' ? 4 : 18,
                borderWidth: 1,
                borderColor: item.isEmergency ? '#EF4444' : 'transparent',
              }}
            >
              {item.isEmergency && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <AlertCircle size={16} color="#F87171" />
                  <Text style={{ color: '#FCA5A5', fontWeight: '700', fontSize: 12, marginLeft: 4 }}>
                    Emergency Flag Detected
                  </Text>
                </View>
              )}

              <Text style={{ color: '#F8FAFC', fontSize: 14, lineHeight: 21 }}>{item.text}</Text>

              {item.sender === 'doctor' && (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 8,
                    paddingTop: 6,
                    borderTopWidth: 1,
                    borderTopColor: 'rgba(255,255,255,0.08)',
                  }}
                >
                  <Text style={{ color: '#64748B', fontSize: 10 }}>{item.timestamp}</Text>
                  <TouchableOpacity
                    onPress={() => speakText(item.text)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Volume2 size={15} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Interactive Options Pills */}
            {item.options && item.options.length > 0 && (
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  marginTop: 8,
                  gap: 6,
                  maxWidth: '90%',
                }}
              >
                {item.options.map((opt, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleSend(opt)}
                    style={{
                      backgroundColor: '#0F172A',
                      borderWidth: 1,
                      borderColor: '#334155',
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      borderRadius: 14,
                    }}
                  >
                    <Text style={{ color: '#38BDF8', fontSize: 12, fontWeight: '500' }}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        {isLoading && (
          <View
            style={{
              backgroundColor: '#1E293B',
              padding: 12,
              borderRadius: 16,
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <ActivityIndicator size="small" color="#10B981" />
            <Text style={{ color: '#94A3B8', fontSize: 12, marginLeft: 8 }}>
              DocBot is analyzing your clinical response...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Input Capsule Bar */}
      <View
        style={{
          paddingHorizontal: 14,
          paddingVertical: 10,
          backgroundColor: '#0F172A',
          borderTopWidth: 1,
          borderTopColor: '#1E293B',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Describe your symptoms (e.g. fever for 2 days)..."
          placeholderTextColor="#64748B"
          style={{
            flex: 1,
            backgroundColor: '#1E293B',
            color: '#F8FAFC',
            borderRadius: 24,
            paddingHorizontal: 16,
            paddingVertical: 10,
            fontSize: 14,
            marginRight: 10,
          }}
          onSubmitEditing={() => handleSend()}
        />
        <TouchableOpacity
          onPress={() => handleSend()}
          disabled={!input.trim() || isLoading}
          style={{
            backgroundColor: input.trim() ? '#10B981' : '#334155',
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Send size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
