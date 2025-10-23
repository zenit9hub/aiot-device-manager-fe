# Firebase Console 설정 가이드

## 🔧 필수 설정 체크리스트

Google 로그인이 정상 작동하려면 Firebase Console에서 다음 설정이 필요합니다.

### 1. ✅ Authorized Domains 설정 (가장 중요!)

#### 설정 위치
```
Firebase Console → Authentication → Settings → Authorized domains
```

#### 추가해야 할 도메인

**개발 환경:**
```
localhost
```

**배포 환경 (AWS Amplify 사용 시):**
```
your-app-name.amplifyapp.com
main.your-app-id.amplifyapp.com
develop.your-app-id.amplifyapp.com
```

#### ❌ 설정하지 않으면 발생하는 에러
```
auth/unauthorized-domain
```

#### 📸 설정 스크린샷 위치
1. Firebase Console 접속: https://console.firebase.google.com/
2. 프로젝트 선택
3. 좌측 메뉴: **Authentication** 클릭
4. 상단 탭: **Settings** 클릭
5. 하단: **Authorized domains** 섹션
6. **Add domain** 버튼으로 도메인 추가

---

### 2. ✅ Google Sign-In Provider 활성화

#### 설정 위치
```
Firebase Console → Authentication → Sign-in method
```

#### 활성화 방법
1. **Sign-in providers** 목록에서 **Google** 찾기
2. 우측 **Edit** (연필 아이콘) 클릭
3. **Enable** 토글 ON
4. **Project support email** 선택 (본인 이메일)
5. **Save** 클릭

#### ❌ 설정하지 않으면 발생하는 에러
```
auth/operation-not-allowed
```

---

### 3. ✅ Firebase Config 환경변수 확인

#### `.env` 파일 설정

프로젝트 루트에 `.env` 파일이 있어야 합니다:

```bash
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

#### 값 확인 방법
1. Firebase Console → 프로젝트 설정 (톱니바퀴 아이콘)
2. **General** 탭
3. **Your apps** 섹션에서 웹 앱 선택
4. **Firebase SDK snippet** → **Config** 선택
5. 표시된 값들을 `.env`에 복사

#### ⚠️ 중요: authDomain 형식
```
# ✅ 올바른 형식
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com

# ❌ 잘못된 형식
VITE_FIREBASE_AUTH_DOMAIN=your-custom-domain.com
VITE_FIREBASE_AUTH_DOMAIN=localhost:5173
```

**authDomain은 반드시 `[project-id].firebaseapp.com` 형식이어야 합니다!**

---

## 🐛 에러 해결 가이드

### 에러 1: `auth/cancelled-popup-request`
**원인:** 로그인 버튼을 여러 번 빠르게 클릭함

**해결:**
- ✅ 코드에서 이미 중복 클릭 방지 처리됨
- 버튼이 "로그인 중..."으로 바뀔 때까지 기다리세요

**콘솔 메시지:**
```
[AuthView] 로그인 진행 중입니다. 잠시만 기다려주세요.
[AuthView] 로그인 취소됨
```

---

### 에러 2: `Cross-Origin-Opener-Policy policy would block the window.closed call`
**원인:** 브라우저의 COOP 보안 정책

**해결:**
- ✅ **이 경고는 정상이며 무시해도 됩니다!**
- Firebase가 자동으로 대체 방법을 사용합니다
- 로그인 기능에는 영향 없음

---

### 에러 3: `auth/unauthorized-domain`
**원인:** Authorized domains에 현재 도메인이 추가되지 않음

**해결:**
1. Firebase Console → Authentication → Settings → Authorized domains
2. 현재 사용 중인 도메인 추가
   - 개발: `localhost`
   - 배포: `your-app.amplifyapp.com`

---

### 에러 4: `auth/popup-blocked`
**원인:** 브라우저가 팝업을 차단함

**해결:**
1. 브라우저 주소창 우측의 팝업 차단 아이콘 클릭
2. 팝업 허용 설정
3. 또는 리다이렉트 방식 사용 (대안 섹션 참조)

---

### 에러 5: `auth/network-request-failed`
**원인:** 네트워크 연결 문제 또는 방화벽

**해결:**
1. 인터넷 연결 확인
2. 방화벽/프록시 설정 확인
3. Firebase 서비스 상태 확인: https://status.firebase.google.com/

---

## 🧪 설정 검증 방법

### 1. 개발자 콘솔 확인

**정상적인 콘솔 메시지:**
```
[AuthView] Google 로그인 시작...
Cross-Origin-Opener-Policy policy would block... (무시 가능)
[AuthView] Google 로그인 성공!
```

**비정상적인 콘솔 메시지 (수정 필요):**
```
auth/unauthorized-domain → Authorized domains에 도메인 추가
auth/operation-not-allowed → Google Sign-in Provider 활성화
auth/invalid-api-key → .env 파일의 API_KEY 확인
```

### 2. 네트워크 탭 확인

개발자 도구 → Network 탭에서 확인:

1. **identitytoolkit.googleapis.com** 요청이 200 OK면 정상
2. **403 Forbidden**이면 Authorized domains 설정 확인
3. **400 Bad Request**면 Firebase Config 확인

---

## 📱 대안: 리다이렉트 방식 (팝업 문제 해결)

팝업 방식에 문제가 계속되면 리다이렉트 방식을 사용할 수 있습니다.

### AuthView.js 수정 (선택사항)

```javascript
import {
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider
} from "firebase/auth";

// 로그인 버튼 클릭 시
async handleGoogleLogin() {
  const provider = new GoogleAuthProvider();
  await signInWithRedirect(this.auth, provider);
}

// app.js 초기화 부분에 추가
async function checkRedirectResult(auth) {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log('리다이렉트 로그인 성공:', result.user.email);
    }
  } catch (error) {
    console.error('리다이렉트 로그인 에러:', error);
  }
}
```

**리다이렉트 방식의 장단점:**

✅ **장점:**
- 팝업 차단 문제 없음
- 모바일 환경에서 더 나은 UX
- COOP 경고 없음

❌ **단점:**
- 페이지 전체가 리로드됨
- 로그인 후 이전 상태 복원 필요
- 약간 더 복잡한 구현

---

## 📞 추가 도움이 필요한 경우

1. **Firebase 공식 문서:**
   - https://firebase.google.com/docs/auth/web/google-signin

2. **Firebase 지원:**
   - https://firebase.google.com/support

3. **프로젝트 문서:**
   - `GOOGLE_LOGIN_OPTIMIZATION.md` - 로그인 최적화 가이드
   - `DEPLOYMENT.md` - 배포 가이드
   - `README.md` - 프로젝트 개요

