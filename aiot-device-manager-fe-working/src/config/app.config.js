/**
 * 애플리케이션 개인화 설정
 *
 * 이 파일을 수정하여 교육생별로 맞춤 설정을 적용할 수 있습니다.
 * Firebase 설정은 .env 파일을 사용하고,
 * UI/UX 관련 개인화 설정은 이 파일에서 관리합니다.
 */

export const appConfig = {
  // ========================================
  // 기본 정보 설정
  // ========================================

  /**
   * 애플리케이션 이름
   * - 브라우저 탭 제목과 헤더에 표시됩니다
   */
  appName: "KIoT Device Manager",

  /**
   * 애플리케이션 설명
   * - 메타 태그나 소개 페이지에 사용할 수 있습니다
   */
  appDescription: "Firebase 기반 AIoT 디바이스 관리 시스템",

  /**
   * 개발자/교육생 정보
   */
  developer: {
    name: "Zenit",
    email: "zenit@example.com",
    organization: "KIoT Academy",
  },

  // ========================================
  // UI/UX 설정
  // ========================================

  /**
   * 테마 색상 설정
   * - Tailwind CSS 색상명을 사용합니다
   */
  theme: {
    primary: "blue",      // 주요 버튼, 링크 색상
    secondary: "gray",    // 보조 버튼 색상
    success: "green",     // 성공 메시지 색상
    danger: "red",        // 경고, 삭제 버튼 색상
    warning: "yellow",    // 경고 메시지 색상
  },

  /**
   * 언어 설정
   */
  locale: "ko", // "ko" | "en"

  /**
   * 디바이스 관련 설정
   */
  device: {
    // 디바이스 타입 옵션 (필요에 따라 추가/제거 가능)
    types: [
      { value: "sensor", label: "센서" },
      { value: "actuator", label: "액추에이터" },
      { value: "gateway", label: "게이트웨이" },
      { value: "camera", label: "카메라" },
    ],

    // 초기 디바이스 상태
    defaultStatus: "offline",

    // 페이지당 표시할 디바이스 수
    itemsPerPage: 10,
  },

  // ========================================
  // MQTT 설정
  // ========================================

  mqtt: {
    // MQTT 브로커 선택 (broker-option1 ~ broker-option6 중 선택)
    brokerOption: "broker-option4",

    // MQTT 브로커 옵션들
    brokerOptions: {
      "broker-option1": {
        name: "HiveMQ Public Broker",
        url: "ws://broker.hivemq.com:8000/mqtt",
        description: "무료 공용 브로커 (WebSocket) - 권장",
      },
      "broker-option2": {
        name: "HiveMQ Public Broker (SSL)",
        url: "wss://broker.hivemq.com:8884/mqtt",
        description: "무료 공용 브로커 (WebSocket Secure)",
      },
      "broker-option3": {
        name: "Eclipse Public Broker",
        url: "ws://mqtt.eclipseprojects.io:80/mqtt",
        description: "Eclipse 재단 공용 브로커",
      },
      "broker-option4": {
        name: "Mosquitto Test Broker",
        url: "ws://test.mosquitto.org:8080/mqtt",
        description: "Mosquitto 테스트 브로커 (WebSocket)",
      },
      "broker-option5": {
        name: "Mosquitto Test Broker (SSL)",
        url: "wss://test.mosquitto.org:8081/mqtt",
        description: "Mosquitto 테스트 브로커 (WebSocket Secure)",
      },
      "broker-option6": {
        name: "Local Mosquitto Broker",
        url: "ws://localhost:9001/mqtt",
        description: "로컬 Mosquitto 브로커 (직접 설치 필요)",
      },
    },

    // MQTT 토픽 프리픽스 (개인화 권장 - 다른 수강생과 중복되지 않도록!)
    topicPrefix: "kiot/uniq-zenit/",

    // 연결 옵션
    options: {
      clientId: `kiot_${Math.random().toString(16).substr(2, 8)}`,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
    },
  },

  // ========================================
  // 차트 설정
  // ========================================

  chart: {
    // 차트에 표시할 최대 데이터 포인트 수
    maxDataPoints: 20,

    // 차트 색상
    lineColor: "rgb(59, 130, 246)", // blue-500
    backgroundColor: "rgba(59, 130, 246, 0.1)",

    // 차트 옵션
    animation: true,
  },

  // ========================================
  // 기능 플래그
  // ========================================

  features: {
    // Google 로그인 활성화
    enableGoogleAuth: true,

    // 이메일/비밀번호 로그인 활성화
    enableEmailAuth: true,

    // MQTT 실시간 데이터 활성화
    enableMQTT: true,

    // 온도 차트 표시 활성화
    enableTemperatureChart: true,
  },

  // ========================================
  // 텍스트/라벨 설정 (다국어 지원용)
  // ========================================

  labels: {
    ko: {
      // 인증 관련
      auth: {
        title: "로그인",
        emailLogin: "이메일/비밀번호 로그인",
        googleLogin: "Google 로그인",
        loginButton: "로그인",
        signupButton: "회원가입",
        logoutButton: "로그아웃",
        notLoggedIn: "로그인되지 않음",
        loggedIn: "로그인됨",
      },

      // 디바이스 관련
      device: {
        title: "디바이스 관리",
        add: "디바이스 추가",
        delete: "삭제",
        detail: "상세",
        count: "개의 디바이스",
        empty: "아직 디바이스가 없습니다.",
        emptyDescription: "위에서 새로운 디바이스를 추가해보세요!",

        // 필터
        filterAll: "전체",
        filterOnline: "온라인",
        filterOffline: "오프라인",

        // 상태
        online: "온라인",
        offline: "오프라인",

        // 통계
        onlineCount: "개 온라인",
        offlineCount: "개 오프라인",
        clearOffline: "오프라인 디바이스 삭제",
      },

      // MQTT 관련
      mqtt: {
        title: "MQTT 실시간 연결",
        connected: "연결됨",
        disconnected: "연결 끊김",
        connecting: "연결 중...",
        topic: "MQTT 토픽:",
        lastMessage: "마지막 메시지:",
        waitingForMessage: "메시지 대기 중...",
      },

      // 차트 관련
      chart: {
        title: "실시간 온도 데이터",
      },

      // 공통
      common: {
        back: "목록으로 돌아가기",
        save: "저장",
        cancel: "취소",
        confirm: "확인",
      },
    },

    // 영어 라벨 (향후 확장용)
    en: {
      auth: {
        title: "Login",
        emailLogin: "Email/Password Login",
        googleLogin: "Google Login",
        loginButton: "Login",
        signupButton: "Sign Up",
        logoutButton: "Logout",
        notLoggedIn: "Not logged in",
        loggedIn: "Logged in",
      },
      device: {
        title: "Device Management",
        add: "Add Device",
        delete: "Delete",
        detail: "Detail",
        count: "devices",
        empty: "No devices yet.",
        emptyDescription: "Add a new device above!",
        filterAll: "All",
        filterOnline: "Online",
        filterOffline: "Offline",
        online: "Online",
        offline: "Offline",
        onlineCount: "online",
        offlineCount: "offline",
        clearOffline: "Clear Offline Devices",
      },
      mqtt: {
        title: "MQTT Real-time Connection",
        connected: "Connected",
        disconnected: "Disconnected",
        connecting: "Connecting...",
        topic: "MQTT Topic:",
        lastMessage: "Last Message:",
        waitingForMessage: "Waiting for message...",
      },
      chart: {
        title: "Real-time Temperature Data",
      },
      common: {
        back: "Back to List",
        save: "Save",
        cancel: "Cancel",
        confirm: "Confirm",
      },
    },
  },
};

/**
 * 현재 로케일에 맞는 라벨 가져오기
 */
export const getLabels = () => {
  return appConfig.labels[appConfig.locale] || appConfig.labels.ko;
};

/**
 * 테마 색상 클래스 생성 헬퍼
 */
export const getThemeClass = (type = 'primary', variant = '500') => {
  const color = appConfig.theme[type] || appConfig.theme.primary;
  return `${color}-${variant}`;
};

/**
 * 선택된 MQTT 브로커 URL 가져오기
 */
export const getMqttBrokerUrl = () => {
  const selectedOption = appConfig.mqtt.brokerOption;
  const broker = appConfig.mqtt.brokerOptions[selectedOption];

  if (!broker) {
    console.warn(`Invalid broker option: ${selectedOption}. Using default.`);
    return appConfig.mqtt.brokerOptions["broker-option1"].url;
  }

  return broker.url;
};

/**
 * 선택된 MQTT 브로커 정보 가져오기
 */
export const getMqttBrokerInfo = () => {
  const selectedOption = appConfig.mqtt.brokerOption;
  return appConfig.mqtt.brokerOptions[selectedOption] || appConfig.mqtt.brokerOptions["broker-option1"];
};

