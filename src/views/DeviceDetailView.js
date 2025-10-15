import { BaseView } from './BaseView.js';
import { MQTTManager } from '../components/MQTTManager.js';
import { TemperatureChart } from '../components/TemperatureChart.js';

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

    // MQTT 연결 및 구독
    this.mqttManager.connect('wss://test.mosquitto.org:8081');
    this.mqttManager.subscribe(this.device.location);

    // MQTT 토픽 표시
    const topicElement = document.getElementById('detail-mqtt-topic');
    if (topicElement) {
      topicElement.textContent = this.device.location;
    }

    // 차트 초기화
    this.temperatureChart = new TemperatureChart('detail-temperature-chart');
    this.temperatureChart.initialize();
  }

  /**
   * MQTT 메시지 처리
   */
  handleMQTTMessage(topic, message) {
    try {
      // 메시지 표시
      const messageElement = document.getElementById('detail-mqtt-last-message');
      if (messageElement) {
        const timestamp = new Date().toLocaleTimeString('ko-KR');
        messageElement.textContent = `[${timestamp}] ${message}`;
      }

      // JSON 파싱 시도
      const data = JSON.parse(message);

      // 온도 데이터가 있으면 차트에 추가
      if (data.temperature !== undefined) {
        this.temperatureChart.addData(data.temperature);
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
