import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ro } from 'date-fns/locale';
import PageHeader from '@/components/layout/PageHeader';
import TodayAppointments from '@/components/dashboard/TodayAppointments';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { cn } from '@/lib/utils';
import AppointmentDialog from '@/components/appointments/AppointmentDialog';
import { Appointment } from '@/types';

const Appointments = () => {
  const { appointments } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>();

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const filteredAppointments = appointments.filter((apt) =>
    isSameDay(new Date(apt.date), selectedDate)
  );

  const goToPreviousWeek = () => {
    setWeekStart(addDays(weekStart, -7));
  };

  const goToNextWeek = () => {
    setWeekStart(addDays(weekStart, 7));
  };

  const handleAddNew = () => {
    setEditingAppointment(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-12">
        <PageHeader
          title="Programări"
          subtitle={format(selectedDate, 'EEEE, d MMMM yyyy', { locale: ro })}
          action={
            <Button size="icon" className="rounded-xl shadow-soft" onClick={handleAddNew}>
              <Plus className="h-5 w-5" />
            </Button>
          }
        />

        {/* Week Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-4 mb-6 shadow-card border border-border/50"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousWeek}
              className="p-2 rounded-xl hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <span className="text-sm font-medium text-foreground">
              {format(weekStart, 'MMMM yyyy', { locale: ro })}
            </span>
            <button
              onClick={goToNextWeek}
              className="p-2 rounded-xl hover:bg-secondary transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              const hasAppointments = appointments.some((apt) =>
                isSameDay(new Date(apt.date), day)
              );

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    'flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-300',
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-soft'
                      : isToday
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-secondary'
                  )}
                >
                  <span className="text-[10px] font-medium uppercase opacity-70">
                    {format(day, 'EEE', { locale: ro })}
                  </span>
                  <span className="text-lg font-semibold mt-0.5">
                    {format(day, 'd')}
                  </span>
                  {hasAppointments && !isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Appointments List */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-foreground">
              {filteredAppointments.length} Programări
            </h2>
          </div>
          <TodayAppointments appointments={filteredAppointments} onEdit={handleEdit} />
        </motion.section>
      </div>

      <AppointmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        appointment={editingAppointment}
        defaultDate={selectedDate}
      />
    </div>
  );
};

export default Appointments;
