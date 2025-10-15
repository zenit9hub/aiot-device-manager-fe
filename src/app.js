/**
 * Firebase AIoT Device Management Application
 * 
 * Firebase 인증과 Firestore를 활용한 실시간 AIoT 디바이스 관리 애플리케이션입니다.
 * 뷰 기반 아키텍처로 리팩토링되었습니다.
 * 
 
 * Features:
 * - Email/Password Authentication
 * - Google OAuth Authentication
 * - Real-time Device CRUD operations
 * - User-specific Device management
 * - Device status monitoring and filtering
 * - View-based architecture for maintainability
 */

// Firebase SDK imports
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { firebaseConfig } from './config/firebase.config.js';

// App configuration imports
import { appConfig } from './config/app.config.js';

// App management imports
import { AppManager } from './AppManager.js';

// Initialize Firebase application
try {
  const app = initializeApp(firebaseConfig);
  
  // Analytics 초기화 (선택적)
  let analytics = null;
  try {
    analytics = getAnalytics(app);
  } catch (analyticsError) {
    console.warn('Analytics initialization failed:', analyticsError.message);
  }
  
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Firebase services object
  const firebaseServices = { auth, db, analytics };

  // Global app manager
  let appManager = null;

  /**
   * Apply app configuration to UI elements
   */
  function applyAppConfig() {
    // Update page title
    document.title = appConfig.appName;
    const appTitleEl = document.getElementById('app-title');
    if (appTitleEl) {
      appTitleEl.textContent = appConfig.appName;
    }
    
    // Update auth header title
    const authHeaderEl = document.getElementById('auth-header-title');
    if (authHeaderEl) {
      authHeaderEl.textContent = appConfig.appName;
    }
    
    // Update main header title
    const mainHeaderEl = document.getElementById('main-header-title');
    if (mainHeaderEl) {
      mainHeaderEl.textContent = appConfig.appName;
    }
    
    // Update HTML lang attribute
    const htmlEl = document.documentElement;
    if (htmlEl) {
      htmlEl.setAttribute('lang', appConfig.locale);
    }
    
    console.log(`✅ App configuration applied: ${appConfig.appName}`);
  }

  /**
   * DOM Content Loaded Event Handler
   * 새로운 뷰 기반 아키텍처로 앱을 초기화합니다.
   */
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      // Apply app configuration
      applyAppConfig();
      
      // Create and initialize app manager
      appManager = new AppManager(firebaseServices);
      
      // Export app manager and config for debugging
      window.appManager = appManager;
      window.appConfig = appConfig;
      
      await appManager.initialize();
    } catch (error) {
      console.error('Failed to initialize application:', error);
      alert('애플리케이션 초기화 중 오류가 발생했습니다: ' + error.message);
    }
  });

  /**
   * Window beforeunload event handler
   * 애플리케이션 정리
   */
  window.addEventListener('beforeunload', async () => {
    if (appManager) {
      await appManager.cleanup();
    }
  });

} catch (error) {
  console.error('Firebase initialization error:', error);
  alert('Firebase 초기화 중 오류가 발생했습니다: ' + error.message);
}
