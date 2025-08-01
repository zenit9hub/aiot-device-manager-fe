import { ViewManager } from './views/ViewManager.js';
import { AuthView } from './views/AuthView.js';
import { DeviceListView } from './views/DeviceListView.js';
import { DeviceDetailView } from './views/DeviceDetailView.js';

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
  }

  /**
   * 애플리케이션 초기화
   */
  async initialize() {
    try {
      // 뷰 인스턴스 생성
      this.authView = new AuthView(this.auth);
      this.deviceListView = new DeviceListView(this.db, this.auth);
      this.deviceDetailView = new DeviceDetailView();

      // 뷰 등록
      this.viewManager.registerView('auth', this.authView);
      this.viewManager.registerView('deviceList', this.deviceListView);
      this.viewManager.registerView('deviceDetail', this.deviceDetailView);

      // 전역 참조 설정 (기존 코드와의 호환성을 위해)
      window.deviceListView = this.deviceListView;
      window.deviceDetailView = this.deviceDetailView;

      // 현재 사용자 상태 확인하여 적절한 초기 뷰 설정
      await this.determineInitialView();

      console.log('AppManager initialized successfully');
    } catch (error) {
      console.error('AppManager initialization error:', error);
    }
  }

  /**
   * 초기 뷰 결정
   */
  async determineInitialView() {
    // 현재 사용자 상태를 즉시 확인
    const currentUser = this.auth.currentUser;
    
    if (currentUser) {
      console.log('User already logged in, navigating to device list');
      // 이미 로그인된 사용자가 있으면 디바이스 목록으로 바로 이동
      await this.viewManager.navigateTo('deviceList', { user: currentUser });
    } else {
      console.log('No user logged in, showing auth view');
      // 로그인되지 않은 경우 인증 뷰 표시
      await this.viewManager.navigateTo('auth');
    }
    
    // AuthView에서 onAuthStateChanged 리스너가 이미 설정되므로
    // 여기서는 중복 설정하지 않음
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