export interface EvolutionInstance {
  instanceName: string;
  status: 'open' | 'close' | 'connecting';
  owner?: string;
  profileName?: string;
  profilePictureUrl?: string;
}

const EVO_URL = process.env.EVO_URL;
const GLOBAL_KEY = process.env.EVO_GLOBAL_KEY;

export class EvolutionService {
  private static async request(endpoint: string, method: string = 'GET', body?: any) {
    if (!EVO_URL || !GLOBAL_KEY) {
      throw new Error('EvoConnect: Configuração ausente (EVO_URL ou EVO_GLOBAL_KEY)');
    }

    const res = await fetch(`${EVO_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': GLOBAL_KEY,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro na API Evolution: ${res.status}`);
    }

    return res.json();
  }

  // Valida conexão global
  static async validateConnection() {
    try {
      await this.request('/instance/fetchInstances');
      return true;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  }

  // Lista todas as instâncias
  static async fetchInstances(): Promise<EvolutionInstance[]> {
    return this.request('/instance/fetchInstances');
  }

  // Cria uma nova instância
  static async createInstance(instanceName: string) {
    return this.request('/instance/create', 'POST', {
      instanceName,
      token: Math.random().toString(36).substring(7), // Token aleatório para a instância
      qrcode: true,
    });
  }

  // Deleta uma instância
  static async deleteInstance(instanceName: string) {
    return this.request(`/instance/delete/${instanceName}`, 'DELETE');
  }

  // Busca QR Code
  static async getConnectData(instanceName: string) {
    return this.request(`/instance/connect/${instanceName}`);
  }

  // Solicita Pairing Code (Experimental v2.3.7)
  static async getPairingCode(instanceName: string, phoneNumber: string) {
    // Nota: O endpoint pode variar, v2.3.x usa connect/pairingCode
    return this.request(`/instance/connect/pairingCode/${instanceName}?number=${phoneNumber}`);
  }
}
