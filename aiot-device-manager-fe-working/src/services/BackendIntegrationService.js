import {
  doc,
  getDoc,
  setDoc,
  deleteField,
  serverTimestamp
} from "firebase/firestore";
import { backendConfig } from '../config/backend.config.js';

const COLLECTION = 'userSettings';
const HEALTH_PATH = '/health';
const HEALTH_TIMEOUT_MS = 5000;

const normalizeEndpoint = (raw) => {
  if (!raw) {
    throw new Error('엔드포인트를 입력해주세요.');
  }

  let candidate = raw.trim();
  if (!candidate) {
    throw new Error('엔드포인트를 입력해주세요.');
  }

  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `http://${candidate}`;
  }

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch (error) {
    throw new Error('유효한 URL 형식이 아닙니다.');
  }

  let base = `${parsed.origin}${parsed.pathname}`;
  base = base.replace(/\/+$/, '');

  return base || parsed.origin;
};

const buildHealthUrl = (base) => `${base.replace(/\/+$/, '')}${HEALTH_PATH}`;

export class BackendIntegrationService {
  constructor({ db, sensorApiClient }) {
    this.db = db;
    this.sensorApiClient = sensorApiClient;
    this.listeners = new Set();
    this.currentUserId = null;
    this.enabled = false;
    this.endpoint = null;
  }

  getState() {
    return {
      enabled: this.enabled,
      endpoint: this.endpoint
    };
  }

  isEnabled() {
    return this.enabled;
  }

  getEndpoint() {
    return this.endpoint;
  }

  onChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    const snapshot = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (error) {
        console.error('BackendIntegration listener error:', error);
      }
    });
  }

  async handleAuthChange(user) {
    if (!user) {
      this.currentUserId = null;
      this.disableLocal();
      this.notify();
      return;
    }

    this.currentUserId = user.uid;
    await this.loadSettings(user.uid);
  }

  async loadSettings(uid) {
    const ref = doc(this.db, COLLECTION, uid);
    const snapshot = await getDoc(ref);

    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data.backendEnabled && data.backendEndpoint) {
        this.enableLocal(data.backendEndpoint);
        this.notify();
        return;
      }
    }

    this.disableLocal();
    this.notify();
  }

  async verifyAndEnable(uid, rawEndpoint) {
    const normalized = normalizeEndpoint(rawEndpoint);
    await this.verifyHealth(normalized);

    const ref = doc(this.db, COLLECTION, uid);
    await setDoc(ref, {
      backendEnabled: true,
      backendEndpoint: normalized,
      backendVerifiedAt: serverTimestamp()
    }, { merge: true });

    this.enableLocal(normalized);
    this.notify();
    return normalized;
  }

  async disable(uid) {
    const targetUid = uid ?? this.currentUserId;
    if (!targetUid) {
      this.disableLocal();
      this.notify();
      return;
    }

    const ref = doc(this.db, COLLECTION, targetUid);

    await setDoc(ref, {
      backendEnabled: false,
      backendEndpoint: deleteField(),
      backendVerifiedAt: deleteField(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    this.disableLocal();
    this.notify();
  }

  enableLocal(endpoint) {
    this.endpoint = endpoint;
    this.enabled = true;
    this.sensorApiClient.enable(endpoint);
  }

  disableLocal() {
    this.endpoint = null;
    this.enabled = false;
    this.sensorApiClient.disable();
    const defaultBase = backendConfig.baseUrl;
    if (defaultBase) {
      this.sensorApiClient.setBaseUrl(defaultBase);
    }
  }

  async verifyHealth(endpoint) {
    const url = buildHealthUrl(endpoint);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Health check failed with status ${response.status}`);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Health check timed out. 엔드포인트가 응답하지 않습니다.');
      }
      throw new Error(error.message || 'Health check request failed.');
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
