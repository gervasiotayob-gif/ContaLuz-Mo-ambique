
export interface Appliance {
  id: string;
  name: string;
  power: number; // in Watts
  hoursPerDay: number;
  quantity: number; // Number of identical units
  category: string;
  isActive: boolean;
  model?: string;
  voltage?: string;
}

export interface Recharge {
  id: string;
  date: string;
  amount: number; // in MT
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'danger';
  date: string;
  isRead: boolean;
}

export interface UserProfile {
  name: string;
  address: string; 
  province: string;
  city: string;
  district: string;
  neighborhood: string;
  residenceType: string;
  residenceConfig: string; 
  tariffPerKWh: number; // in MT
  historicalAvgKWh: number;
  photoUrl?: string;
  notificationsEnabled: boolean;
  onboardingCompleted: boolean;
  // Alert Thresholds
  lowBalanceThresholdDays: number;
  highConsumptionThresholdPercent: number;
}

export type AppScreen = 'dashboard' | 'appliances' | 'history' | 'alerts' | 'tips' | 'settings' | 'simulator';
