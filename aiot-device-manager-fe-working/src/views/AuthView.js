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
  constructor(auth, tokenManager, options = {}) {
    super('auth', 'auth-section');
    this.auth = auth;
    this.currentUser = null;
    this.authStateUnsubscribe = null;
    this.isLoggingIn = false; // 중복 로그인 방지 플래그
    this.tokenManager = tokenManager;
    this.onAuthChange = typeof options.onAuthChange === 'function' ? options.onAuthChange : null;

    // 이벤트 핸들러를 바운드 함수로 저장 (중복 등록 방지)
    this.boundHandlers = {
      emailLogin: this.handleEmailLogin.bind(this),
      emailSignup: this.handleEmailSignup.bind(this),
      googleLogin: this.handleGoogleLogin.bind(this),
      logout: this.handleLogout.bind(this)
    };
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
    // 먼저 기존 리스너 제거 (중복 방지)
    this.removeEventListeners();

    // Email/Password Login
    const emailLoginBtn = document.getElementById("email-login");
    if (emailLoginBtn) {
      emailLoginBtn.addEventListener("click", this.boundHandlers.emailLogin);
    }

    // Email/Password Signup
    const emailSignupBtn = document.getElementById("email-signup");
    if (emailSignupBtn) {
      emailSignupBtn.addEventListener("click", this.boundHandlers.emailSignup);
    }

    // Google Login
    const googleLoginBtn = document.getElementById("google-login");
    if (googleLoginBtn) {
      googleLoginBtn.addEventListener("click", this.boundHandlers.googleLogin);
    }

    // Logout
    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", this.boundHandlers.logout);
    }
  }

  /**
   * 이벤트 리스너 제거
   */
  removeEventListeners() {
    const emailLoginBtn = document.getElementById("email-login");
    if (emailLoginBtn) {
      emailLoginBtn.removeEventListener("click", this.boundHandlers.emailLogin);
    }

    const emailSignupBtn = document.getElementById("email-signup");
    if (emailSignupBtn) {
      emailSignupBtn.removeEventListener("click", this.boundHandlers.emailSignup);
    }

    const googleLoginBtn = document.getElementById("google-login");
    if (googleLoginBtn) {
      googleLoginBtn.removeEventListener("click", this.boundHandlers.googleLogin);
    }

    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
      logoutBtn.removeEventListener("click", this.boundHandlers.logout);
    }
  }

  /**
   * 인증 상태 리스너 설정
   */
  setupAuthStateListener() {
    this.authStateUnsubscribe = onAuthStateChanged(this.auth, async (user) => {
      await this.handleAuthStateChange(user);
    });
  }

  /**
   * 인증 상태 변경 처리
   * @param {Object} user - Firebase user object
   */
  async handleAuthStateChange(user) {
    this.currentUser = user;
    if (this.tokenManager) {
      this.tokenManager.clear();
    }
    if (this.onAuthChange) {
      try {
        await this.onAuthChange(user);
      } catch (error) {
        console.error('Auth change hook error:', error);
      }
    }
    this.updateUserInfo(user);

    // ViewManager가 준비되지 않았으면 무시 (초기화 중)
    if (!this.viewManager) {
      return;
    }

    if (user) {
      // 로그인 성공 시 디바이스 목록으로 이동
      const currentView = this.viewManager.getCurrentView();
      if (!currentView || currentView.name !== 'deviceList') {
        this.navigateTo('deviceList', { user });
      }
    } else {
      // 로그아웃 시 인증 뷰로 이동
      const currentView = this.viewManager.getCurrentView();
      if (!currentView || currentView.name !== 'auth') {
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
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      if (!email || !password) {
        alert("이메일과 비밀번호를 입력해주세요.");
        return;
      }

      await signInWithEmailAndPassword(this.auth, email, password);
      // 성공 시 자동으로 화면 전환되므로 alert 불필요
    } catch (error) {
      console.error("Email 로그인 에러:", error);

      const errorMessages = {
        'auth/invalid-email': '유효하지 않은 이메일 형식입니다.',
        'auth/user-disabled': '비활성화된 계정입니다.',
        'auth/user-not-found': '존재하지 않는 계정입니다.',
        'auth/wrong-password': '비밀번호가 틀렸습니다.',
        'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
        'auth/too-many-requests': '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.'
      };

      alert(errorMessages[error.code] || `로그인 오류: ${error.message}`);
    }
  }

  /**
   * 이메일/비밀번호 회원가입
   */
  async handleEmailSignup() {
    try {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      if (!email || !password) {
        alert("이메일과 비밀번호를 입력해주세요.");
        return;
      }

      if (password.length < 6) {
        alert("비밀번호는 최소 6자 이상이어야 합니다.");
        return;
      }

      await createUserWithEmailAndPassword(this.auth, email, password);
      // 성공 시 자동으로 화면 전환되므로 alert 불필요
    } catch (error) {
      console.error("Email 가입 에러:", error);

      const errorMessages = {
        'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
        'auth/invalid-email': '유효하지 않은 이메일 형식입니다.',
        'auth/operation-not-allowed': '이메일/비밀번호 인증이 비활성화되어 있습니다.',
        'auth/weak-password': '비밀번호가 너무 약합니다. (최소 6자 이상)'
      };

      alert(errorMessages[error.code] || `가입 오류: ${error.message}`);
    }
  }

  /**
   * 구글 로그인 - 간결한 버전 (중복 클릭 방지 포함)
   */
  async handleGoogleLogin() {
    try {
      // 중복 클릭 방지
      if (this.isLoggingIn || this.auth.currentUser) return;

      this.isLoggingIn = true;
      this.updateLoginButtonState(true);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      await signInWithPopup(this.auth, provider);

    } catch (error) {
      // 팝업 닫힘은 조용히 처리
      if (error.code === 'auth/popup-closed-by-user' ||
          error.code === 'auth/cancelled-popup-request') {
        return;
      }

      // 실제 에러만 표시
      console.error('Google 로그인 에러:', error);

      const errorMessages = {
        'auth/popup-blocked': '팝업이 차단되었습니다.',
        'auth/operation-not-allowed': 'Google 로그인이 비활성화되어 있습니다.',
        'auth/unauthorized-domain': `도메인(${window.location.origin})이 승인되지 않았습니다.`,
        'auth/network-request-failed': '네트워크 연결을 확인해주세요.'
      };

      alert(errorMessages[error.code] || `로그인 오류: ${error.message}`);
    } finally {
      this.isLoggingIn = false;
      this.updateLoginButtonState(false);
    }
  }

  /**
   * 로그인 버튼 상태 업데이트
   */
  updateLoginButtonState(isLoading) {
    const button = document.getElementById('google-login');
    if (!button) return;

    button.disabled = isLoading;
    button.textContent = isLoading ? '로그인 중...' : 'Login with Google';
    button.classList.toggle('opacity-50', isLoading);
    button.classList.toggle('cursor-not-allowed', isLoading);
  }

  /**
   * 로그아웃
   */
  async handleLogout() {
    try {
      await signOut(this.auth);
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
