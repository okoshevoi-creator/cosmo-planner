import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, User, CheckCircle } from 'lucide-react';
import { Appointment } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import CompleteAppointmentDialog from '@/components/appointments/CompleteAppointmentDialog';

interface TodayAppointmentsProps {
  appointments: Appointment[];
  onEdit?: (appointment: Appointment) => void;
}

const TodayAppointments = ({ appointments, onEdit }: TodayAppointmentsProps) => {
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-sage/20 text-sage border-sage/30';
      case 'cancelled':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const handleCompleteClick = (e: React.MouseEvent, appointment: Appointment) => {
    e.stopPropagation();
    setSelectedAppointment(appointment);
    setCompleteDialogOpen(true);
  };

  return (
    <div className="space-y-3">
      {appointments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-muted-foreground"
        >
          <p className="text-sm">Nu ai programări pentru azi</p>
        </motion.div>
      ) : (
        appointments.map((appointment, index) => (
          <motion.div
            key={appointment.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-card rounded-xl p-4 border border-border/50 shadow-soft cursor-pointer hover:border-primary/30 transition-colors"
            onClick={() => onEdit?.(appointment)}
          >
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center min-w-[50px]">
                <span className="text-lg font-semibold text-foreground">
                  {appointment.time}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {appointment.duration} min
                </span>
              </div>
              
              <div className="flex-1 border-l border-border/50 pl-3">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium text-sm text-foreground">
                    {appointment.clientName}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {appointment.serviceName}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-semibold text-primary">
                    {appointment.status === 'completed' && appointment.finalPrice !== undefined
                      ? appointment.finalPrice
                      : appointment.price} MDL
                  </span>
                  <div className="flex items-center gap-2">
                    {appointment.status === 'scheduled' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs gap-1"
                        onClick={(e) => handleCompleteClick(e, appointment)}
                      >
                        <CheckCircle className="h-3 w-3" />
                        Finalizat
                      </Button>
                    )}
                    <span
                      className={cn(
                        'text-[10px] px-2 py-0.5 rounded-full border font-medium',
                        getStatusColor(appointment.status)
                      )}
                    >
                      {appointment.status === 'scheduled' && 'Programat'}
                      {appointment.status === 'completed' && 'Finalizat'}
                      {appointment.status === 'cancelled' && 'Anulat'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))
      )}

      <CompleteAppointmentDialog
        open={completeDialogOpen}
        onOpenChange={setCompleteDialogOpen}
        appointment={selectedAppointment}
      />
    </div>
  );
};

export default TodayAppointments;
