import { BaseView } from './BaseView.js';
import { MQTTManager } from '../components/MQTTManager.js';
import { TemperatureChart } from '../components/TemperatureChart.js';
import { appConfig, getMqttBrokerUrl } from '../config/app.config.js';

/**
 * DeviceDetailView - 디바이스 상세 뷰 (리팩토링)
 *
 * MQTT 실시간 데이터와 차트에 집중
 */
export class DeviceDetailView extends BaseView {
  constructor() {
    super('deviceDetail', 'device-detail-screen');
    this.device = null;
    this.mqttManager = null;
    this.temperatureChart = null;
  }

  async initialize(data = {}) {
    this.device = data.device;
    if (!this.device) {
      console.error('[DeviceDetail] No device data provided');
      return;
    }

    this.setupEventListeners();
    this.updateDeviceTitle();
    this.initializeComponents();
  }

  /**
   * 컴포넌트 초기화
   */
  initializeComponents() {
    // MQTT Manager 초기화
    this.mqttManager = new MQTTManager((topic, message) => {
      this.handleMQTTMessage(topic, message);
    });

    // MQTT 브로커 URL을 config에서 가져오기
    const brokerUrl = getMqttBrokerUrl();
    // topicPrefix에 이미 /가 포함되어 있을 수 있으므로 처리
    const prefix = appConfig.mqtt.topicPrefix.endsWith('/')
      ? appConfig.mqtt.topicPrefix
      : `${appConfig.mqtt.topicPrefix}/`;
    const topic = `${prefix}${this.device.location}`;

    console.log('='.repeat(60));
    console.log('[DeviceDetail] MQTT 연결 정보:');
    console.log(`  브로커: ${brokerUrl}`);
    console.log(`  토픽: ${topic}`);
    console.log(`  디바이스 위치: ${this.device.location}`);
    console.log('='.repeat(60));

    // MQTT 연결 및 구독
    this.mqttManager.connect(brokerUrl, appConfig.mqtt.options);
    this.mqttManager.subscribe(topic);

    // MQTT 토픽 표시
    const topicElement = document.getElementById('detail-mqtt-topic');
    if (topicElement) {
      topicElement.textContent = topic;
    }

    // 차트 초기화
    this.temperatureChart = new TemperatureChart('detail-temperature-chart');
    this.temperatureChart.initialize();
  }

  /**
   * MQTT 메시지 처리
   */
  handleMQTTMessage(topic, message) {
    console.log(`[DeviceDetail] 📨 메시지 수신:`, { topic, message });

    try {
      // 메시지 표시
      const messageElement = document.getElementById('detail-mqtt-last-message');
      if (messageElement) {
        const timestamp = new Date().toLocaleTimeString('ko-KR');
        messageElement.textContent = `[${timestamp}] ${message}`;
      }

      // JSON 파싱 시도
      const data = JSON.parse(message);
      console.log('[DeviceDetail] 📊 파싱된 데이터:', data);

      // 온도 데이터가 있으면 차트에 추가
      if (data.temperature !== undefined) {
        console.log(`[DeviceDetail] 🌡️ 온도 데이터 추가: ${data.temperature}°C`);
        this.temperatureChart.addData(data.temperature);
      } else {
        console.warn('[DeviceDetail] ⚠️ 온도 데이터가 없습니다:', data);
      }
    } catch (error) {
      // JSON이 아닌 경우 그냥 표시만
      console.log('[DeviceDetail] Non-JSON message:', message);
    }
  }

  /**
   * 디바이스 타이틀 업데이트
   */
  updateDeviceTitle() {
    const titleElement = document.getElementById('detail-device-name');
    if (titleElement) {
      titleElement.textContent = `${this.device.name} - 실시간 모니터링`;
    }
  }

  /**
   * 이벤트 리스너 설정
   */
  setupEventListeners() {
    const backButton = document.getElementById('back-to-list');
    if (backButton) {
      backButton.addEventListener('click', () => this.handleBack());
    }
  }

  /**
   * 뒤로가기
   */
  handleBack() {
    if (this.viewManager) {
      this.navigateTo('deviceList');
    }
  }

  /**
   * 이벤트 리스너 제거
   */
  removeEventListeners() {
    // 필요시 구현
  }

  /**
   * 정리
   */
  async cleanup() {
    if (this.mqttManager) {
      this.mqttManager.cleanup();
      this.mqttManager = null;
    }

    if (this.temperatureChart) {
      this.temperatureChart.cleanup();
      this.temperatureChart = null;
    }
  }
}
