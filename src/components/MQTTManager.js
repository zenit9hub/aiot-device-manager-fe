/**
 * MQTTManager - MQTT 연결 관리 컴포넌트
 *
 * MQTT 연결, 구독, 메시지 처리를 담당합니다.
 */
export class MQTTManager {
  constructor(onMessage) {
    this.client = null;
    this.onMessage = onMessage;
    this.isConnected = false;
    this.currentTopic = null;
  }

  /**
   * MQTT 브로커에 연결
   */
  connect(brokerUrl = 'ws://broker.hivemq.com:8000/mqtt', options = {}) {
    try {
      console.log('[MQTT] Connecting to broker:', brokerUrl);

      this.client = mqtt.connect(brokerUrl, {
        clientId: `web_client_${Math.random().toString(16).substring(2, 8)}`,
        clean: true,
        ...options
      });

      this.setupEventHandlers();

    } catch (error) {
      console.error('[MQTT] Connection error:', error);
      this.updateConnectionStatus('error');
    }
  }

  /**
   * 이벤트 핸들러 설정
   */
  setupEventHandlers() {
    if (!this.client) return;

    this.client.on('connect', () => {
      console.log('[MQTT] Connected successfully');
      this.isConnected = true;
      this.updateConnectionStatus('connected');
    });

    this.client.on('error', (error) => {
      console.error('[MQTT] Error:', error);
      this.isConnected = false;
      this.updateConnectionStatus('error');
    });

    this.client.on('close', () => {
      console.log('[MQTT] Connection closed');
      this.isConnected = false;
      this.updateConnectionStatus('disconnected');
    });

    this.client.on('message', (topic, message) => {
      this.handleMessage(topic, message);
    });
  }

  /**
   * 토픽 구독
   */
  subscribe(topic) {
    if (!this.client || !this.isConnected) {
      console.warn('[MQTT] Not connected, cannot subscribe');
      return;
    }

    this.client.subscribe(topic, (err) => {
      if (err) {
        console.error('[MQTT] Subscribe error:', err);
      } else {
        console.log('[MQTT] Subscribed to:', topic);
        this.currentTopic = topic;
      }
    });
  }

  /**
   * 토픽 구독 해제
   */
  unsubscribe(topic) {
    if (!this.client) return;

    this.client.unsubscribe(topic, (err) => {
      if (err) {
        console.error('[MQTT] Unsubscribe error:', err);
      } else {
        console.log('[MQTT] Unsubscribed from:', topic);
        if (this.currentTopic === topic) {
          this.currentTopic = null;
        }
      }
    });
  }

  /**
   * 메시지 처리
   */
  handleMessage(topic, message) {
    try {
      const messageStr = message.toString();
      console.log('[MQTT] Message received:', { topic, message: messageStr });

      if (this.onMessage) {
        this.onMessage(topic, messageStr);
      }
    } catch (error) {
      console.error('[MQTT] Message handling error:', error);
    }
  }

  /**
   * 연결 상태 UI 업데이트
   */
  updateConnectionStatus(status) {
    const statusElement = document.getElementById('detail-mqtt-connection-status');
    if (!statusElement) return;

    statusElement.className = `connection-status ${status}`;

    const statusText = {
      connected: '연결됨',
      connecting: '연결 중...',
      disconnected: '연결 끊김',
      error: '오류'
    };

    statusElement.textContent = statusText[status] || '알 수 없음';
  }

  /**
   * 연결 해제
   */
  disconnect() {
    if (this.client) {
      console.log('[MQTT] Disconnecting...');
      this.client.end();
      this.client = null;
      this.isConnected = false;
      this.currentTopic = null;
    }
  }

  /**
   * 정리
   */
  cleanup() {
    this.disconnect();
  }
}





