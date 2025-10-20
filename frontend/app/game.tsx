import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Animated,
  PanResponder,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { storage } from '../utils/storage';
import { adsManager } from '../utils/adsManager';
import type { Block, GameState } from '../types/game';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GAME_WIDTH = SCREEN_WIDTH;
const GAME_HEIGHT = SCREEN_HEIGHT - 160; // Вычитаем место для UI
const PLAYER_SIZE = 40;
const MIN_BLOCK_SIZE = 36;
const MAX_BLOCK_SIZE = 64;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 2;
const SCORE_PER_SECOND = 10;
const SPAWN_INTERVAL = 1000; // 1 секунда
const INVINCIBILITY_DURATION = 5000; // 5 секунд

export default function GameScreen() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    score: 0,
    blocks: [],
    player: {
      position: { x: GAME_WIDTH / 2 - PLAYER_SIZE / 2, y: GAME_HEIGHT - 120 },
      size: { width: PLAYER_SIZE, height: PLAYER_SIZE },
      invincible: false,
    },
    speed: INITIAL_SPEED,
    hasExtraLife: true,
  });

  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  
  const gameLoopRef = useRef<NodeJS.Timeout>();
  const spawnTimerRef = useRef<NodeJS.Timeout>();
  const scoreTimerRef = useRef<NodeJS.Timeout>();
  const invincibilityTimerRef = useRef<NodeJS.Timeout>();
  const lastUpdateRef = useRef(Date.now());
  const playerOpacity = useRef(new Animated.Value(1)).current;

  // PanResponder для управления игроком
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        if (!gameState.isPlaying && !gameState.isPaused) {
          startGame();
        }
      },
      onPanResponderMove: (_, gestureState) => {
        if (!gameState.isPlaying || gameState.isPaused) return;
        
        setGameState((prev) => {
          const newX = Math.max(
            0,
            Math.min(
              GAME_WIDTH - PLAYER_SIZE,
              prev.player.position.x + gestureState.dx
            )
          );
          const newY = Math.max(
            60,
            Math.min(
              GAME_HEIGHT - PLAYER_SIZE - 20,
              prev.player.position.y + gestureState.dy
            )
          );
          return {
            ...prev,
            player: {
              ...prev.player,
              position: { x: newX, y: newY },
            },
          };
        });
      },
    })
  ).current;

  // Запуск игры
  const startGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      score: 0,
      blocks: [],
      speed: INITIAL_SPEED,
      hasExtraLife: true,
      player: {
        ...prev.player,
        position: { x: GAME_WIDTH / 2 - PLAYER_SIZE / 2, y: GAME_HEIGHT - 120 },
        invincible: false,
      },
    }));
    
    lastUpdateRef.current = Date.now();
    startGameLoop();
    startSpawnTimer();
    startScoreTimer();
  }, []);

  // Игровой цикл
  const startGameLoop = () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    
    gameLoopRef.current = setInterval(() => {
      setGameState((prev) => {
        if (!prev.isPlaying || prev.isPaused) return prev;

        const now = Date.now();
        const dt = (now - lastUpdateRef.current) / 1000;
        lastUpdateRef.current = now;

        // Обновляем скорость
        const newSpeed = prev.speed + SPEED_INCREMENT * dt;

        // Обновляем позиции блоков
        const updatedBlocks: Block[] = [];
        let collision = false;

        for (const block of prev.blocks) {
          const newY = block.position.y + newSpeed * dt;
          
          if (newY > GAME_HEIGHT + block.size.height) {
            // Блок вышел за пределы экрана
            continue;
          }

          const updatedBlock = {
            ...block,
            position: { ...block.position, y: newY },
          };

          // Проверка столкновения
          if (!prev.player.invincible && checkCollision(prev.player, updatedBlock)) {
            collision = true;
            break;
          }

          updatedBlocks.push(updatedBlock);
        }

        if (collision) {
          handleCollision();
          return prev;
        }

        return {
          ...prev,
          blocks: updatedBlocks,
          speed: newSpeed,
        };
      });
    }, 16); // ~60 FPS
  };

  // Таймер создания блоков
  const startSpawnTimer = () => {
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    
    spawnTimerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (!prev.isPlaying || prev.isPaused) return prev;
        
        const size = MIN_BLOCK_SIZE + Math.random() * (MAX_BLOCK_SIZE - MIN_BLOCK_SIZE);
        const x = Math.random() * (GAME_WIDTH - size);
        
        const newBlock: Block = {
          id: Date.now().toString() + Math.random(),
          position: { x, y: -size },
          size: { width: size, height: size },
          speed: prev.speed,
        };

        return {
          ...prev,
          blocks: [...prev.blocks, newBlock],
        };
      });
    }, SPAWN_INTERVAL);
  };

  // Таймер начисления очков
  const startScoreTimer = () => {
    if (scoreTimerRef.current) clearInterval(scoreTimerRef.current);
    
    scoreTimerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (!prev.isPlaying || prev.isPaused) return prev;
        return {
          ...prev,
          score: prev.score + Math.floor(SCORE_PER_SECOND / 10),
        };
      });
    }, 100);
  };

  // Проверка столкновения
  const checkCollision = (player: GameState['player'], block: Block): boolean => {
    return (
      player.position.x < block.position.x + block.size.width &&
      player.position.x + player.size.width > block.position.x &&
      player.position.y < block.position.y + block.size.height &&
      player.position.y + player.size.height > block.position.y
    );
  };

  // Обработка столкновения
  const handleCollision = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    stopGame();
    setShowGameOverModal(true);
  };

  // Остановка игры
  const stopGame = () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    if (scoreTimerRef.current) clearInterval(scoreTimerRef.current);
    
    setGameState((prev) => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
    }));
  };

  // Пауза
  const handlePause = () => {
    setGameState((prev) => ({ ...prev, isPaused: true }));
    setShowPauseModal(true);
  };

  // Возобновление
  const handleResume = () => {
    setShowPauseModal(false);
    setGameState((prev) => ({ ...prev, isPaused: false }));
    lastUpdateRef.current = Date.now();
  };

  // Продолжить после рекламы
  const handleContinueWithAd = async () => {
    const success = await adsManager.showRewarded(() => {
      // Награда получена
      setShowGameOverModal(false);
      continueGameAfterReward();
    });

    if (!success) {
      Alert.alert('Ошибка', 'Реклама недоступна');
    }
  };

  // Продолжение игры после просмотра рекламы
  const continueGameAfterReward = () => {
    setGameState((prev) => {
      // Отодвигаем все блоки от игрока
      const clearedBlocks = prev.blocks.map((block) => ({
        ...block,
        position: {
          ...block.position,
          y: Math.min(block.position.y, prev.player.position.y - 150),
        },
      }));

      return {
        ...prev,
        isPlaying: true,
        isPaused: false,
        hasExtraLife: false,
        blocks: clearedBlocks,
        player: {
          ...prev.player,
          invincible: true,
        },
      };
    });

    // Эффект мерцания неуязвимости
    Animated.loop(
      Animated.sequence([
        Animated.timing(playerOpacity, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(playerOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      { iterations: Math.floor(INVINCIBILITY_DURATION / 400) }
    ).start();

    // Убираем неуязвимость через 5 секунд
    if (invincibilityTimerRef.current) clearTimeout(invincibilityTimerRef.current);
    invincibilityTimerRef.current = setTimeout(() => {
      setGameState((prev) => ({
        ...prev,
        player: { ...prev.player, invincible: false },
      }));
      playerOpacity.setValue(1);
    }, INVINCIBILITY_DURATION);

    lastUpdateRef.current = Date.now();
  };

  // Завершение игры
  const handleGameOver = async () => {
    const currentScore = gameState.score;
    const highScore = await storage.getHighScore();
    
    if (currentScore > highScore) {
      await storage.setHighScore(currentScore);
    }

    setShowGameOverModal(false);
    router.back();
  };

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      if (scoreTimerRef.current) clearInterval(scoreTimerRef.current);
      if (invincibilityTimerRef.current) clearTimeout(invincibilityTimerRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Dodge Rush</Text>
            <Text style={styles.score}>{gameState.score}</Text>
            <TouchableOpacity
              style={styles.pauseButton}
              onPress={handlePause}
              disabled={!gameState.isPlaying}
            >
              <Text style={styles.pauseButtonText}>⏸</Text>
            </TouchableOpacity>
          </View>

          {/* Game Area */}
          <View
            style={styles.gameArea}
            {...panResponder.panHandlers}
          >
            {/* Блоки */}
            {gameState.blocks.map((block) => (
              <View
                key={block.id}
                style={[
                  styles.block,
                  {
                    left: block.position.x,
                    top: block.position.y,
                    width: block.size.width,
                    height: block.size.height,
                  },
                ]}
              />
            ))}

            {/* Игрок */}
            <Animated.View
              style={[
                styles.player,
                {
                  left: gameState.player.position.x,
                  top: gameState.player.position.y,
                  width: gameState.player.size.width,
                  height: gameState.player.size.height,
                  opacity: playerOpacity,
                },
              ]}
            />

            {/* Подсказка в начале */}
            {!gameState.isPlaying && !showGameOverModal && (
              <View style={styles.startHint}>
                <Text style={styles.startHintText}>Коснитесь и перемещайте</Text>
                <Text style={styles.startHintText}>палец для управления!</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Пауза */}
      <Modal visible={showPauseModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⏸ Пауза</Text>
            
            <TouchableOpacity style={styles.modalButton} onPress={handleResume}>
              <LinearGradient colors={['#00d4ff', '#0099cc']} style={styles.modalButtonGradient}>
                <Text style={styles.modalButtonText}>Продолжить</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowPauseModal(false);
                stopGame();
                router.back();
              }}
            >
              <LinearGradient colors={['#ff6b6b', '#c44569']} style={styles.modalButtonGradient}>
                <Text style={styles.modalButtonText}>Выйти</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Game Over */}
      <Modal visible={showGameOverModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>💥 Game Over</Text>
            <Text style={styles.modalScore}>Счет: {gameState.score}</Text>

            {gameState.hasExtraLife && (
              <TouchableOpacity style={styles.modalButton} onPress={handleContinueWithAd}>
                <LinearGradient colors={['#ffa502', '#ff6348']} style={styles.modalButtonGradient}>
                  <Text style={styles.modalButtonText}>📺 Смотреть рекламу</Text>
                  <Text style={styles.modalButtonSubtext}>и продолжить игру</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.modalButton} onPress={handleGameOver}>
              <LinearGradient colors={['#00d4ff', '#0099cc']} style={styles.modalButtonGradient}>
                <Text style={styles.modalButtonText}>Завершить</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00d4ff',
  },
  pauseButton: {
    padding: 8,
  },
  pauseButtonText: {
    fontSize: 24,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  block: {
    position: 'absolute',
    backgroundColor: '#ff3838',
    borderRadius: 4,
    boxShadow: '0 0 20px rgba(255, 56, 56, 0.8)',
  },
  player: {
    position: 'absolute',
    backgroundColor: '#00ff88',
    borderRadius: 8,
    boxShadow: '0 0 25px rgba(0, 255, 136, 1)',
  },
  startHint: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  startHintText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#00d4ff',
  },
  modalTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalScore: {
    fontSize: 24,
    color: '#00d4ff',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalButtonSubtext: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
    opacity: 0.9,
  },
});
