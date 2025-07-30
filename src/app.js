/**
 * Firebase AIoT Device Management Application
 * 
 * Firebase 인증과 Firestore를 활용한 실시간 AIoT 디바이스 관리 애플리케이션입니다.
 * 
 * Features:
 * - Email/Password Authentication
 * - Google OAuth Authentication
 * - Real-time Device CRUD operations
 * - User-specific Device management
 * - Device status monitoring and filtering
 */

// Firebase SDK imports for authentication and Firestore
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { firebaseConfig } from './config/firebase.config';

// Initialize Firebase application
try {
  console.log('Firebase config:', firebaseConfig);
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Global variables for device management
  let currentUser = null;
  let devices = [];
  let currentFilter = 'all';
  let unsubscribeDevices = null;

  /**
   * Display user information and toggle UI sections
   * 사용자 정보를 표시하고 UI 섹션을 전환하는 함수
   * 
   * @param {Object} user - Firebase user object containing auth details
   */
  function displayUserInfo(user) {
    console.log('User state changed:', user);
    const authSection = document.getElementById("auth-section");
    const deviceSection = document.getElementById("device-section");
    const userInfoElement = document.getElementById("user-info");
    const userEmailElement = document.getElementById("user-email");
    
    if (user) {
      currentUser = user;
      authSection.classList.add('hidden');
      deviceSection.classList.remove('hidden');
      userInfoElement.textContent = `로그인됨: ${user.email}`;
      if (userEmailElement) {
        userEmailElement.textContent = user.email;
      }
      setupDeviceListeners();
    } else {
      currentUser = null;
      authSection.classList.remove('hidden');
      deviceSection.classList.add('hidden');
      userInfoElement.textContent = "Not logged in";
      if (unsubscribeDevices) {
        unsubscribeDevices();
        unsubscribeDevices = null;
      }
    }
  }

  /**
   * Set up real-time device listeners
   * 실시간 디바이스 리스너 설정
   */
  function setupDeviceListeners() {
    if (!currentUser || unsubscribeDevices) return;
    
    console.log('Setting up device listeners for user:', currentUser.uid);
    const devicesQuery = query(
      collection(db, 'devices'),
      where('userId', '==', currentUser.uid)
    );
    
    unsubscribeDevices = onSnapshot(devicesQuery, (snapshot) => {
      console.log('Firestore snapshot received, docs count:', snapshot.size);
      devices = [];
      snapshot.forEach((doc) => {
        const deviceData = { id: doc.id, ...doc.data() };
        console.log('Device data:', deviceData);
        devices.push(deviceData);
      });
      // Sort by createdAt in JavaScript since we removed orderBy from query
      devices.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });
      console.log('All devices loaded and sorted:', devices);
      renderDevices();
      updateDeviceCount();
    });
  }

  /**
   * Add a new device
   * 새 디바이스 추가
   * 
   * @param {Object} deviceData - Device information
   */
  async function addDevice(deviceData) {
    if (!currentUser || !deviceData.name?.trim()) return;
    
    try {
      await addDoc(collection(db, 'devices'), {
        name: deviceData.name.trim(),
        type: deviceData.type || 'sensor',
        status: 'offline',
        location: deviceData.location || '미지정',
        batteryLevel: deviceData.batteryLevel || 100,
        lastSeen: serverTimestamp(),
        userId: currentUser.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding device:', error);
      alert('디바이스 추가 중 오류가 발생했습니다.');
    }
  }

  /**
   * Toggle device status
   * 디바이스 상태 토글
   * 
   * @param {string} deviceId - Device document ID
   * @param {string} newStatus - New device status
   */
  async function toggleDeviceStatus(deviceId, newStatus) {
    try {
      await updateDoc(doc(db, 'devices', deviceId), {
        status: newStatus,
        lastSeen: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating device:', error);
      alert('디바이스 상태 수정 중 오류가 발생했습니다.');
    }
  }

  /**
   * Delete a device
   * 디바이스 삭제
   * 
   * @param {string} deviceId - Device document ID
   */
  async function deleteDevice(deviceId) {
    if (!confirm('디바이스를 삭제하시겠습니까?')) return;
    
    try {
      await deleteDoc(doc(db, 'devices', deviceId));
    } catch (error) {
      console.error('Error deleting device:', error);
      alert('디바이스 삭제 중 오류가 발생했습니다.');
    }
  }

  /**
   * Clear all offline devices
   * 오프라인 디바이스 모두 삭제
   */
  async function clearOfflineDevices() {
    const offlineDevices = devices.filter(device => device.status === 'offline');
    
    if (offlineDevices.length === 0) {
      alert('오프라인 디바이스가 없습니다.');
      return;
    }
    
    if (!confirm(`${offlineDevices.length}개의 오프라인 디바이스를 삭제하시겠습니까?`)) return;
    
    try {
      await Promise.all(
        offlineDevices.map(device => deleteDoc(doc(db, 'devices', device.id)))
      );
    } catch (error) {
      console.error('Error clearing offline devices:', error);
      alert('오프라인 디바이스 삭제 중 오류가 발생했습니다.');
    }
  }

  /**
   * Render devices based on current filter
   * 현재 필터에 따라 디바이스 렌더링
   */
  function renderDevices() {
    const deviceList = document.getElementById('device-list');
    const emptyState = document.getElementById('empty-state');
    if (!deviceList) return;
    
    let filteredDevices = devices;
    if (currentFilter === 'online') {
      filteredDevices = devices.filter(device => device.status === 'online');
    } else if (currentFilter === 'offline') {
      filteredDevices = devices.filter(device => device.status === 'offline');
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
          <p>${currentFilter === 'online' ? '온라인 디바이스가 없습니다.' : 
               currentFilter === 'offline' ? '오프라인 디바이스가 없습니다.' : 
               '아직 디바이스가 없습니다.'}</p>
          <p class="text-sm mt-1">${currentFilter === 'all' ? '위에서 새로운 디바이스를 추가해보세요!' : ''}</p>
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
              <span class="device-name">${escapeHtml(device.name)}</span>
              <div class="device-status">
                <span class="status-indicator">${statusIcon} ${device.status.toUpperCase()}</span>
              </div>
            </div>
            <div class="device-details">
              <span class="device-type">📱 ${device.type}</span>
              <span class="device-location">📍 ${device.location}</span>
              <span class="device-battery">${batteryIcon} ${device.batteryLevel}%</span>
              <span class="device-last-seen">🕰️ ${formatLastSeen(device.lastSeen)}</span>
            </div>
          </div>
          <div class="device-actions">
            <select onchange="toggleDeviceStatus('${device.id}', this.value)" class="status-select">
              <option value="online" ${device.status === 'online' ? 'selected' : ''}>온라인</option>
              <option value="offline" ${device.status === 'offline' ? 'selected' : ''}>오프라인</option>
              <option value="error" ${device.status === 'error' ? 'selected' : ''}>오류</option>
            </select>
            <button class="device-delete" onclick="deleteDevice('${device.id}')" title="디바이스 삭제">
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
   * Escape HTML to prevent XSS
   * HTML 이스케이프로 XSS 방지
   */
  function escapeHtml(text) {
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
   * Format last seen timestamp
   * 마지막 접속 시간 포맧팅
   */
  function formatLastSeen(timestamp) {
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

  /**
   * Update device count display
   * 디바이스 개수 표시 업데이트
   */
  function updateDeviceCount() {
    const deviceCount = document.getElementById('device-count');
    const onlineCount = document.getElementById('online-count');
    const offlineCount = document.getElementById('offline-count');
    
    const onlineDevices = devices.filter(device => device.status === 'online').length;
    const offlineDevices = devices.filter(device => device.status === 'offline').length;
    const totalDevices = devices.length;
    
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
   * Set current filter and update UI
   * 현재 필터 설정 및 UI 업데이트
   * 
   * @param {string} filter - Filter type: 'all', 'active', 'completed'
   */
  function setFilter(filter) {
    currentFilter = filter;
    
    // Update filter button styles
    document.querySelectorAll('.filter-button').forEach(btn => {
      btn.classList.remove('active');
    });
    document.getElementById(`filter-${filter}`).classList.add('active');
    
    renderDevices();
  }

  // Make functions globally available
  window.toggleDeviceStatus = toggleDeviceStatus;
  window.deleteDevice = deleteDevice;
  window.setFilter = setFilter;

  // Set up real-time auth state observer
  // 실시간 인증 상태 변경 감지 설정
  onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed:', user);
    displayUserInfo(user);
  });

  // DOM Content Loaded Event Handler
  document.addEventListener('DOMContentLoaded', () => {
    // Device app event listeners
    const deviceNameInput = document.getElementById('device-name');
    const deviceTypeSelect = document.getElementById('device-type');
    const deviceLocationInput = document.getElementById('device-location');
    const addDeviceBtn = document.getElementById('add-device');
    const clearOfflineBtn = document.getElementById('clear-offline');
    
    // Add device on button click or Enter key
    addDeviceBtn?.addEventListener('click', () => {
      const name = deviceNameInput.value.trim();
      const type = deviceTypeSelect.value;
      const location = deviceLocationInput.value.trim();
      
      if (name) {
        addDevice({ name, type, location });
        deviceNameInput.value = '';
        deviceLocationInput.value = '';
      }
    });
    
    deviceNameInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const name = deviceNameInput.value.trim();
        const type = deviceTypeSelect.value;
        const location = deviceLocationInput.value.trim();
        
        if (name) {
          addDevice({ name, type, location });
          deviceNameInput.value = '';
          deviceLocationInput.value = '';
        }
      }
    });
    
    // Clear offline devices
    clearOfflineBtn?.addEventListener('click', clearOfflineDevices);
    
    // Filter button event listeners
    document.getElementById('filter-all')?.addEventListener('click', () => setFilter('all'));
    document.getElementById('filter-online')?.addEventListener('click', () => setFilter('online'));
    document.getElementById('filter-offline')?.addEventListener('click', () => setFilter('offline'));
    
    // Header logout button
    document.getElementById('header-logout')?.addEventListener('click', async () => {
      try {
        await signOut(auth);
        console.log("Successfully signed out from header");
      } catch (error) {
        console.error("Header sign out error:", error);
        alert("Error: " + error.message);
      }
    });
    /**
     * Email/Password Login Handler
     * 이메일/비밀번호 로그인 처리
     * 
     * @throws {FirebaseAuthError} When authentication fails
     */
    document.getElementById("email-login").addEventListener("click", async () => {
      try {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const result = await signInWithEmailAndPassword(auth, email, password);
        console.log("Email sign in success:", result.user);
        alert("Successfully signed in!");
      } catch (error) {
        console.error("Email sign in error:", error);
        alert("Error: " + error.message);
      }
    });

    /**
     * Email/Password Registration Handler
     * 신규 사용자 등록 처리
     * 
     * @throws {FirebaseAuthError} When registration fails
     */
    document.getElementById("email-signup").addEventListener("click", async () => {
      try {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const result = await createUserWithEmailAndPassword(auth, email, password);
        console.log("Email sign up success:", result.user);
        alert("Successfully signed up!");
      } catch (error) {
        console.error("Email sign up error:", error);
        alert("Error: " + error.message);
      }
    });

    /**
     * Google OAuth Login Handler
     * 구글 소셜 로그인 처리
     * 
     * @throws {FirebaseAuthError} When Google sign-in fails
     */
    document.getElementById("google-login").addEventListener("click", async () => {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        console.log("Google sign in success:", result.user);
        alert("Successfully signed in with Google!");
      } catch (error) {
        console.error("Google sign in error:", error);
        alert("Error: " + error.message);
      }
    });

    /**
     * Logout Handler
     * 로그아웃 처리
     * 
     * @throws {FirebaseAuthError} When sign-out fails
     */
    document.getElementById("logout").addEventListener("click", async () => {
      try {
        await signOut(auth);
        console.log("Successfully signed out");
        alert("Successfully signed out!");
      } catch (error) {
        console.error("Sign out error:", error);
        alert("Error: " + error.message);
      }
    });
  });
} catch (error) {
  console.error('Firebase initialization error:', error);
}
