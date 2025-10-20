import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { storage } from '../utils/storage';

export default function SettingsScreen() {
  const router = useRouter();
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const music = await storage.getMusicEnabled();
    const sfx = await storage.getSfxEnabled();
    setMusicEnabled(music);
    setSfxEnabled(sfx);
  };

  const handleMusicToggle = async (value: boolean) => {
    setMusicEnabled(value);
    await storage.setMusicEnabled(value);
  };

  const handleSfxToggle = async (value: boolean) => {
    setSfxEnabled(value);
    await storage.setSfxEnabled(value);
  };

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
    >
      <SafeAreaView style={styles.content}>
        <Text style={styles.title}>⚙️ Настройки</Text>

        <View style={styles.settingsContainer}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>🎵 Музыка</Text>
              <Text style={styles.settingDescription}>Фоновая музыка в игре</Text>
            </View>
            <Switch
              value={musicEnabled}
              onValueChange={handleMusicToggle}
              trackColor={{ false: '#767577', true: '#00d4ff' }}
              thumbColor={musicEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>🔊 Звуки</Text>
              <Text style={styles.settingDescription}>Звуковые эффекты</Text>
            </View>
            <Switch
              value={sfxEnabled}
              onValueChange={handleSfxToggle}
              trackColor={{ false: '#767577', true: '#00d4ff' }}
              thumbColor={sfxEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#00d4ff', '#0099cc']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Назад</Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
  settingsContainer: {
    flex: 1,
    gap: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#b8c6db',
  },
  button: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
