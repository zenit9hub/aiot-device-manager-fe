import { BaseView } from './BaseView.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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
    
    // 페이지 로드 시 redirect 결과 확인
    await this.checkRedirectResult();
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

    if (user) {
      // 로그인 성공 - 디바이스 목록 뷰로 이동
      if (this.viewManager) {
        this.navigateTo('deviceList', { user });
      } else {
        console.log('ViewManager not ready yet, will be handled by AppManager');
      }
    } else {
      // 로그아웃 - 인증 뷰 표시
      console.log('User signed out, navigating to auth view');
      if (this.viewManager) {
        this.navigateTo('auth');
      } else {
        console.log('ViewManager not ready yet, will be handled by AppManager');
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
   * 구글 로그인
   */
  async handleGoogleLogin() {
    try {
      const provider = new GoogleAuthProvider();
      
      // 팝업 시도 먼저
      try {
        const result = await signInWithPopup(this.auth, provider);
        console.log("Google sign in success (popup):", result.user);
        alert("Successfully signed in with Google!");
        return;
      } catch (popupError) {
        console.log("Popup failed, trying redirect:", popupError.code);
        
        // 팝업이 차단되거나 실패하면 redirect 방식 사용
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/cancelled-popup-request' ||
            popupError.code === 'auth/popup-closed-by-user') {
          
          console.log("Using redirect method for Google sign in");
          alert("팝업이 차단되었습니다. 페이지 리디렉션으로 로그인을 진행합니다.");
          await signInWithRedirect(this.auth, provider);
          return;
        }
        
        // 다른 에러는 그대로 throw
        throw popupError;
      }
    } catch (error) {
      console.error("Google sign in error:", error);
      alert("Google 로그인 중 오류가 발생했습니다: " + error.message);
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
   * Redirect 결과 확인
   */
  async checkRedirectResult() {
    try {
      const result = await getRedirectResult(this.auth);
      if (result) {
        console.log("Google sign in success (redirect):", result.user);
        alert("Successfully signed in with Google!");
      }
    } catch (error) {
      console.error("Redirect result error:", error);
      if (error.code !== 'auth/no-redirect-operation') {
        alert("Google 로그인 중 오류가 발생했습니다: " + error.message);
      }
    }
  }

  /**
   * 현재 사용자 반환
   */
  getCurrentUser() {
    return this.currentUser;
  }
}