import { BaseView } from './BaseView.js';
import { DeviceAddForm } from '../components/DeviceAddForm.js';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { signOut } from "firebase/auth";

/**
 * DeviceListView - 디바이스 목록 뷰
 *
 * 디바이스 CRUD 작업과 목록 표시를 관리합니다.
 */
export class DeviceListView extends BaseView {
  constructor(db, auth) {
    super('deviceList', 'device-list-screen');
    this.db = db;
    this.auth = auth;
    this.currentUser = null;
    this.devices = [];
    this.currentFilter = 'all';
    this.unsubscribeDevices = null;
    this.deviceAddForm = null;
  }

  /**
   * 뷰 표시 (오버라이드)
   */
  show() {
    // main-container도 함께 표시
    const mainContainer = document.getElementById("main-container");
    if (mainContainer) {
      mainContainer.classList.remove('hidden');
    }

    // auth-section 숨김
    const authSection = document.getElementById("auth-section");
    if (authSection) {
      authSection.classList.add('hidden');
    }

    // 기본 show 메서드 호출
    super.show();
  }

  /**
   * 뷰 숨김 (오버라이드)
   */
  hide() {
    // 기본 hide 메서드 호출
    super.hide();
  }

  async initialize(data = {}) {
    this.currentUser = data.user || this.auth.currentUser;
    if (!this.currentUser) {
      console.error('No user found in DeviceListView');
      return;
    }

    this.setupEventListeners();
    this.updateUserEmail();
    this.setupDeviceListeners();

    // DeviceAddForm 컴포넌트 초기화
    this.deviceAddForm = new DeviceAddForm((deviceData) => {
      return this.handleAddDevice(deviceData);
    });
    this.deviceAddForm.initialize();
  }

  async cleanup() {
    this.removeEventListeners();
    if (this.unsubscribeDevices) {
      this.unsubscribeDevices();
      this.unsubscribeDevices = null;
    }
    if (this.deviceAddForm) {
      this.deviceAddForm.cleanup();
      this.deviceAddForm = null;
    }
  }

  /**
   * 이벤트 리스너 설정
   */
  setupEventListeners() {
    // Add device
    const addDeviceBtn = document.getElementById('add-device');
    const deviceNameInput = document.getElementById('device-name');

    addDeviceBtn?.addEventListener('click', this.handleAddDevice.bind(this));
    deviceNameInput?.addEventListener('keypress', this.handleKeyPress.bind(this));

    // Filter buttons
    document.getElementById('filter-all')?.addEventListener('click', () => this.setFilter('all'));
    document.getElementById('filter-online')?.addEventListener('click', () => this.setFilter('online'));
    document.getElementById('filter-offline')?.addEventListener('click', () => this.setFilter('offline'));

    // Clear offline devices
    document.getElementById('clear-offline')?.addEventListener('click', this.handleClearOfflineDevices.bind(this));

    // Header logout
    document.getElementById('header-logout')?.addEventListener('click', this.handleLogout.bind(this));
  }

  /**
   * 이벤트 리스너 제거
   */
  removeEventListeners() {
    // 실제 구현에서는 저장된 리스너 참조를 제거해야 함
  }

  /**
   * 사용자 이메일 업데이트
   */
  updateUserEmail() {
    const userEmailElement = document.getElementById("user-email");
    if (userEmailElement && this.currentUser) {
      userEmailElement.textContent = this.currentUser.email;
    }
  }

  /**
   * 실시간 디바이스 리스너 설정
   */
  setupDeviceListeners() {
    if (!this.currentUser || this.unsubscribeDevices) return;

    console.log('Setting up device listeners for user:', this.currentUser.uid);
    const devicesQuery = query(
      collection(this.db, 'devices'),
      where('userId', '==', this.currentUser.uid)
    );

    this.unsubscribeDevices = onSnapshot(devicesQuery, (snapshot) => {
      console.log('Firestore snapshot received, docs count:', snapshot.size);
      this.devices = [];
      snapshot.forEach((doc) => {
        const deviceData = { id: doc.id, ...doc.data() };
        console.log('Device data:', deviceData);
        this.devices.push(deviceData);
      });

      // Sort by createdAt
      this.devices.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });

      console.log('All devices loaded and sorted:', this.devices);
      this.renderDevices();
      this.updateDeviceCount();
    });
  }

  /**
   * 디바이스 추가 처리
   */
  async handleAddDevice() {
    const deviceNameInput = document.getElementById('device-name');
    const deviceTypeSelect = document.getElementById('device-type');
    const deviceLocationInput = document.getElementById('device-location');

    const name = deviceNameInput.value.trim();
    const type = deviceTypeSelect.value;
    const location = deviceLocationInput.value.trim();

    if (name) {
      await this.addDevice({ name, type, location });
      deviceNameInput.value = '';
      deviceLocationInput.value = '';
    }
  }

  /**
   * 키 입력 처리
   */
  handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.handleAddDevice();
    }
  }

  /**
   * 디바이스 추가
   */
  async addDevice(deviceData) {
    if (!this.currentUser || !deviceData.name?.trim()) return;

    try {
      await addDoc(collection(this.db, 'devices'), {
        name: deviceData.name.trim(),
        type: deviceData.type || 'sensor',
        status: 'offline',
        location: deviceData.location || '미지정',
        batteryLevel: deviceData.batteryLevel || 100,
        lastSeen: serverTimestamp(),
        userId: this.currentUser.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding device:', error);
      alert('디바이스 추가 중 오류가 발생했습니다.');
    }
  }

  /**
   * 디바이스 상태 토글
   */
  async toggleDeviceStatus(deviceId, newStatus) {
    try {
      await updateDoc(doc(this.db, 'devices', deviceId), {
        status: newStatus,
        lastSeen: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating device:', error);
      alert('디바이스 상태 수정 중 오류가 발생했습니다.');
    }
  }

  /**
   * 디바이스 삭제
   */
  async deleteDevice(deviceId) {
    if (!confirm('디바이스를 삭제하시겠습니까?')) return;

    try {
      await deleteDoc(doc(this.db, 'devices', deviceId));
    } catch (error) {
      console.error('Error deleting device:', error);
      alert('디바이스 삭제 중 오류가 발생했습니다.');
    }
  }

  /**
   * 오프라인 디바이스 모두 삭제
   */
  async handleClearOfflineDevices() {
    const offlineDevices = this.devices.filter(device => device.status === 'offline');

    if (offlineDevices.length === 0) {
      alert('오프라인 디바이스가 없습니다.');
      return;
    }

    if (!confirm(`${offlineDevices.length}개의 오프라인 디바이스를 삭제하시겠습니까?`)) return;

    try {
      await Promise.all(
        offlineDevices.map(device => deleteDoc(doc(this.db, 'devices', device.id)))
      );
    } catch (error) {
      console.error('Error clearing offline devices:', error);
      alert('오프라인 디바이스 삭제 중 오류가 발생했습니다.');
    }
  }

  /**
   * 로그아웃 처리
   */
  async handleLogout() {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error("Header sign out error:", error);
      alert("Error: " + error.message);
    }
  }

  /**
   * 디바이스 상세 보기
   */
  openDeviceDetail(deviceId) {
    const device = this.devices.find(d => d.id === deviceId);
    if (device && this.viewManager) {
      this.navigateTo('deviceDetail', { device });
    } else if (!this.viewManager) {
      console.error('ViewManager not available for navigation');
    }
  }

  /**
   * 필터 설정
   */
  setFilter(filter) {
    this.currentFilter = filter;

    // Update filter button styles
    document.querySelectorAll('.filter-button').forEach(btn => {
      btn.classList.remove('active');
    });
    document.getElementById(`filter-${filter}`).classList.add('active');

    this.renderDevices();
  }

  /**
   * 디바이스 목록 렌더링
   */
  renderDevices() {
    const deviceList = document.getElementById('device-list');
    const emptyState = document.getElementById('empty-state');
    if (!deviceList) return;

    let filteredDevices = this.devices;
    if (this.currentFilter === 'online') {
      filteredDevices = this.devices.filter(device => device.status === 'online');
    } else if (this.currentFilter === 'offline') {
      filteredDevices = this.devices.filter(device => device.status === 'offline');
    }

    // Show/hide empty state
    if (filteredDevices.length === 0) {
      if (emptyState) {
        emptyState.style.display = 'block';
      }
      deviceList.innerHTML = `
        <div id="empty-state" class="text-center py-12 text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
          </svg>
          <p>${this.currentFilter === 'online' ? '온라인 디바이스가 없습니다.' :
               this.currentFilter === 'offline' ? '오프라인 디바이스가 없습니다.' :
               '아직 디바이스가 없습니다.'}</p>
          <p class="text-sm mt-1">${this.currentFilter === 'all' ? '위에서 새로운 디바이스를 추가해보세요!' : ''}</p>
        </div>
      `;
    } else {
      if (emptyState) {
        emptyState.style.display = 'none';
      }
      deviceList.innerHTML = filteredDevices.map((device, index) => {
        const statusColor = device.status === 'online' ? 'bg-green-100 border-green-300' :
                           device.status === 'error' ? 'bg-red-100 border-red-300' : 'bg-gray-100 border-gray-300';
        const statusIcon = device.status === 'online' ? '🟢' : device.status === 'error' ? '🔴' : '⚪';
        const batteryIcon = device.batteryLevel > 50 ? '🔋' : device.batteryLevel > 20 ? '🪫' : '🪪';

        return `
        <div class="device-item ${statusColor} fade-in" data-id="${device.id}" style="animation-delay: ${index * 0.05}s">
          <div class="device-info">
            <div class="device-header">
              <span class="device-name">${this.escapeHtml(device.name)}</span>
              <div class="device-status">
                <span class="status-indicator">${statusIcon} ${device.status.toUpperCase()}</span>
              </div>
            </div>
            <div class="device-details">
              <span class="device-type">📱 ${device.type}</span>
              <span class="device-location">📍 ${device.location}</span>
              <span class="device-battery">${batteryIcon} ${device.batteryLevel}%</span>
              <span class="device-last-seen">🕰️ ${this.formatLastSeen(device.lastSeen)}</span>
            </div>
          </div>
          <div class="device-actions">
            <button class="device-detail" onclick="deviceListView.openDeviceDetail('${device.id}')" title="상세 정보">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Detail
            </button>
            <select onchange="deviceListView.toggleDeviceStatus('${device.id}', this.value)" class="status-select">
              <option value="online" ${device.status === 'online' ? 'selected' : ''}>온라인</option>
              <option value="offline" ${device.status === 'offline' ? 'selected' : ''}>오프라인</option>
              <option value="error" ${device.status === 'error' ? 'selected' : ''}>오류</option>
            </select>
            <button class="device-delete" onclick="deviceListView.deleteDevice('${device.id}')" title="디바이스 삭제">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
      }).join('');
    }
  }

  /**
   * 디바이스 개수 업데이트
   */
  updateDeviceCount() {
    const deviceCount = document.getElementById('device-count');
    const onlineCount = document.getElementById('online-count');
    const offlineCount = document.getElementById('offline-count');

    const onlineDevices = this.devices.filter(device => device.status === 'online').length;
    const offlineDevices = this.devices.filter(device => device.status === 'offline').length;
    const totalDevices = this.devices.length;

    if (deviceCount) {
      deviceCount.textContent = `총 ${totalDevices}개의 디바이스`;
    }

    if (onlineCount) {
      onlineCount.textContent = `${onlineDevices}개 온라인`;
    }

    if (offlineCount) {
      offlineCount.textContent = `${offlineDevices}개 오프라인`;
    }
  }

  /**
   * HTML 이스케이프
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
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