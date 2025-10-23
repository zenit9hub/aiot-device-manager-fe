/**
 * TemperatureChart - 온도 차트 컴포넌트
 *
 * Chart.js를 사용한 실시간 온도 데이터 시각화를 담당합니다.
 */
export class TemperatureChart {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.chart = null;
    this.data = [];
    this.maxDataPoints = 20;
  }

  /**
   * 차트 초기화
   */
  initialize() {
    const canvas = document.getElementById(this.canvasId);
    if (!canvas) {
      console.error(`[Chart] Canvas not found: ${this.canvasId}`);
      return;
    }

    const ctx = canvas.getContext('2d');

    // 기존 차트 제거
    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: '온도 (°C)',
          data: [],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6
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
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });
  }

  /**
   * 데이터 추가
   */
  addData(temperature) {
    if (!this.chart) {
      console.warn('[Chart] Chart not initialized');
      return;
    }

    const now = new Date();
    const timeLabel = now.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // 데이터 추가
    this.data.push({ time: timeLabel, value: temperature });

    // 최대 데이터 포인트 제한
    if (this.data.length > this.maxDataPoints) {
      this.data.shift();
    }

    // 차트 업데이트
    this.updateChart();
  }

  /**
   * 차트 업데이트
   */
  updateChart() {
    if (!this.chart) return;

    this.chart.data.labels = this.data.map(d => d.time);
    this.chart.data.datasets[0].data = this.data.map(d => d.value);
    this.chart.update('none'); // 애니메이션 없이 빠르게 업데이트
  }

  /**
   * 차트 초기화 (데이터 제거)
   */
  clear() {
    this.data = [];
    if (this.chart) {
      this.chart.data.labels = [];
      this.chart.data.datasets[0].data = [];
      this.chart.update();
    }
  }

  /**
   * 정리
   */
  cleanup() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    this.data = [];
  }
}





