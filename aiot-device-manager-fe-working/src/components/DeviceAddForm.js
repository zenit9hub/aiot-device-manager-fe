/**
 * DeviceAddForm - 디바이스 추가 폼 컴포넌트
 *
 * 디바이스 추가 입력 폼과 유효성 검증을 담당합니다.
 */
export class DeviceAddForm {
  constructor(onAddDevice) {
    this.onAddDevice = onAddDevice;
    this.elements = {};
  }

  /**
   * 초기화
   */
  initialize() {
    this.elements = {
      nameInput: document.getElementById('device-name'),
      typeSelect: document.getElementById('device-type'),
      locationInput: document.getElementById('device-location'),
      addButton: document.getElementById('add-device')
    };

    this.setupEventListeners();
  }

  /**
   * 이벤트 리스너 설정
   */
  setupEventListeners() {
    this.elements.addButton?.addEventListener('click', () => this.handleAdd());
    this.elements.nameInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleAdd();
    });
  }

  /**
   * 디바이스 추가 처리
   */
  async handleAdd() {
    const deviceData = this.getFormData();

    if (!this.validate(deviceData)) {
      return;
    }

    await this.onAddDevice(deviceData);
    this.clearForm();
  }

  /**
   * 폼 데이터 가져오기
   */
  getFormData() {
    return {
      name: this.elements.nameInput?.value.trim() || '',
      type: this.elements.typeSelect?.value || 'sensor',
      location: this.elements.locationInput?.value.trim() || ''
    };
  }

  /**
   * 유효성 검증
   */
  validate(data) {
    if (!data.name) {
      alert('디바이스 이름을 입력해주세요.');
      return false;
    }

    if (!data.location) {
      alert('위치를 입력해주세요.');
      return false;
    }

    return true;
  }

  /**
   * 폼 초기화
   */
  clearForm() {
    if (this.elements.nameInput) this.elements.nameInput.value = '';
    if (this.elements.locationInput) this.elements.locationInput.value = '';
    if (this.elements.typeSelect) this.elements.typeSelect.value = 'sensor';
  }

  /**
   * 정리
   */
  cleanup() {
    // 이벤트 리스너는 자동으로 정리됨
  }
}



