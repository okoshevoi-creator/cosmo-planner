import { motion } from 'framer-motion';
import { Calendar, Users, TrendingUp, Clock, Wallet, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isSameDay, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/ui/stat-card';
import TodayAppointments from '@/components/dashboard/TodayAppointments';
import QuickActions from '@/components/dashboard/QuickActions';
import { useData } from '@/context/DataContext';
import { Appointment } from '@/types';
import { useState } from 'react';
import AppointmentDialog from '@/components/appointments/AppointmentDialog';

const Dashboard = () => {
  const navigate = useNavigate();
  const { appointments, clients, expenses } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>();

  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  // Today's appointments
  const todayAppointments = appointments.filter((a) =>
    isSameDay(new Date(a.date), today) && a.status === 'scheduled'
  );

  // Today's revenue from scheduled appointments
  const todayRevenue = todayAppointments.reduce((sum, a) => sum + a.price, 0);

  // Monthly stats
  const monthlyAppointments = appointments.filter((a) =>
    isWithinInterval(new Date(a.date), { start: monthStart, end: monthEnd })
  );

  const monthlyRevenue = monthlyAppointments
    .filter((a) => a.status === 'completed' || a.status === 'scheduled')
    .reduce((sum, a) => sum + a.price, 0);

  const monthlyExpenses = expenses
    .filter((e) => isWithinInterval(new Date(e.date), { start: monthStart, end: monthEnd }))
    .reduce((sum, e) => sum + e.amount, 0);

  // Calculate worked hours for today
  const workedHours = todayAppointments.reduce((sum, a) => sum + a.duration, 0) / 60;

  // Active clients this month
  const activeClients = new Set(monthlyAppointments.map((a) => a.clientId)).size;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bună dimineața';
    if (hour < 18) return 'Bună ziua';
    return 'Bună seara';
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Section */}
      <div className="gradient-hero px-4 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-display font-semibold text-foreground">
            {greeting()} ✨
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Ai {todayAppointments.length} programări pentru azi
          </p>
        </motion.div>

        {/* Quick Actions */}
        <QuickActions />
      </div>

      <div className="px-4 -mt-2">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard
            title="Programări Azi"
            value={todayAppointments.length}
            icon={<Calendar className="h-5 w-5" />}
            delay={0.1}
          />
          <StatCard
            title="Venit Azi"
            value={`${todayRevenue} MDL`}
            icon={<TrendingUp className="h-5 w-5" />}
            delay={0.2}
          />
          <StatCard
            title="Clienți Activi"
            value={activeClients}
            subtitle="Luna aceasta"
            icon={<Users className="h-5 w-5" />}
            delay={0.3}
          />
          <StatCard
            title="Ore Planificate"
            value={`${workedHours.toFixed(1)}h`}
            subtitle="Azi"
            icon={<Clock className="h-5 w-5" />}
            delay={0.4}
          />
        </div>

        {/* Monthly Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card rounded-2xl p-4 mb-6 border border-border/50 shadow-card"
        >
          <h3 className="text-sm font-semibold text-foreground mb-3">Sumar Lunar</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-lg font-bold text-primary">{monthlyRevenue} MDL</p>
              <p className="text-xs text-muted-foreground">Venituri</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-destructive">{monthlyExpenses} MDL</p>
              <p className="text-xs text-muted-foreground">Cheltuieli</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-accent">{monthlyRevenue - monthlyExpenses} MDL</p>
              <p className="text-xs text-muted-foreground">Profit</p>
            </div>
          </div>
        </motion.div>

        {/* Today's Appointments */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-foreground">
              Programări Azi
            </h2>
            <button 
              onClick={() => navigate('/appointments')}
              className="text-xs text-primary font-medium flex items-center gap-1"
            >
              Vezi toate <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <TodayAppointments appointments={todayAppointments} onEdit={handleEdit} />
        </motion.section>
      </div>

      <AppointmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        appointment={editingAppointment}
        defaultDate={today}
      />
    </div>
  );
};

export default Dashboard;
