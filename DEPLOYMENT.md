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
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**📋 값 확인 방법:**
Firebase Console > Project Settings > General > Your apps에서 Firebase SDK snippet의 Config 객체에서 각 값을 확인할 수 있습니다.

### 3. Firebase 보안 및 도메인 설정

Firebase Authentication은 Authorized Domains 설정으로 접근을 제어합니다. 
CORS 설정과는 다른 Firebase만의 보안 메커니즘입니다.

**중요사항:**
- ✅ Firebase API Key는 브라우저용으로 설계됨 (공개 노출 안전)
- ✅ Firebase Security Rules로 데이터 접근 제어
- ✅ **Authorized Domains가 가장 중요** - 여기에 등록되지 않은 도메인에서는 인증 불가
- ✅ Google OAuth의 경우 Google Cloud Console의 OAuth 클라이언트 설정도 필요

### 4. 배포 후 테스트 체크리스트

- [ ] 이메일/패스워드 로그인 테스트
- [ ] Google OAuth 로그인 테스트
- [ ] 디바이스 CRUD 기능 테스트
- [ ] 실시간 동기화 테스트
- [ ] 로그아웃 기능 테스트

### 5. 문제 해결

#### "The requested action is invalid" 오류 ✅ 해결됨
이 오류는 **Firebase Authentication의 Authorized Domains 설정** 문제였습니다:
- ✅ Firebase Console > Authentication > Settings > Authorized domains에 프론트엔드 도메인 주소 추가로 해결
- ✅ Google Cloud Console에서 OAuth 2.0 클라이언트에도 동일 도메인 추가 필요

#### 환경 변수 오류
- Amplify Console에서 모든 VITE_ 접두사 환경 변수가 설정되었는지 확인
- 배포 후 새로운 빌드 트리거 필요

#### Firebase Connection 오류
- Firebase 프로젝트가 활성화되어 있는지 확인
- Firestore 데이터베이스가 생성되어 있는지 확인

---

**마지막 업데이트:** 2025-08-15
**Firebase SDK 버전:** v10.8.0

## ⚠️ 보안 주의사항

- **환경 변수**: 실제 Firebase 설정 값들을 문서에 하드코딩하지 마세요
- **Private Repository**: Firebase 설정이 포함된 경우 반드시 private repository 사용
- **gitignore**: `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- **Access Control**: Firebase Security Rules로 데이터 접근 제어 설정
- **Domain Restriction**: Authorized Domains로 허용된 도메인만 접근 가능하도록 설정