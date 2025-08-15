# Firebase + Amplify 배포 가이드

## 🚀 Amplify 배포 시 Firebase 인증 설정

### 1. Firebase Console 필수 설정

#### Authorized Domains 추가
Firebase Console > Authentication > Settings > Authorized domains에 다음 도메인들을 추가하세요:

```
localhost
localhost:5173
<your-app-name>.amplifyapp.com
<branch-name>.<your-app-id>.amplifyapp.com
```

예시:
```
main.d1a2b3c4d5e6f.amplifyapp.com
develop.d1a2b3c4d5e6f.amplifyapp.com
```

#### Google OAuth 설정
1. Firebase Console > Authentication > Sign-in method
2. Google 제공업체 활성화
3. 지원 이메일 설정
4. Google Cloud Console에서 OAuth 2.0 클라이언트 ID에 Amplify 도메인 추가

### 2. Amplify 환경 변수 설정

Amplify Console > App settings > Environment variables에 다음 변수들을 설정:

```
VITE_FIREBASE_API_KEY=AIzaSyD8-o1oC3wVlDnjECUy1pZ_ip-YyclJBaY
VITE_FIREBASE_AUTH_DOMAIN=fir-auth-kiot.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fir-auth-kiot
VITE_FIREBASE_STORAGE_BUCKET=fir-auth-kiot.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=835568542787
VITE_FIREBASE_APP_ID=1:835568542787:web:c474be3c2b4fd9d38ee0f6
VITE_FIREBASE_MEASUREMENT_ID=G-2T94S53GC6
```

### 3. CORS 및 보안 설정

Firebase는 클라이언트 SDK를 사용하므로 별도의 CORS 설정이 필요하지 않습니다.
그러나 다음 사항들을 확인하세요:

- ✅ Firebase API Key는 브라우저에서 사용하도록 설계됨 (공개 노출 OK)
- ✅ Firebase Security Rules로 데이터 접근 제어
- ✅ Authorized Domains로 도메인 제한

### 4. 배포 후 테스트 체크리스트

- [ ] 이메일/패스워드 로그인 테스트
- [ ] Google OAuth 로그인 테스트
- [ ] 디바이스 CRUD 기능 테스트
- [ ] 실시간 동기화 테스트
- [ ] 로그아웃 기능 테스트

### 5. 문제 해결

#### "The requested action is invalid" 오류
- Firebase Console에서 Amplify 도메인이 Authorized domains에 추가되었는지 확인
- Google Cloud Console에서 OAuth 2.0 클라이언트 설정 확인

#### 환경 변수 오류
- Amplify Console에서 모든 VITE_ 접두사 환경 변수가 설정되었는지 확인
- 배포 후 새로운 빌드 트리거 필요

#### Firebase Connection 오류
- Firebase 프로젝트가 활성화되어 있는지 확인
- Firestore 데이터베이스가 생성되어 있는지 확인

---

**마지막 업데이트:** $(date)
**Firebase SDK 버전:** v10.8.0