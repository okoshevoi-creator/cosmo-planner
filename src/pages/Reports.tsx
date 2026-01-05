import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, Calendar, Sparkles, Wallet, DollarSign } from 'lucide-react';
import { XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from 'recharts';
import { 
  startOfDay, endOfDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  startOfYear, endOfYear, isWithinInterval, 
  format, subDays, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval
} from 'date-fns';
import { ro, ru, enUS } from 'date-fns/locale';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useData } from '@/context/DataContext';
import { useSettings } from '@/context/SettingsContext';
import { cn } from '@/lib/utils';

type PeriodType = 'month' | 'year' | 'custom';

const COLORS = ['hsl(350, 35%, 70%)', 'hsl(38, 60%, 70%)', 'hsl(140, 25%, 75%)', 'hsl(200, 50%, 60%)', 'hsl(280, 40%, 65%)', 'hsl(20, 60%, 65%)'];

const Reports = () => {
  const { appointments, clients, services, expenses } = useData();
  const { t, language } = useSettings();
  const [period, setPeriod] = useState<PeriodType>('month');
  const [customStart, setCustomStart] = useState<Date | undefined>(subDays(new Date(), 30));
  const [customEnd, setCustomEnd] = useState<Date | undefined>(new Date());

  const dateLocale = language === 'ru' ? ru : language === 'en' ? enUS : ro;

  const periodLabels: Record<PeriodType, string> = {
    month: t('reports.month'),
    year: t('reports.year'),
    custom: t('reports.custom'),
  };

  // Calculate date range based on period
  const dateRange = useMemo(() => {
    const now = new Date();
    switch (period) {
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
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
  const totalAppointmentsCount = filteredAppointments.length;
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
            label: format(month, 'MMM', { locale: dateLocale }),
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
        label: format(day, 'd'),
        revenue,
        expenses: expenseTotal,
      };
    });
  }, [dateRange, filteredAppointments, filteredExpenses, dateLocale]);

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
    const breakdown = new Map<string, number>();
    filteredExpenses.forEach(e => {
      const existing = breakdown.get(e.category) || 0;
      breakdown.set(e.category, existing + e.amount);
    });
    return Array.from(breakdown.entries()).map(([category, amount]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: amount,
    }));
  }, [filteredExpenses]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-12">
        <PageHeader
          title={t('reports.title')}
          subtitle={`${format(dateRange.start, 'd MMM', { locale: dateLocale })} - ${format(dateRange.end, 'd MMM yyyy', { locale: dateLocale })}`}
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
                  {customStart ? format(customStart, 'dd.MM.yyyy') : t('common.startDate')}
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
                  {customEnd ? format(customEnd, 'dd.MM.yyyy') : t('common.endDate')}
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
            title={t('reports.revenue')}
            value={`${totalRevenue} ${t('common.currency')}`}
            icon={<TrendingUp className="h-5 w-5" />}
            delay={0.1}
          />
          <StatCard
            title={t('reports.expenses')}
            value={`${totalExpenses} ${t('common.currency')}`}
            icon={<Wallet className="h-5 w-5" />}
            delay={0.2}
          />
          <StatCard
            title={t('reports.profit')}
            value={`${profit} ${t('common.currency')}`}
            icon={<DollarSign className="h-5 w-5" />}
            trend={profit >= 0 ? { value: 0, isPositive: true } : { value: 0, isPositive: false }}
            delay={0.3}
          />
          <StatCard
            title={t('reports.totalAppointments')}
            value={totalAppointmentsCount}
            subtitle={`${completedAppointments} ${t('common.completed')}`}
            icon={<Calendar className="h-5 w-5" />}
            delay={0.4}
          />
        </div>

        {/* Revenue vs Expenses Chart - Line Chart for mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-4 mb-6 border border-border/50 shadow-card"
        >
          <h3 className="text-sm font-semibold text-foreground mb-2">
            {t('reports.revenueVsExpenses')}
          </h3>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">{t('reports.revenue')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-xs text-muted-foreground">{t('reports.expenses')}</span>
            </div>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number, name: string) => [
                    `${value} ${t('common.currency')}`, 
                    name === 'revenue' ? t('reports.revenue') : t('reports.expenses')
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: 'hsl(var(--destructive))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Expense Breakdown - Horizontal bars for mobile */}
        {expenseBreakdown.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-card rounded-2xl p-4 mb-6 border border-border/50 shadow-card"
          >
            <h3 className="text-sm font-semibold text-foreground mb-4">
              {t('reports.expenseBreakdown')}
            </h3>
            <div className="space-y-3">
              {expenseBreakdown
                .sort((a, b) => b.value - a.value)
                .map((item, index) => {
                  const maxValue = Math.max(...expenseBreakdown.map(e => e.value));
                  const percentage = totalExpenses > 0 ? (item.value / totalExpenses) * 100 : 0;
                  const barWidth = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-foreground font-medium">{item.name}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {item.value} {t('common.currency')} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${barWidth}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
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
              {t('reports.topServices')}
            </h3>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          {topServices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('reports.noDataPeriod')}
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
                      {service.count} {t('common.reservations')}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {service.revenue} {t('common.currency')}
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
              {t('reports.loyalClients')}
            </h3>
            <Users className="h-4 w-4 text-primary" />
          </div>
          {topClientsByVisits.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('reports.noDataPeriod')}
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
                      {client.visits} {t('common.visits').toLowerCase()}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-accent">
                    {client.revenue} {t('common.currency')}
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
              {t('reports.topRevenueClients')}
            </h3>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          {topClientsByRevenue.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('reports.noDataPeriod')}
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
                      {client.visits} {t('common.visits').toLowerCase()}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {client.revenue} {t('common.currency')}
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