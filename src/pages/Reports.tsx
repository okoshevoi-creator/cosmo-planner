import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, Calendar, Sparkles, Wallet, DollarSign } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { 
  startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, 
  startOfQuarter, endOfQuarter, startOfYear, endOfYear, isWithinInterval, 
  format, subDays, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval
} from 'date-fns';
import { ro } from 'date-fns/locale';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useData } from '@/context/DataContext';
import { cn } from '@/lib/utils';

type PeriodType = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

const periodLabels: Record<PeriodType, string> = {
  day: 'Azi',
  week: 'Săptămâna',
  month: 'Luna',
  quarter: 'Trimestru',
  year: 'Anul',
  custom: 'Personalizat',
};

const COLORS = ['hsl(350, 35%, 70%)', 'hsl(38, 60%, 70%)', 'hsl(140, 25%, 75%)', 'hsl(200, 50%, 60%)', 'hsl(280, 40%, 65%)', 'hsl(20, 60%, 65%)'];

const Reports = () => {
  const { appointments, clients, services, expenses } = useData();
  const [period, setPeriod] = useState<PeriodType>('month');
  const [customStart, setCustomStart] = useState<Date | undefined>(subDays(new Date(), 30));
  const [customEnd, setCustomEnd] = useState<Date | undefined>(new Date());

  // Calculate date range based on period
  const dateRange = useMemo(() => {
    const now = new Date();
    switch (period) {
      case 'day':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'week':
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'quarter':
        return { start: startOfQuarter(now), end: endOfQuarter(now) };
      case 'year':
        return { start: startOfYear(now), end: endOfYear(now) };
      case 'custom':
        return { 
          start: customStart ? startOfDay(customStart) : startOfMonth(now), 
          end: customEnd ? endOfDay(customEnd) : endOfMonth(now) 
        };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  }, [period, customStart, customEnd]);

  // Filter data by period
  const filteredAppointments = useMemo(() => 
    appointments.filter(a => 
      isWithinInterval(new Date(a.date), dateRange)
    ), [appointments, dateRange]);

  const filteredExpenses = useMemo(() => 
    expenses.filter(e => 
      isWithinInterval(new Date(e.date), dateRange)
    ), [expenses, dateRange]);

  // Calculate stats - only completed appointments count towards revenue
  const totalRevenue = filteredAppointments
    .filter(a => a.status === 'completed')
    .reduce((sum, a) => sum + (a.finalPrice ?? a.price), 0);

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalRevenue - totalExpenses;
  const totalAppointments = filteredAppointments.length;
  const completedAppointments = filteredAppointments.filter(a => a.status === 'completed').length;
  const cancelledAppointments = filteredAppointments.filter(a => a.status === 'cancelled').length;

  // Revenue chart data
  const revenueChartData = useMemo(() => {
    const days = eachDayOfInterval(dateRange);
    if (days.length > 31) {
      // Use weekly or monthly grouping for longer periods
      if (days.length > 90) {
        const months = eachMonthOfInterval(dateRange);
        return months.map(month => {
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          const revenue = filteredAppointments
            .filter(a => isWithinInterval(new Date(a.date), { start: monthStart, end: monthEnd }) && a.status === 'completed')
            .reduce((sum, a) => sum + (a.finalPrice ?? a.price), 0);
          const expenseTotal = filteredExpenses
            .filter(e => isWithinInterval(new Date(e.date), { start: monthStart, end: monthEnd }))
            .reduce((sum, e) => sum + e.amount, 0);
          return {
            label: format(month, 'MMM', { locale: ro }),
            revenue,
            expenses: expenseTotal,
          };
        });
      }
      const weeks = eachWeekOfInterval(dateRange, { weekStartsOn: 1 });
      return weeks.map((week, index) => {
        const weekStart = startOfWeek(week, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(week, { weekStartsOn: 1 });
        const revenue = filteredAppointments
          .filter(a => isWithinInterval(new Date(a.date), { start: weekStart, end: weekEnd }) && a.status === 'completed')
          .reduce((sum, a) => sum + (a.finalPrice ?? a.price), 0);
        const expenseTotal = filteredExpenses
          .filter(e => isWithinInterval(new Date(e.date), { start: weekStart, end: weekEnd }))
          .reduce((sum, e) => sum + e.amount, 0);
        return {
          label: `S${index + 1}`,
          revenue,
          expenses: expenseTotal,
        };
      });
    }
    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const revenue = filteredAppointments
        .filter(a => isWithinInterval(new Date(a.date), { start: dayStart, end: dayEnd }) && a.status === 'completed')
        .reduce((sum, a) => sum + (a.finalPrice ?? a.price), 0);
      const expenseTotal = filteredExpenses
        .filter(e => isWithinInterval(new Date(e.date), { start: dayStart, end: dayEnd }))
        .reduce((sum, e) => sum + e.amount, 0);
      return {
        label: format(day, 'EEE', { locale: ro }),
        revenue,
        expenses: expenseTotal,
      };
    });
  }, [dateRange, filteredAppointments, filteredExpenses]);

  // Top services (only from completed appointments)
  const topServices = useMemo(() => {
    const completedAppointmentsForServices = filteredAppointments.filter(a => a.status === 'completed');
    const serviceStats = new Map<string, { name: string; count: number; revenue: number }>();
    completedAppointmentsForServices.forEach(a => {
      const existing = serviceStats.get(a.serviceId);
      const revenue = a.finalPrice ?? a.price;
      if (existing) {
        existing.count++;
        existing.revenue += revenue;
      } else {
        serviceStats.set(a.serviceId, { name: a.serviceName, count: 1, revenue });
      }
    });
    return Array.from(serviceStats.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredAppointments]);

  // Top clients by visits (only completed)
  const topClientsByVisits = useMemo(() => {
    const completedAppointmentsForClients = filteredAppointments.filter(a => a.status === 'completed');
    const clientStats = new Map<string, { name: string; visits: number; revenue: number }>();
    completedAppointmentsForClients.forEach(a => {
      const existing = clientStats.get(a.clientId);
      const revenue = a.finalPrice ?? a.price;
      if (existing) {
        existing.visits++;
        existing.revenue += revenue;
      } else {
        clientStats.set(a.clientId, { name: a.clientName, visits: 1, revenue });
      }
    });
    return Array.from(clientStats.values())
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);
  }, [filteredAppointments]);

  // Top clients by revenue (only completed)
  const topClientsByRevenue = useMemo(() => {
    const completedAppointmentsForClients = filteredAppointments.filter(a => a.status === 'completed');
    const clientStats = new Map<string, { name: string; visits: number; revenue: number }>();
    completedAppointmentsForClients.forEach(a => {
      const existing = clientStats.get(a.clientId);
      const revenue = a.finalPrice ?? a.price;
      if (existing) {
        existing.visits++;
        existing.revenue += revenue;
      } else {
        clientStats.set(a.clientId, { name: a.clientName, visits: 1, revenue });
      }
    });
    return Array.from(clientStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredAppointments]);

  // Expense breakdown
  const expenseBreakdown = useMemo(() => {
    const categoryLabels: Record<string, string> = {
      produse: 'Produse',
      ustensile: 'Ustensile',
      chirie: 'Chirie',
      utilitati: 'Utilități',
      marketing: 'Marketing',
      altele: 'Altele',
    };
    const breakdown = new Map<string, number>();
    filteredExpenses.forEach(e => {
      const existing = breakdown.get(e.category) || 0;
      breakdown.set(e.category, existing + e.amount);
    });
    return Array.from(breakdown.entries()).map(([category, amount]) => ({
      name: categoryLabels[category] || category,
      value: amount,
    }));
  }, [filteredExpenses]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-12">
        <PageHeader
          title="Rapoarte"
          subtitle={`${format(dateRange.start, 'd MMM', { locale: ro })} - ${format(dateRange.end, 'd MMM yyyy', { locale: ro })}`}
        />

        {/* Period Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide"
        >
          {(Object.keys(periodLabels) as PeriodType[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
              className="whitespace-nowrap rounded-full"
            >
              {periodLabels[p]}
            </Button>
          ))}
        </motion.div>

        {/* Custom Date Picker */}
        {period === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex gap-2 mb-6"
          >
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  {customStart ? format(customStart, 'dd.MM.yyyy') : 'Data început'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={customStart}
                  onSelect={setCustomStart}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  {customEnd ? format(customEnd, 'dd.MM.yyyy') : 'Data sfârșit'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={customEnd}
                  onSelect={setCustomEnd}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </motion.div>
        )}

        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard
            title="Venituri"
            value={`${totalRevenue} MDL`}
            icon={<TrendingUp className="h-5 w-5" />}
            delay={0.1}
          />
          <StatCard
            title="Cheltuieli"
            value={`${totalExpenses} MDL`}
            icon={<Wallet className="h-5 w-5" />}
            delay={0.2}
          />
          <StatCard
            title="Profit"
            value={`${profit} MDL`}
            icon={<DollarSign className="h-5 w-5" />}
            trend={profit >= 0 ? { value: 0, isPositive: true } : { value: 0, isPositive: false }}
            delay={0.3}
          />
          <StatCard
            title="Programări"
            value={totalAppointments}
            subtitle={`${completedAppointments} finalizate`}
            icon={<Calendar className="h-5 w-5" />}
            delay={0.4}
          />
        </div>

        {/* Revenue vs Expenses Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-4 mb-6 border border-border/50 shadow-card"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Venituri vs Cheltuieli
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData}>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number, name: string) => [
                    `${value} MDL`, 
                    name === 'revenue' ? 'Venituri' : 'Cheltuieli'
                  ]}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Expense Breakdown */}
        {expenseBreakdown.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-card rounded-2xl p-4 mb-6 border border-border/50 shadow-card"
          >
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Distribuție Cheltuieli
            </h3>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value} MDL`, 'Sumă']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Top Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl p-4 mb-6 border border-border/50 shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              Top Servicii
            </h3>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          {topServices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nu există date pentru această perioadă
            </p>
          ) : (
            <div className="space-y-3">
              {topServices.map((service, index) => (
                <div
                  key={service.name}
                  className="flex items-center gap-3 p-2 rounded-xl bg-secondary/50"
                >
                  <span className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {service.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {service.count} rezervări
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {service.revenue} MDL
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Top Clients by Visits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-card rounded-2xl p-4 mb-6 border border-border/50 shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              Clienți Fideli (după vizite)
            </h3>
            <Users className="h-4 w-4 text-primary" />
          </div>
          {topClientsByVisits.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nu există date pentru această perioadă
            </p>
          ) : (
            <div className="space-y-3">
              {topClientsByVisits.map((client, index) => (
                <div
                  key={client.name}
                  className="flex items-center gap-3 p-2 rounded-xl bg-secondary/50"
                >
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-display font-semibold text-sm">
                    {client.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {client.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {client.visits} vizite
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-accent">
                    {client.revenue} MDL
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Top Clients by Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl p-4 border border-border/50 shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              Clienți cu cel mai mare venit
            </h3>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          {topClientsByRevenue.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nu există date pentru această perioadă
            </p>
          ) : (
            <div className="space-y-3">
              {topClientsByRevenue.map((client, index) => (
                <div
                  key={client.name}
                  className="flex items-center gap-3 p-2 rounded-xl bg-secondary/50"
                >
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-display font-semibold text-sm">
                    {client.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {client.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {client.visits} vizite
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {client.revenue} MDL
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;
