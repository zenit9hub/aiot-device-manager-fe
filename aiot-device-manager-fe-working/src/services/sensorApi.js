import { backendConfig } from '../config/backend.config.js';

export class SensorApiClient {
  constructor({ tokenManager, baseUrl = backendConfig.baseUrl, enabled = false }) {
    this.tokenManager = tokenManager;
    this.baseUrl = null;
    this.endpoint = backendConfig.sensorEndpoint;
    this.enabled = false;

    if (baseUrl) {
      this.setBaseUrl(baseUrl);
    }

    if (enabled) {
      this.enable();
    }
  }

  setBaseUrl(url) {
    this.baseUrl = url ? url.replace(/\/+$/, '') : null;
  }

  enable(endpoint) {
    if (endpoint) {
      this.setBaseUrl(endpoint);
    }
    this.enabled = Boolean(this.baseUrl);
  }

  disable() {
    this.enabled = false;
  }

  isEnabled() {
    return this.enabled && Boolean(this.baseUrl);
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  async sendSensorReading(payload) {
    if (!this.isEnabled()) {
      throw new Error('Backend endpoint not configured or disabled');
    }

    const token = await this.tokenManager.getToken();

    const response = await fetch(`${this.baseUrl}${this.endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let details = null;
      try {
        details = await response.json();
      } catch {
        // ignore response parsing errors
      }

      const error = new Error(`Failed to send sensor reading (status: ${response.status})`);
      error.status = response.status;
      error.details = details;
      throw error;
    }

    try {
      return await response.json();
    } catch {
      return {};
    }
  }
}
