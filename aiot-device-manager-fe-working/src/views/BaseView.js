/**
 * BaseView - 모든 뷰의 기본 클래스
 * 
 * 각 뷰가 구현해야 할 공통 인터페이스를 정의합니다.
 */
export class BaseView {
  constructor(name, elementId) {
    this.name = name;
    this.elementId = elementId;
    this.element = document.getElementById(elementId);
    this.viewManager = null;
    this.isActive = false;
  }

  /**
   * ViewManager 설정
   * @param {ViewManager} viewManager 
   */
  setViewManager(viewManager) {
    this.viewManager = viewManager;
  }

  /**
   * 뷰 진입 시 호출
   * @param {Object} data - 전달받은 데이터
   */
  async onEnter(data = {}) {
    this.show();
    this.isActive = true;
    await this.initialize(data);
  }

  /**
   * 뷰 이탈 시 호출
   */
  async onLeave() {
    this.hide();
    this.isActive = false;
    await this.cleanup();
  }

  /**
   * 뷰 파괴 시 호출
   */
  async onDestroy() {
    await this.cleanup();
    this.element = null;
    this.viewManager = null;
  }

  /**
   * 뷰 초기화 (하위 클래스에서 구현)
   * @param {Object} data 
   */
  async initialize(data = {}) {
    // Override in subclasses
  }

  /**
   * 뷰 정리 (하위 클래스에서 구현)
   */
  async cleanup() {
    // Override in subclasses
  }

  /**
   * 뷰 표시
   */
  show() {
    if (this.element) {
      this.element.classList.remove('hidden');
      this.element.classList.add('active');
    }
  }

  /**
   * 뷰 숨김
   */
  hide() {
    if (this.element) {
      this.element.classList.add('hidden');
      this.element.classList.remove('active');
    }
  }

  /**
   * 다른 뷰로 이동
   * @param {string} viewName 
   * @param {Object} data 
   */
  navigateTo(viewName, data = {}) {
    if (this.viewManager) {
      this.viewManager.navigateTo(viewName, data);
    }
  }

  /**
   * 이전 뷰로 돌아가기
   */
  goBack() {
    if (this.viewManager) {
      this.viewManager.goBack();
    }
  }
}