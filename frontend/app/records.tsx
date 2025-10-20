import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { storage } from '../utils/storage';

export default function RecordsScreen() {
  const router = useRouter();
  const [highScore, setHighScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const score = await storage.getHighScore();
    const games = await storage.getGamesPlayed();
    setHighScore(score);
    setGamesPlayed(games);
  };

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
    >
      <SafeAreaView style={styles.content}>
        <Text style={styles.title}>🏆 Рекорды</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Лучший счет</Text>
            <Text style={styles.statValue}>{highScore}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Игр сыграно</Text>
            <Text style={styles.statValue}>{gamesPlayed}</Text>
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
  statsContainer: {
    flex: 1,
    gap: 24,
    marginBottom: 40,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.3)',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 18,
    color: '#b8c6db',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00d4ff',
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
