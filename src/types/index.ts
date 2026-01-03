export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: Date;
  lastVisit?: Date;
  totalVisits: number;
  totalSpent: number;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  duration: number; // in minutes
  price: number;
  description?: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  serviceId: string;
  serviceName: string;
  date: Date;
  time: string;
  duration: number;
  price: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: Date;
  notes?: string;
}

export interface DailyStats {
  date: Date;
  appointments: number;
  revenue: number;
  newClients: number;
}
