import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  HIGH_SCORE: 'high_score',
  GAMES_PLAYED: 'games_played',
  MUSIC_ENABLED: 'music_enabled',
  SFX_ENABLED: 'sfx_enabled',
};

export const storage = {
  // High Score
  async getHighScore(): Promise<number> {
    const value = await AsyncStorage.getItem(KEYS.HIGH_SCORE);
    return value ? parseInt(value, 10) : 0;
  },
  async setHighScore(score: number): Promise<void> {
    await AsyncStorage.setItem(KEYS.HIGH_SCORE, score.toString());
  },

  // Games Played
  async getGamesPlayed(): Promise<number> {
    const value = await AsyncStorage.getItem(KEYS.GAMES_PLAYED);
    return value ? parseInt(value, 10) : 0;
  },
  async incrementGamesPlayed(): Promise<number> {
    const current = await this.getGamesPlayed();
    const newValue = current + 1;
    await AsyncStorage.setItem(KEYS.GAMES_PLAYED, newValue.toString());
    return newValue;
  },

  // Music
  async getMusicEnabled(): Promise<boolean> {
    const value = await AsyncStorage.getItem(KEYS.MUSIC_ENABLED);
    return value === null ? true : value === 'true';
  },
  async setMusicEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(KEYS.MUSIC_ENABLED, enabled.toString());
  },

  // SFX
  async getSfxEnabled(): Promise<boolean> {
    const value = await AsyncStorage.getItem(KEYS.SFX_ENABLED);
    return value === null ? true : value === 'true';
  },
  async setSfxEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(KEYS.SFX_ENABLED, enabled.toString());
  },
};
