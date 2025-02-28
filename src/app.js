/**
 * Firebase Authentication Sample Application
 * 
 * 파이어베이스 인증 기능을 구현한 메인 애플리케이션입니다.
 * 
 * Features:
 * - Email/Password Authentication
 * - Google OAuth Authentication
 * - User Registration
 * - Logout
 * - Real-time Auth State Management
 */

// Firebase SDK imports for authentication features
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { firebaseConfig } from './config/firebase.config';

// Initialize Firebase application
try {
  console.log('Firebase config:', firebaseConfig);
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const auth = getAuth(app);

  /**
   * Display user information in the UI
   * 사용자 정보를 UI에 표시하는 헬퍼 함수
   * 
   * @param {Object} user - Firebase user object containing auth details
   */
  function displayUserInfo(user) {
    console.log('User state changed:', user);
    const userInfoElement = document.getElementById("user-info");
    if (userInfoElement) {
      userInfoElement.textContent = user ? JSON.stringify(user, null, 2) : "Not logged in";
    }
  }

  // Set up real-time auth state observer
  // 실시간 인증 상태 변경 감지 설정
  onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed:', user);
    displayUserInfo(user);
  });

  // DOM Content Loaded Event Handler
  document.addEventListener('DOMContentLoaded', () => {
    /**
     * Email/Password Login Handler
     * 이메일/비밀번호 로그인 처리
     * 
     * @throws {FirebaseAuthError} When authentication fails
     */
    document.getElementById("email-login").addEventListener("click", async () => {
      try {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const result = await signInWithEmailAndPassword(auth, email, password);
        console.log("Email sign in success:", result.user);
        alert("Successfully signed in!");
      } catch (error) {
        console.error("Email sign in error:", error);
        alert("Error: " + error.message);
      }
    });

    /**
     * Email/Password Registration Handler
     * 신규 사용자 등록 처리
     * 
     * @throws {FirebaseAuthError} When registration fails
     */
    document.getElementById("email-signup").addEventListener("click", async () => {
      try {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const result = await createUserWithEmailAndPassword(auth, email, password);
        console.log("Email sign up success:", result.user);
        alert("Successfully signed up!");
      } catch (error) {
        console.error("Email sign up error:", error);
        alert("Error: " + error.message);
      }
    });

    /**
     * Google OAuth Login Handler
     * 구글 소셜 로그인 처리
     * 
     * @throws {FirebaseAuthError} When Google sign-in fails
     */
    document.getElementById("google-login").addEventListener("click", async () => {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        console.log("Google sign in success:", result.user);
        alert("Successfully signed in with Google!");
      } catch (error) {
        console.error("Google sign in error:", error);
        alert("Error: " + error.message);
      }
    });

    /**
     * Logout Handler
     * 로그아웃 처리
     * 
     * @throws {FirebaseAuthError} When sign-out fails
     */
    document.getElementById("logout").addEventListener("click", async () => {
      try {
        await signOut(auth);
        console.log("Successfully signed out");
        alert("Successfully signed out!");
      } catch (error) {
        console.error("Sign out error:", error);
        alert("Error: " + error.message);
      }
    });
  });
} catch (error) {
  console.error('Firebase initialization error:', error);
}
