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

// App management imports
import { AppManager } from './AppManager.js';

// Initialize Firebase application
try {
  console.log('Firebase config:', firebaseConfig);
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Firebase services object
  const firebaseServices = { auth, db, analytics };

  // Global app manager
  let appManager = null;

  /**
   * DOM Content Loaded Event Handler
   * 새로운 뷰 기반 아키텍처로 앱을 초기화합니다.
   */
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      console.log('Initializing application with view-based architecture...');
      
      // Create and initialize app manager
      appManager = new AppManager(firebaseServices);
      
      // Export app manager for debugging immediately after creation
      window.appManager = appManager;
      
      await appManager.initialize();
      
      console.log('Application initialized successfully');
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