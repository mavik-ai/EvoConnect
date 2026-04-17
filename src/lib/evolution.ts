import fs from 'fs';
import path from 'path';

export interface EvolutionInstance {
  instanceName: string;
  status: 'open' | 'close' | 'connecting';
}

export interface EvoSettings {
  url: string;
  globalKey: string;
}

const SETTINGS_FILE = path.join(process.cwd(), 'src', 'data', 'settings.json');

export const getSettings = (): EvoSettings => {
  // Configured in memory/ENV takes highest priority
  if (process.env.EVO_URL && process.env.EVO_GLOBAL_KEY) {
    return {
      url: process.env.EVO_URL,
      globalKey: process.env.EVO_GLOBAL_KEY,
    };
  }

  // Backup: Local JSON file for local configurations
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Lendo config falhou', err);
  }

  return { url: '', globalKey: '' };
};

export const saveSettings = (settings: EvoSettings) => {
  try {
    fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return true;
  } catch (err) {
    console.error('Saving config falhou', err);
    return false;
  }
};

export const EvolutionService = {
  get baseUrl() {
    return getSettings().url.replace(/\/$/, '');
  },

  get apiKey() {
    return getSettings().globalKey;
  },

  async request(endpoint: string, options: RequestInit = {}) {
    const url = this.baseUrl;
    const key = this.apiKey;

    if (!url || !key) {
      throw new Error('Evolution API Credentials not configured.');
    }

    const res = await fetch(`${url}${endpoint}`, {
      ...options,
      headers: {
        'apikey': key,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Evolution API Error: ${res.status}`);
    }

    return res.json();
  },

  async validateConnection(urlTest: string, keyTest: string) {
    const res = await fetch(`${urlTest.replace(/\/$/, '')}/instance/fetchInstances`, {
      headers: { 'apikey': keyTest },
    });
    return res.ok;
  },

  async getInstances() {
    return this.request('/instance/fetchInstances');
  },

  async createInstance(name: string) {
    return this.request('/instance/create', {
      method: 'POST',
      body: JSON.stringify({
        instanceName: name,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS'
      }),
    });
  },

  async getConnectData(name: string) {
    return this.request(`/instance/connect/${name}`);
  },

  async getPairingCode(name: string, number: string) {
    return this.request(`/instance/connect/${name}?number=${encodeURIComponent(number)}`);
  },

  async deleteInstance(name: string) {
    return this.request(`/instance/delete/${name}`, {
      method: 'DELETE',
    });
  }
};
