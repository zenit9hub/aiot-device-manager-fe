import { BaseView } from './BaseView.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

/**
 * AuthView - 인증 관련 뷰
 * 
 * 로그인, 회원가입, 로그아웃 기능을 관리합니다.
 */
export class AuthView extends BaseView {
  constructor(auth) {
    super('auth', 'auth-section');
    this.auth = auth;
    this.currentUser = null;
    this.authStateUnsubscribe = null;
  }

  /**
   * 뷰 표시 (오버라이드)
   */
  show() {
    // main-container 숨김
    const mainContainer = document.getElementById("main-container");
    if (mainContainer) {
      mainContainer.classList.add('hidden');
    }
    
    // auth-section 표시
    const authSection = document.getElementById("auth-section");
    if (authSection) {
      authSection.classList.remove('hidden');
    }
    
    // BaseView의 show는 호출하지 않음 (auth-section을 직접 제어하므로)
  }

  /**
   * 뷰 숨김 (오버라이드)
   */
  hide() {
    // auth-section 숨김
    const authSection = document.getElementById("auth-section");
    if (authSection) {
      authSection.classList.add('hidden');
    }
  }

  async initialize() {
    this.setupEventListeners();
    this.setupAuthStateListener();
  }

  async cleanup() {
    this.removeEventListeners();
    if (this.authStateUnsubscribe) {
      this.authStateUnsubscribe();
      this.authStateUnsubscribe = null;
    }
  }

  /**
   * 이벤트 리스너 설정
   */
  setupEventListeners() {
    // Email/Password Login
    document.getElementById("email-login")?.addEventListener("click", this.handleEmailLogin.bind(this));
    
    // Email/Password Signup
    document.getElementById("email-signup")?.addEventListener("click", this.handleEmailSignup.bind(this));
    
    // Google Login
    document.getElementById("google-login")?.addEventListener("click", this.handleGoogleLogin.bind(this));
    
    // Logout
    document.getElementById("logout")?.addEventListener("click", this.handleLogout.bind(this));
  }

  /**
   * 이벤트 리스너 제거
   */
  removeEventListeners() {
    // 실제 구현에서는 저장된 리스너 참조를 제거해야 함
    // 현재는 간단히 처리
  }

  /**
   * 인증 상태 리스너 설정
   */
  setupAuthStateListener() {
    this.authStateUnsubscribe = onAuthStateChanged(this.auth, (user) => {
      this.handleAuthStateChange(user);
    });
  }

  /**
   * 인증 상태 변경 처리
   * @param {Object} user - Firebase user object
   */
  handleAuthStateChange(user) {
    console.log('Auth state changed:', user);
    this.currentUser = user;
    this.updateUserInfo(user);

    // ViewManager가 준비되지 않았으면 무시 (초기화 중)
    if (!this.viewManager) {
      console.log('ViewManager not ready yet, skipping navigation');
      return;
    }

    if (user) {
      // 로그인 성공 - 현재 뷰가 auth가 아니면 디바이스 목록으로 이동
      const currentView = this.viewManager.getCurrentView();
      if (!currentView || currentView.name !== 'deviceList') {
        console.log('User logged in, navigating to device list');
        this.navigateTo('deviceList', { user });
      }
    } else {
      // 로그아웃 - 현재 뷰가 auth가 아니면 인증 뷰로 이동
      const currentView = this.viewManager.getCurrentView();
      if (!currentView || currentView.name !== 'auth') {
        console.log('User signed out, navigating to auth view');
        this.navigateTo('auth');
      }
    }
  }


  /**
   * 사용자 정보 UI 업데이트
   * @param {Object} user 
   */
  updateUserInfo(user) {
    const userInfoElement = document.getElementById("user-info");
    if (userInfoElement) {
      userInfoElement.textContent = user ? 
        `로그인됨: ${user.email}` : 
        "Not logged in";
    }
  }

  /**
   * 이메일/비밀번호 로그인
   */
  async handleEmailLogin() {
    try {
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      
      if (!email || !password) {
        alert("이메일과 비밀번호를 입력해주세요.");
        return;
      }

      const result = await signInWithEmailAndPassword(this.auth, email, password);
      console.log("Email sign in success:", result.user);
      alert("Successfully signed in!");
    } catch (error) {
      console.error("Email sign in error:", error);
      alert("Error: " + error.message);
    }
  }

  /**
   * 이메일/비밀번호 회원가입
   */
  async handleEmailSignup() {
    try {
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      
      if (!email || !password) {
        alert("이메일과 비밀번호를 입력해주세요.");
        return;
      }

      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      console.log("Email sign up success:", result.user);
      alert("Successfully signed up!");
    } catch (error) {
      console.error("Email sign up error:", error);
      alert("Error: " + error.message);
    }
  }

  /**
   * 구글 로그인 - 현재 사용자 상태 확인 후 팝업 사용
   */
  async handleGoogleLogin() {
    try {
      // 이미 로그인된 사용자가 있는지 확인
      if (this.auth.currentUser) {
        console.log("User already logged in:", this.auth.currentUser.email);
        return;
      }
      
      const provider = new GoogleAuthProvider();
      // 빠른 팝업 응답을 위한 설정
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log("Starting Google authentication with popup...");
      const result = await signInWithPopup(this.auth, provider);
      console.log("Google sign in success:", result.user);
      
      // onAuthStateChanged에서 자동으로 뷰 전환이 처리됨
    } catch (error) {
      console.error("Google sign in error:", error);
      
      // 사용자가 팝업을 닫은 경우는 조용히 처리
      if (error.code === 'auth/popup-closed-by-user' || 
          error.code === 'auth/cancelled-popup-request') {
        console.log("User cancelled Google login");
        return;
      }
      
      // 실제 에러만 사용자에게 표시
      let errorMessage = "Google 로그인 중 오류가 발생했습니다: ";
      
      switch (error.code) {
        case 'auth/popup-blocked':
          errorMessage += "팝업이 차단되었습니다. 브라우저 설정을 확인해주세요.";
          break;
        case 'auth/operation-not-allowed':
          errorMessage += "Google 로그인이 비활성화되어 있습니다.";
          break;
        case 'auth/unauthorized-domain':
          errorMessage += "인증되지 않은 도메인입니다.";
          break;
        case 'auth/network-request-failed':
          errorMessage += "네트워크 연결을 확인해주세요.";
          break;
        default:
          errorMessage += error.message;
      }
      
      alert(errorMessage);
    }
  }

  /**
   * 로그아웃
   */
  async handleLogout() {
    try {
      await signOut(this.auth);
      console.log("Successfully signed out");
      // AuthView의 onAuthStateChanged가 자동으로 뷰 전환을 처리함
    } catch (error) {
      console.error("Sign out error:", error);
      alert("Error: " + error.message);
    }
  }


  /**
   * 현재 사용자 반환
   */
  getCurrentUser() {
    return this.currentUser;
  }
}