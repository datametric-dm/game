import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { storage } from '../utils/storage';
import { adsManager } from '../utils/adsManager';

export default function MainMenu() {
  const router = useRouter();
  const [highScore, setHighScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await adsManager.initialize();
      const score = await storage.getHighScore();
      setHighScore(score);
    } catch (error) {
      console.error('Initialize error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayGame = async () => {
    const gamesPlayed = await storage.incrementGamesPlayed();
    // Показываем interstitial каждые 3 игры
    if (gamesPlayed % 3 === 0) {
      await adsManager.showInterstitial();
    }
    router.push('/game');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
    >
      <SafeAreaView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>🎮 Dodge Rush</Text>
          <Text style={styles.subtitle}>Уклоняйся от блоков!</Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Лучший рекорд</Text>
          <Text style={styles.scoreValue}>{highScore}</Text>
        </View>

        <View style={styles.menuButtons}>
          <TouchableOpacity
            style={styles.button}
            onPress={handlePlayGame}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#00d4ff', '#0099cc']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Играть</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/records')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ff6b6b', '#c44569']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Рекорды</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/settings')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4cd137', '#2ecc71']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Настройки</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>© 2025 Dodge Rush</Text>
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
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#b8c6db',
    letterSpacing: 1,
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#b8c6db',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#00d4ff',
  },
  menuButtons: {
    gap: 16,
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
    letterSpacing: 1,
  },
  footer: {
    textAlign: 'center',
    color: '#7f8fa6',
    fontSize: 14,
  },
});
