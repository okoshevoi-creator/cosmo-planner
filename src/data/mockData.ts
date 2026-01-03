import { Client, Service, Appointment } from '@/types';

export const mockServices: Service[] = [
  { id: '1', name: 'Tratament Facial Hidratant', category: 'Facial', duration: 60, price: 150, description: 'Hidratare profundă cu acid hialuronic' },
  { id: '2', name: 'Manichiură Semipermanentă', category: 'Unghii', duration: 90, price: 120, description: 'Aplicare gel cu durată lungă' },
  { id: '3', name: 'Pedichiură SPA', category: 'Unghii', duration: 75, price: 100, description: 'Îngrijire completă cu masaj relaxant' },
  { id: '4', name: 'Epilare cu Ceară', category: 'Epilare', duration: 45, price: 80, description: 'Epilare profesională zone multiple' },
  { id: '5', name: 'Masaj Facial Anti-Aging', category: 'Facial', duration: 45, price: 130, description: 'Tehnici de lifting natural' },
  { id: '6', name: 'Tratament Acnee', category: 'Facial', duration: 60, price: 180, description: 'Curățare profundă și tratament' },
  { id: '7', name: 'Extensii Gene', category: 'Gene', duration: 120, price: 250, description: 'Aspect natural sau dramatic' },
  { id: '8', name: 'Laminare Gene', category: 'Gene', duration: 60, price: 150, description: 'Lifting și hrănire gene naturale' },
];

export const mockClients: Client[] = [
  { id: '1', name: 'Maria Popescu', phone: '0722 123 456', email: 'maria@email.com', createdAt: new Date('2024-01-15'), lastVisit: new Date('2024-12-28'), totalVisits: 12, totalSpent: 1850, notes: 'Preferă programări dimineața' },
  { id: '2', name: 'Elena Ionescu', phone: '0733 234 567', email: 'elena@email.com', createdAt: new Date('2024-03-20'), lastVisit: new Date('2024-12-30'), totalVisits: 8, totalSpent: 1200, notes: 'Alergii la parfum' },
  { id: '3', name: 'Ana Dumitrescu', phone: '0744 345 678', createdAt: new Date('2024-06-10'), lastVisit: new Date('2024-12-25'), totalVisits: 5, totalSpent: 680 },
  { id: '4', name: 'Cristina Marin', phone: '0755 456 789', email: 'cristina@email.com', createdAt: new Date('2024-08-05'), lastVisit: new Date('2024-12-29'), totalVisits: 4, totalSpent: 520 },
  { id: '5', name: 'Diana Stan', phone: '0766 567 890', createdAt: new Date('2024-10-12'), lastVisit: new Date('2024-12-27'), totalVisits: 3, totalSpent: 350 },
];

export const mockAppointments: Appointment[] = [
  { id: '1', clientId: '1', clientName: 'Maria Popescu', serviceId: '1', serviceName: 'Tratament Facial Hidratant', date: new Date(), time: '09:00', duration: 60, price: 150, status: 'scheduled' },
  { id: '2', clientId: '2', clientName: 'Elena Ionescu', serviceId: '7', serviceName: 'Extensii Gene', date: new Date(), time: '10:30', duration: 120, price: 250, status: 'scheduled' },
  { id: '3', clientId: '3', clientName: 'Ana Dumitrescu', serviceId: '2', serviceName: 'Manichiură Semipermanentă', date: new Date(), time: '14:00', duration: 90, price: 120, status: 'scheduled' },
  { id: '4', clientId: '4', clientName: 'Cristina Marin', serviceId: '5', serviceName: 'Masaj Facial Anti-Aging', date: new Date(), time: '16:00', duration: 45, price: 130, status: 'scheduled' },
];

export const getWeeklyStats = () => {
  const days = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'];
  return days.map((day, index) => ({
    day,
    appointments: Math.floor(Math.random() * 6) + 2,
    revenue: Math.floor(Math.random() * 800) + 300,
  }));
};
