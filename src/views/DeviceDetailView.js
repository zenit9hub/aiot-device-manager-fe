import { BaseView } from './BaseView.js';

/**
 * DeviceDetailView - 디바이스 상세 뷰
 * 
 * 디바이스 상세 정보, MQTT 연결, 실시간 차트를 관리합니다.
 */
export class DeviceDetailView extends BaseView {
  constructor() {
    super('deviceDetail', 'device-detail-screen');
    this.device = null;
    this.mqttClient = null;
    this.temperatureChart = null;
    this.temperatureData = [];
  }

  async initialize(data = {}) {
    this.device = data.device;
    if (!this.device) {
      console.error('No device data provided to DeviceDetailView');
      return;
    }

    this.setupEventListeners();
    this.populateDeviceInfo();
    this.initializeTemperatureChart();
    this.connectToMQTT(this.device.location);
  }

  async cleanup() {
    this.cleanupMQTTConnection();
    this.removeEventListeners();
  }

  /**
   * 이벤트 리스너 설정
   */
  setupEventListeners() {
    // Back button
    document.getElementById('back-to-list')?.addEventListener('click', this.handleBackClick.bind(this));
  }

  /**
   * 이벤트 리스너 제거
   */
  removeEventListeners() {
    // 실제 구현에서는 저장된 리스너 참조를 제거해야 함
  }

  /**
   * 뒤로가기 처리
   */
  handleBackClick() {
    this.navigateTo('deviceList');
  }

  /**
   * 디바이스 정보 채우기
   */
  populateDeviceInfo() {
    if (!this.device) return;

    // Update UI elements
    document.getElementById('detail-device-name').textContent = `${this.device.name} 상세정보`;
    document.getElementById('detail-device-info-name').textContent = this.device.name;
    document.getElementById('detail-device-info-type').textContent = this.device.type;
    document.getElementById('detail-device-info-status').textContent = this.device.status;
    document.getElementById('detail-device-info-location').textContent = this.device.location;
    document.getElementById('detail-device-info-battery').textContent = `${this.device.batteryLevel}%`;
    document.getElementById('detail-device-info-lastseen').textContent = this.formatLastSeen(this.device.lastSeen);
    
    // Set MQTT topic
    document.getElementById('detail-mqtt-topic').textContent = this.device.location;
  }

  /**
   * 온도 차트 초기화
   */
  initializeTemperatureChart() {
    const ctx = document.getElementById('detail-temperature-chart').getContext('2d');
    
    if (this.temperatureChart) {
      this.temperatureChart.destroy();
    }
    
    this.temperatureChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: '온도 (°C)',
          data: [],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: '온도 (°C)'
            }
          },
          x: {
            title: {
              display: true,
              text: '시간'
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    });
  }

  /**
   * MQTT 브로커에 연결
   */
  connectToMQTT(topic) {
    if (!topic) return;
    
    this.updateConnectionStatus('connecting');
    
    // MQTT broker configuration
    const brokerUrl = 'wss://test.mosquitto.org:8081';
    
    try {
      this.mqttClient = mqtt.connect(brokerUrl, {
        clientId: `aiot-device-manager-${Math.random().toString(16).substr(2, 8)}`,
        clean: true,
        reconnectPeriod: 1000
      });
      
      this.mqttClient.on('connect', () => {
        console.log('MQTT connected');
        this.updateConnectionStatus('connected');
        
        // Subscribe to the device topic
        this.mqttClient.subscribe(topic, (err) => {
          if (err) {
            console.error('MQTT subscription error:', err);
            document.getElementById('detail-mqtt-last-message').textContent = '구독 오류';
          } else {
            console.log(`Subscribed to topic: ${topic}`);
            document.getElementById('detail-mqtt-last-message').textContent = '구독 중...';
          }
        });
      });
      
      this.mqttClient.on('message', (receivedTopic, message) => {
        if (receivedTopic === topic) {
          this.handleMQTTMessage(message.toString());
        }
      });
      
      this.mqttClient.on('error', (error) => {
        console.error('MQTT error:', error);
        this.updateConnectionStatus('disconnected');
        document.getElementById('detail-mqtt-last-message').textContent = '연결 오류';
      });
      
      this.mqttClient.on('close', () => {
        console.log('MQTT connection closed');
        this.updateConnectionStatus('disconnected');
      });
      
    } catch (error) {
      console.error('MQTT connection failed:', error);
      this.updateConnectionStatus('disconnected');
      document.getElementById('detail-mqtt-last-message').textContent = '연결 실패';
    }
  }

  /**
   * MQTT 메시지 처리
   */
  handleMQTTMessage(message) {
    try {
      const data = JSON.parse(message);
      const temperature = data.temperature || data.temp || data.value;
      
      if (temperature !== undefined) {
        this.addTemperatureData(temperature);
        document.getElementById('detail-mqtt-last-message').textContent = `온도: ${temperature}°C (${new Date().toLocaleTimeString()})`;
      }
    } catch (error) {
      // Try parsing as plain number
      const temperature = parseFloat(message);
      if (!isNaN(temperature)) {
        this.addTemperatureData(temperature);
        document.getElementById('detail-mqtt-last-message').textContent = `온도: ${temperature}°C (${new Date().toLocaleTimeString()})`;
      } else {
        console.error('Failed to parse MQTT message:', message);
        document.getElementById('detail-mqtt-last-message').textContent = `메시지: ${message} (${new Date().toLocaleTimeString()})`;
      }
    }
  }

  /**
   * 차트에 온도 데이터 추가
   */
  addTemperatureData(temperature) {
    if (!this.temperatureChart) return;
    
    const now = new Date();
    
    this.temperatureData.push({
      time: now,
      value: temperature
    });
    
    // Keep only last 20 data points
    if (this.temperatureData.length > 20) {
      this.temperatureData.shift();
    }
    
    // Update chart
    this.temperatureChart.data.labels = this.temperatureData.map(d => d.time.toLocaleTimeString());
    this.temperatureChart.data.datasets[0].data = this.temperatureData.map(d => d.value);
    this.temperatureChart.update('none'); // No animation for real-time updates
  }

  /**
   * 연결 상태 업데이트
   */
  updateConnectionStatus(status) {
    const statusElement = document.getElementById('detail-mqtt-connection-status');
    const statusText = {
      'connected': '연결됨',
      'disconnected': '연결 끊김',
      'connecting': '연결 중...'
    };
    
    if (statusElement) {
      statusElement.textContent = statusText[status] || status;
      statusElement.className = `connection-status ${status}`;
    }
  }

  /**
   * MQTT 연결 및 차트 정리
   */
  cleanupMQTTConnection() {
    // Cleanup MQTT connection
    if (this.mqttClient) {
      this.mqttClient.end();
      this.mqttClient = null;
    }
    
    // Destroy chart
    if (this.temperatureChart) {
      this.temperatureChart.destroy();
      this.temperatureChart = null;
    }
    
    // Reset data
    this.temperatureData = [];
    
    // Update connection status
    this.updateConnectionStatus('disconnected');
  }

  /**
   * 마지막 접속 시간 포맷팅
   */
  formatLastSeen(timestamp) {
    if (!timestamp) return '알 수 없음';
    const now = new Date();
    const lastSeen = timestamp.toDate();
    const diffMs = now - lastSeen;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return `${diffDays}일 전`;
  }
}