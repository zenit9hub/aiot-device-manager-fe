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
    
    // 온도 센서의 경우 특정 토픽 사용
    const mqttTopic = this.device.type === 'sensor' ? 'kiot/zenit/notebook/temp-sensor' : `kiot/${this.device.location}/sensor/temperature`;
    this.connectToMQTT(mqttTopic);
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
    if (this.viewManager) {
      this.navigateTo('deviceList');
    } else {
      console.error('ViewManager not available for navigation');
    }
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
        animation: {
          duration: 0 // 실시간 업데이트를 위해 애니메이션 비활성화
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 15, // 일반적인 실내 온도 범위
            max: 40,
            title: {
              display: true,
              text: '온도 (°C)'
            },
            ticks: {
              callback: function(value) {
                return value + '°C';
              }
            }
          },
          x: {
            title: {
              display: true,
              text: '시간'
            },
            ticks: {
              maxTicksLimit: 8 // 최대 8개 시간 라벨만 표시
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              title: function(context) {
                const dataIndex = context[0].dataIndex;
                const data = context[0].chart.data.datasets[0].data;
                return `시간: ${context[0].label}`;
              },
              label: function(context) {
                return `온도: ${context.parsed.y}°C`;
              }
            }
          }
        },
        elements: {
          point: {
            radius: 4,
            hoverRadius: 6
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
    
    // MQTT 토픽 UI에 표시
    document.getElementById('detail-mqtt-topic').textContent = topic;
    
    // MQTT broker configuration - EMQX public broker
    const brokerUrl = 'wss://broker.emqx.io:8084/mqtt';
    
    try {
      this.mqttClient = mqtt.connect(brokerUrl, {
        clientId: `aiot-device-manager-${Math.random().toString(16).substring(2, 10)}`,
        clean: true,
        reconnectPeriod: 3000,
        connectTimeout: 5000,
        keepalive: 60,
        username: '', // EMQX public broker는 인증 불필요
        password: ''
      });
      
      this.mqttClient.on('connect', () => {
        console.log('MQTT connected to broker.emqx.io');
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
        document.getElementById('detail-mqtt-last-message').textContent = `연결 오류: ${error.message || error}`;
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
      console.log('Received MQTT data:', data);
      
      // 온도 데이터 파싱
      const temperature = data.temperature;
      const baseTemperature = data.baseTemperature;
      const variation = data.variation;
      const timestamp = data.timestamp;
      const city = data.city;
      const source = data.source;
      const lastRealUpdate = data.lastRealUpdate;
      
      if (temperature !== undefined) {
        // 차트에 온도 데이터 추가
        this.addTemperatureData(temperature, timestamp);
        
        // 상세한 메시지 표시
        const messageTime = timestamp ? new Date(timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();
        const variationText = variation !== undefined ? ` (${variation > 0 ? '+' : ''}${variation}°C)` : '';
        
        document.getElementById('detail-mqtt-last-message').innerHTML = `
          <div class="space-y-1">
            <div><strong>현재 온도:</strong> ${temperature}°C${variationText}</div>
            <div><strong>기준 온도:</strong> ${baseTemperature}°C</div>
            <div><strong>위치:</strong> ${city || 'Unknown'}</div>
            <div><strong>소스:</strong> ${source || 'Unknown'}</div>
            <div><strong>수신 시간:</strong> ${messageTime}</div>
            ${lastRealUpdate ? `<div class="text-xs text-gray-500"><strong>실제 업데이트:</strong> ${new Date(lastRealUpdate).toLocaleString()}</div>` : ''}
          </div>
        `;
        
        // 온도 변화 상태 표시
        this.updateTemperatureStatus(temperature, baseTemperature, variation);
      } else {
        document.getElementById('detail-mqtt-last-message').textContent = `Data: ${message}`;
      }
    } catch (error) {
      // Try parsing as plain number for backwards compatibility
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
  addTemperatureData(temperature, timestamp = null) {
    if (!this.temperatureChart) return;
    
    const time = timestamp ? new Date(timestamp) : new Date();
    
    this.temperatureData.push({
      time: time,
      value: temperature,
      timestamp: timestamp
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
   * 온도 상태 업데이트
   */
  updateTemperatureStatus(temperature, baseTemperature, variation) {
    // 기본 정보 섹션의 온도 정보도 업데이트
    const tempStatusElement = document.getElementById('detail-device-info-status');
    if (tempStatusElement) {
      let statusClass = 'text-green-600';
      
      // 온도 변화에 따른 상태 결정
      if (variation !== undefined && Math.abs(variation) > 2) {
        statusClass = variation > 0 ? 'text-red-600' : 'text-blue-600';
      }
      
      // 기준 온도와의 비교 정보도 포함
      const baseInfo = baseTemperature !== undefined ? ` (기준: ${baseTemperature}°C)` : '';
      tempStatusElement.textContent = `온라인 (${temperature}°C)${baseInfo}`;
      tempStatusElement.className = `font-semibold ${statusClass}`;
    }

    // 배터리 정보도 업데이트 (온도 센서는 일반적으로 배터리 사용)
    const batteryElement = document.getElementById('detail-device-info-battery');
    if (batteryElement && !batteryElement.textContent.includes('%')) {
      // 온도 센서의 배터리 레벨을 추정 (실제로는 MQTT 데이터에서 와야 함)
      const estimatedBattery = Math.max(50, 100 - Math.floor(Math.random() * 30));
      batteryElement.textContent = `${estimatedBattery}%`;
      
      // 배터리 색상 표시
      if (estimatedBattery > 70) {
        batteryElement.className = 'font-semibold text-green-600';
      } else if (estimatedBattery > 30) {
        batteryElement.className = 'font-semibold text-yellow-600';
      } else {
        batteryElement.className = 'font-semibold text-red-600';
      }
    }

    // 마지막 접속 시간 업데이트
    const lastSeenElement = document.getElementById('detail-device-info-lastseen');
    if (lastSeenElement) {
      lastSeenElement.textContent = new Date().toLocaleString();
      lastSeenElement.className = 'font-semibold text-gray-800';
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