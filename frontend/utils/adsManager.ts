// Yandex Mobile Ads Manager
// Примечание: Для полной интеграции Yandex Mobile Ads в Expo требуется bare workflow
// или custom config plugin. Сейчас используются заглушки.

export type AdConfig = {
  bannerId: string;
  interstitialId: string;
  rewardedId: string;
};

export const AD_IDS: AdConfig = {
  bannerId: 'R-M-16870510-1',
  interstitialId: 'R-M-16870510-2',
  rewardedId: 'R-M-16870510-3',
};

class AdsManager {
  private interstitialLoaded = false;
  private rewardedLoaded = false;

  async initialize(): Promise<void> {
    // TODO: Инициализация Yandex Mobile Ads SDK
    console.log('Yandex Ads initialized (mock)');
    // Для реальной интеграции:
    // import { MobileAds } from 'yandex-mobile-ads';
    // await MobileAds.initialize();
  }

  async loadInterstitial(): Promise<void> {
    // TODO: Загрузка interstitial рекламы
    console.log('Loading interstitial ad...');
    this.interstitialLoaded = true;
  }

  async showInterstitial(): Promise<boolean> {
    if (!this.interstitialLoaded) {
      await this.loadInterstitial();
    }
    // TODO: Показ interstitial рекламы
    console.log('Showing interstitial ad (mock)');
    return true;
  }

  async loadRewarded(): Promise<void> {
    // TODO: Загрузка rewarded рекламы
    console.log('Loading rewarded ad...');
    this.rewardedLoaded = true;
  }

  async showRewarded(onRewarded: () => void): Promise<boolean> {
    if (!this.rewardedLoaded) {
      await this.loadRewarded();
    }
    // TODO: Показ rewarded рекламы
    console.log('Showing rewarded ad (mock)');
    // Симуляция просмотра рекламы
    setTimeout(() => {
      onRewarded();
    }, 1000);
    return true;
  }

  getBannerComponent() {
    // TODO: Возврат компонента баннера
    // Для реальной интеграции:
    // return <BannerAd adUnitId={AD_IDS.bannerId} />;
    return null;
  }
}

export const adsManager = new AdsManager();
