import { 
  User, District, Agent, Address, Meter, Reading, Client,
  ReadingFilters, MeterFilters, AgentFilters, UserFilters,
  DashboardStats, AgentPerformance, ConsumptionTrend, AuthUser
} from '@/types';
import { 
  users as initialUsers, 
  districts, 
  agents as initialAgents, 
  addresses, 
  meters as initialMeters, 
  readings as initialReadings,
  clients,
  mockCredentials 
} from './data';

// Simulated delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Storage keys
const STORAGE_KEYS = {
  USERS: 'si_releves_users',
  AGENTS: 'si_releves_agents',
  METERS: 'si_releves_meters',
  READINGS: 'si_releves_readings',
};

// Initialize data from localStorage or use defaults
const initData = <T>(key: string, defaultData: T[]): T[] => {
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultData;
    }
  }
  localStorage.setItem(key, JSON.stringify(defaultData));
  return defaultData;
};

// Mutable data stores
let usersData = initData(STORAGE_KEYS.USERS, initialUsers);
let agentsData = initData(STORAGE_KEYS.AGENTS, initialAgents);
let metersData = initData(STORAGE_KEYS.METERS, initialMeters);
let readingsData = initData(STORAGE_KEYS.READINGS, initialReadings);

// Persist data
const persistData = (key: string, data: unknown) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<AuthUser | null> => {
    await delay(500);
    const cred = mockCredentials.find(c => c.email === email && c.password === password);
    if (!cred) return null;
    
    const user = usersData.find(u => u.id === cred.userId);
    if (!user) return null;
    
    return {
      ...user,
      token: `mock-token-${user.id}-${Date.now()}`,
    };
  },
  
  changePassword: async (userId: string, oldPassword: string, newPassword: string): Promise<boolean> => {
    await delay(300);
    // In mock, just return success
    console.log(`Password changed for user ${userId}`);
    return true;
  },
};

// Districts API
export const districtsApi = {
  list: async (): Promise<District[]> => {
    await delay(200);
    return districts;
  },
};

// Users API
export const usersApi = {
  list: async (filters?: UserFilters): Promise<User[]> => {
    await delay(300);
    let result = [...usersData];
    
    if (filters?.role) {
      result = result.filter(u => u.role === filters.role);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(u => 
        u.firstName.toLowerCase().includes(search) ||
        u.lastName.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
      );
    }
    
    return result;
  },
  
  get: async (id: string): Promise<User | null> => {
    await delay(200);
    return usersData.find(u => u.id === id) || null;
  },
  
  create: async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    await delay(300);
    const newUser: User = {
      ...data,
      id: `u${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    usersData.push(newUser);
    persistData(STORAGE_KEYS.USERS, usersData);
    return newUser;
  },
  
  update: async (id: string, data: Partial<User>): Promise<User | null> => {
    await delay(300);
    const index = usersData.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    usersData[index] = {
      ...usersData[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    persistData(STORAGE_KEYS.USERS, usersData);
    return usersData[index];
  },
  
  resetPassword: async (id: string): Promise<string> => {
    await delay(300);
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  },
};

// Agents API
export const agentsApi = {
  list: async (filters?: AgentFilters): Promise<Agent[]> => {
    await delay(300);
    let result = [...agentsData];
    
    if (filters?.districtId) {
      result = result.filter(a => a.districtId === filters.districtId);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(a => 
        a.firstName.toLowerCase().includes(search) ||
        a.lastName.toLowerCase().includes(search) ||
        a.phone.includes(search)
      );
    }
    
    return result;
  },
  
  get: async (id: string): Promise<Agent | null> => {
    await delay(200);
    return agentsData.find(a => a.id === id) || null;
  },
  
  updateDistrict: async (id: string, districtId: string): Promise<Agent | null> => {
    await delay(300);
    const index = agentsData.findIndex(a => a.id === id);
    if (index === -1) return null;
    
    agentsData[index] = { ...agentsData[index], districtId };
    persistData(STORAGE_KEYS.AGENTS, agentsData);
    return agentsData[index];
  },
  
  getPerformance: async (id: string): Promise<AgentPerformance[]> => {
    await delay(400);
    const performance: AgentPerformance[] = [];
    const agent = agentsData.find(a => a.id === id);
    if (!agent) return [];
    
    const now = new Date();
    for (let i = 89; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = readingsData.filter(r => 
        r.agentId === id && r.date.startsWith(dateStr)
      ).length;
      
      performance.push({
        agentId: id,
        agentName: `${agent.firstName} ${agent.lastName}`,
        readingsCount: count,
        date: dateStr,
      });
    }
    
    return performance;
  },
};

// Meters API
export const metersApi = {
  list: async (filters?: MeterFilters): Promise<Meter[]> => {
    await delay(300);
    let result = [...metersData];
    
    if (filters?.type) {
      result = result.filter(m => m.type === filters.type);
    }
    if (filters?.districtId) {
      const addressIds = addresses.filter(a => a.districtId === filters.districtId).map(a => a.id);
      result = result.filter(m => addressIds.includes(m.addressId));
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(m => m.identifier.includes(search));
    }
    
    return result;
  },
  
  get: async (id: string): Promise<Meter | null> => {
    await delay(200);
    return metersData.find(m => m.id === id) || null;
  },
  
  getHistory: async (id: string, limit = 10): Promise<Reading[]> => {
    await delay(300);
    return readingsData
      .filter(r => r.meterId === id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  },
  
  create: async (data: { type: string; addressId: string }): Promise<Meter> => {
    await delay(300);
    const address = addresses.find(a => a.id === data.addressId);
    if (!address) throw new Error('Address not found');
    
    const identifier = String(metersData.length + 1).padStart(9, '0');
    const newMeter: Meter = {
      id: `m${Date.now()}`,
      identifier,
      type: data.type as 'WATER' | 'ELECTRICITY',
      addressId: data.addressId,
      clientId: address.clientId,
      currentIndex: 0,
      lastReadingDate: null,
      createdAt: new Date().toISOString(),
    };
    
    metersData.push(newMeter);
    persistData(STORAGE_KEYS.METERS, metersData);
    return newMeter;
  },
  
  getEligibleAddresses: async (type: string, districtId?: string, search?: string): Promise<Address[]> => {
    await delay(300);
    const meterAddressIds = metersData
      .filter(m => m.type === type)
      .map(m => m.addressId);
    
    let result = addresses.filter(a => !meterAddressIds.includes(a.id));
    
    if (districtId) {
      result = result.filter(a => a.districtId === districtId);
    }
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(a => 
        a.street.toLowerCase().includes(s) ||
        a.number.includes(s)
      );
    }
    
    return result;
  },
};

// Readings API
export const readingsApi = {
  list: async (filters?: ReadingFilters): Promise<Reading[]> => {
    await delay(300);
    let result = [...readingsData];
    
    if (filters?.date) {
      result = result.filter(r => r.date.startsWith(filters.date!));
    }
    if (filters?.type) {
      result = result.filter(r => r.type === filters.type);
    }
    if (filters?.agentId) {
      result = result.filter(r => r.agentId === filters.agentId);
    }
    if (filters?.districtId) {
      const meterIds = metersData
        .filter(m => {
          const addr = addresses.find(a => a.id === m.addressId);
          return addr?.districtId === filters.districtId;
        })
        .map(m => m.id);
      result = result.filter(r => meterIds.includes(r.meterId));
    }
    if (filters?.clientId) {
      const meterIds = metersData.filter(m => m.clientId === filters.clientId).map(m => m.id);
      result = result.filter(r => meterIds.includes(r.meterId));
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(r => {
        const meter = metersData.find(m => m.id === r.meterId);
        return meter?.identifier.includes(s);
      });
    }
    
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  
  get: async (id: string): Promise<Reading | null> => {
    await delay(200);
    return readingsData.find(r => r.id === id) || null;
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async (districtId?: string): Promise<DashboardStats> => {
    await delay(400);
    
    let filteredMeters = metersData;
    let filteredReadings = readingsData;
    
    if (districtId) {
      const addressIds = addresses.filter(a => a.districtId === districtId).map(a => a.id);
      filteredMeters = metersData.filter(m => addressIds.includes(m.addressId));
      const meterIds = filteredMeters.map(m => m.id);
      filteredReadings = readingsData.filter(r => meterIds.includes(r.meterId));
    }
    
    const today = new Date().toISOString().split('T')[0];
    const todayReadings = filteredReadings.filter(r => r.date.startsWith(today));
    
    const metersRead = new Set(filteredReadings.slice(0, 100).map(r => r.meterId)).size;
    
    const waterReadings = filteredReadings.filter(r => r.type === 'WATER');
    const elecReadings = filteredReadings.filter(r => r.type === 'ELECTRICITY');
    
    return {
      totalMeters: filteredMeters.length,
      metersRead,
      coverageRate: filteredMeters.length > 0 ? (metersRead / filteredMeters.length) * 100 : 0,
      todayReadings: todayReadings.length,
      avgWaterConsumption: waterReadings.length > 0 
        ? waterReadings.reduce((sum, r) => sum + r.consumption, 0) / waterReadings.length 
        : 0,
      avgElectricityConsumption: elecReadings.length > 0 
        ? elecReadings.reduce((sum, r) => sum + r.consumption, 0) / elecReadings.length 
        : 0,
    };
  },
  
  getReadingsPerAgent: async (districtId?: string): Promise<AgentPerformance[]> => {
    await delay(300);
    const performance: AgentPerformance[] = [];
    
    for (const agent of agentsData) {
      const count = readingsData.filter(r => r.agentId === agent.id).length;
      performance.push({
        agentId: agent.id,
        agentName: `${agent.firstName} ${agent.lastName}`,
        readingsCount: count,
        date: new Date().toISOString().split('T')[0],
      });
    }
    
    return performance.sort((a, b) => b.readingsCount - a.readingsCount);
  },
  
  getConsumptionTrends: async (): Promise<ConsumptionTrend[]> => {
    await delay(300);
    const trends: ConsumptionTrend[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = month.toISOString().slice(0, 7);
      const monthName = month.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      
      const monthReadings = readingsData.filter(r => r.date.startsWith(monthStr));
      const waterReadings = monthReadings.filter(r => r.type === 'WATER');
      const elecReadings = monthReadings.filter(r => r.type === 'ELECTRICITY');
      
      trends.push({
        month: monthName,
        water: waterReadings.length > 0 
          ? Math.round(waterReadings.reduce((sum, r) => sum + r.consumption, 0) / waterReadings.length)
          : 0,
        electricity: elecReadings.length > 0 
          ? Math.round(elecReadings.reduce((sum, r) => sum + r.consumption, 0) / elecReadings.length)
          : 0,
      });
    }
    
    return trends;
  },
};

// Clients API
export const clientsApi = {
  list: async (): Promise<Client[]> => {
    await delay(200);
    return clients;
  },
  
  get: async (id: string): Promise<Client | null> => {
    await delay(200);
    return clients.find(c => c.id === id) || null;
  },
};

// Addresses API
export const addressesApi = {
  list: async (): Promise<Address[]> => {
    await delay(200);
    return addresses;
  },
  
  get: async (id: string): Promise<Address | null> => {
    await delay(200);
    return addresses.find(a => a.id === id) || null;
  },
};
