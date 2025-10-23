import { ViewManager } from './views/ViewManager.js';
import { AuthView } from './views/AuthView.js';
import { DeviceListView } from './views/DeviceListView.js';
import { DeviceDetailView } from './views/DeviceDetailView.js';
import { FirebaseTokenManager } from './services/FirebaseTokenManager.js';
import { SensorApiClient } from './services/sensorApi.js';
import { backendConfig } from './config/backend.config.js';
import { BackendIntegrationService } from './services/BackendIntegrationService.js';

/**
 * AppManager - 애플리케이션 전체 관리
 * 
 * Firebase 초기화, 뷰 등록, 앱 시작을 담당합니다.
 */
export class AppManager {
  constructor(firebaseServices) {
    this.auth = firebaseServices.auth;
    this.db = firebaseServices.db;
    this.analytics = firebaseServices.analytics;
    
    this.viewManager = new ViewManager();
    this.authView = null;
    this.deviceListView = null;
    this.deviceDetailView = null;
    this.tokenManager = new FirebaseTokenManager(this.auth, {
      cacheDurationMinutes: backendConfig.tokenCacheMinutes
    });
    this.sensorApiClient = new SensorApiClient({
      tokenManager: this.tokenManager,
      baseUrl: backendConfig.baseUrl
    });
    this.backendIntegrationService = new BackendIntegrationService({
      db: this.db,
      sensorApiClient: this.sensorApiClient
    });
  }

  /**
   * 애플리케이션 초기화
   */
  async initialize() {
    try {
      // 뷰 인스턴스 생성
      this.authView = new AuthView(this.auth, this.tokenManager, {
        onAuthChange: async (user) => {
          await this.backendIntegrationService.handleAuthChange(user);
        }
      });
      this.deviceListView = new DeviceListView(this.db, this.auth, this.backendIntegrationService);
      this.deviceDetailView = new DeviceDetailView({
        sensorApi: this.sensorApiClient,
        backendIntegration: this.backendIntegrationService
      });

      // 뷰 등록 (이 시점에서 ViewManager가 각 뷰에 설정됨)
      this.viewManager.registerView('auth', this.authView);
      this.viewManager.registerView('deviceList', this.deviceListView);
      this.viewManager.registerView('deviceDetail', this.deviceDetailView);

      // 전역 참조 설정 (기존 코드와의 호환성을 위해)
      window.deviceListView = this.deviceListView;
      window.deviceDetailView = this.deviceDetailView;

      // AuthView 초기화 (이벤트 리스너 설정)
      await this.authView.initialize();

      // 현재 사용자 상태 확인하여 적절한 초기 뷰 설정
      await this.determineInitialView();

    } catch (error) {
      console.error('AppManager initialization error:', error);
      throw error;
    }
  }

  /**
   * 초기 뷰 결정
   */
  async determineInitialView() {
    // AuthView의 onAuthStateChanged 리스너가 auth state를 처리하므로
    // 여기서는 초기 뷰만 설정 (auth state 변경은 AuthView에서 처리)
    await this.viewManager.navigateTo('auth');
  }

  /**
   * 애플리케이션 정리
   */
  async cleanup() {
    if (this.viewManager) {
      await this.viewManager.cleanup();
    }
  }

  /**
   * 현재 뷰 매니저 반환
   */
  getViewManager() {
    return this.viewManager;
  }

  /**
   * 특정 뷰 인스턴스 반환
   */
  getView(viewName) {
    return this.viewManager.views.get(viewName);
  }
}
