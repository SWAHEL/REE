export type UserRole = 'SUPERADMIN' | 'USER';

export type MeterType = 'WATER' | 'ELECTRICITY';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser extends User {
  token: string;
}

export interface District {
  id: string;
  name: string;
}

export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  secondaryPhone?: string;
  districtId: string;
}

export interface Address {
  id: string;
  street: string;
  number: string;
  districtId: string;
  clientId: string;
}

export interface Meter {
  id: string;
  identifier: string; // 9-digit string like "000000123"
  type: MeterType;
  addressId: string;
  clientId: string;
  currentIndex: number;
  lastReadingDate: string | null;
  createdAt: string;
}

export interface Reading {
  id: string;
  meterId: string;
  agentId: string;
  date: string;
  oldIndex: number;
  newIndex: number;
  consumption: number;
  type: MeterType;
  notes?: string;
}

export interface Client {
  id: string;
  externalId: string;
  name: string;
}

// Filters
export interface ReadingFilters {
  date?: string;
  districtId?: string;
  agentId?: string;
  clientId?: string;
  type?: MeterType;
  search?: string;
}

export interface MeterFilters {
  districtId?: string;
  type?: MeterType;
  search?: string;
}

export interface AgentFilters {
  districtId?: string;
  search?: string;
}

export interface UserFilters {
  role?: UserRole;
  search?: string;
}

// Dashboard stats
export interface DashboardStats {
  totalMeters: number;
  metersRead: number;
  coverageRate: number;
  todayReadings: number;
  avgWaterConsumption: number;
  avgElectricityConsumption: number;
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  readingsCount: number;
  date: string;
}

export interface ConsumptionTrend {
  month: string;
  water: number;
  electricity: number;
}
