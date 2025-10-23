/**
 * ViewManager - 뷰 전환 및 상태 관리
 * 
 * 앱의 모든 뷰 전환을 중앙에서 관리하고,
 * 각 뷰의 생명주기를 제어합니다.
 */
export class ViewManager {
  constructor() {
    this.views = new Map();
    this.currentView = null;
    this.viewHistory = [];
  }

  /**
   * 뷰 등록
   * @param {string} name - 뷰 이름
   * @param {Object} view - 뷰 인스턴스
   */
  registerView(name, view) {
    this.views.set(name, view);
    view.setViewManager(this);
  }

  /**
   * 뷰 전환
   * @param {string} viewName - 전환할 뷰 이름
   * @param {Object} data - 뷰로 전달할 데이터
   */
  async navigateTo(viewName, data = {}) {
    const view = this.views.get(viewName);
    if (!view) {
      console.error(`View '${viewName}' not found`);
      return;
    }

    // 현재 뷰 정리
    if (this.currentView) {
      await this.currentView.onLeave();
      this.viewHistory.push(this.currentView.name);
    }

    // 새 뷰 활성화
    this.currentView = view;
    await view.onEnter(data);
    
  }

  /**
   * 이전 뷰로 돌아가기
   */
  async goBack() {
    if (this.viewHistory.length > 0) {
      const previousViewName = this.viewHistory.pop();
      const previousView = this.views.get(previousViewName);
      if (previousView) {
        await this.navigateTo(previousViewName);
      }
    }
  }

  /**
   * 현재 뷰 가져오기
   */
  getCurrentView() {
    return this.currentView;
  }

  /**
   * 모든 뷰 정리
   */
  async cleanup() {
    for (const [name, view] of this.views) {
      await view.onDestroy();
    }
    this.views.clear();
    this.currentView = null;
    this.viewHistory = [];
  }
}