import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, Service, Appointment, Expense } from '@/types';
import { mockClients, mockServices, mockAppointments } from '@/data/mockData';

interface DataContextType {
  clients: Client[];
  services: Service[];
  appointments: Appointment[];
  expenses: Expense[];
  
  // Client operations
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'totalVisits' | 'totalSpent'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  // Service operations
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  
  // Appointment operations
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  
  // Expense operations
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  
  // Backup operations
  exportData: () => string;
  importData: (jsonData: string) => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = 'salon-data';

const generateId = () => Math.random().toString(36).substring(2, 9);

const parseStoredData = (data: any) => {
  return {
    clients: (data.clients || []).map((c: any) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      lastVisit: c.lastVisit ? new Date(c.lastVisit) : undefined,
    })),
    services: data.services || [],
    appointments: (data.appointments || []).map((a: any) => ({
      ...a,
      date: new Date(a.date),
    })),
    expenses: (data.expenses || []).map((e: any) => ({
      ...e,
      date: new Date(e.date),
    })),
  };
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = parseStoredData(JSON.parse(stored));
        setClients(parsed.clients);
        setServices(parsed.services);
        setAppointments(parsed.appointments);
        setExpenses(parsed.expenses);
      } catch (e) {
        console.error('Failed to parse stored data:', e);
        setClients(mockClients);
        setServices(mockServices);
        setAppointments(mockAppointments);
        setExpenses([]);
      }
    } else {
      // Initialize with mock data
      setClients(mockClients);
      setServices(mockServices);
      setAppointments(mockAppointments);
      setExpenses([]);
    }
    setIsInitialized(true);
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      const data = { clients, services, appointments, expenses };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [clients, services, appointments, expenses, isInitialized]);

  // Client operations
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'totalVisits' | 'totalSpent'>) => {
    const newClient: Client = {
      ...clientData,
      id: generateId(),
      createdAt: new Date(),
      totalVisits: 0,
      totalSpent: 0,
    };
    setClients(prev => [...prev, newClient]);
  };

  const updateClient = (id: string, clientData: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...clientData } : c));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  // Service operations
  const addService = (serviceData: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...serviceData,
      id: generateId(),
    };
    setServices(prev => [...prev, newService]);
  };

  const updateService = (id: string, serviceData: Partial<Service>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...serviceData } : s));
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  // Appointment operations
  const addAppointment = (appointmentData: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: generateId(),
    };
    setAppointments(prev => [...prev, newAppointment]);
    
    // Update client stats
    const client = clients.find(c => c.id === appointmentData.clientId);
    if (client) {
      updateClient(client.id, {
        totalVisits: client.totalVisits + 1,
        totalSpent: client.totalSpent + appointmentData.price,
        lastVisit: appointmentData.date,
      });
    }
  };

  const updateAppointment = (id: string, appointmentData: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...appointmentData } : a));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  // Expense operations
  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: generateId(),
    };
    setExpenses(prev => [...prev, newExpense]);
  };

  const updateExpense = (id: string, expenseData: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...expenseData } : e));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Backup operations
  const exportData = () => {
    const data = {
      clients,
      services,
      appointments,
      expenses,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importData = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      const parsed = parseStoredData(data);
      setClients(parsed.clients);
      setServices(parsed.services);
      setAppointments(parsed.appointments);
      setExpenses(parsed.expenses);
      return true;
    } catch (e) {
      console.error('Failed to import data:', e);
      return false;
    }
  };

  return (
    <DataContext.Provider
      value={{
        clients,
        services,
        appointments,
        expenses,
        addClient,
        updateClient,
        deleteClient,
        addService,
        updateService,
        deleteService,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        addExpense,
        updateExpense,
        deleteExpense,
        exportData,
        importData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
