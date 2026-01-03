import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useData } from '@/context/DataContext';
import { Appointment } from '@/types';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  clientId: z.string().min(1, 'Selectează un client'),
  serviceId: z.string().min(1, 'Selectează un serviciu'),
  date: z.date({ required_error: 'Selectează o dată' }),
  time: z.string().min(1, 'Introdu ora'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment;
  defaultDate?: Date;
}

const AppointmentDialog = ({ open, onOpenChange, appointment, defaultDate }: AppointmentDialogProps) => {
  const { clients, services, addAppointment, updateAppointment, deleteAppointment } = useData();
  const isEditing = !!appointment;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: '',
      serviceId: '',
      date: new Date(),
      time: '',
      notes: '',
    },
  });

  // Reset form when dialog opens with new data
  useEffect(() => {
    if (open) {
      form.reset({
        clientId: appointment?.clientId || '',
        serviceId: appointment?.serviceId || '',
        date: appointment?.date ? new Date(appointment.date) : (defaultDate || new Date()),
        time: appointment?.time || '',
        notes: appointment?.notes || '',
      });
    }
  }, [open, appointment, defaultDate, form]);

  const selectedService = services.find(s => s.id === form.watch('serviceId'));

  const onSubmit = (data: FormData) => {
    const client = clients.find(c => c.id === data.clientId);
    const service = services.find(s => s.id === data.serviceId);
    
    if (!client || !service) return;

    const appointmentData = {
      clientId: data.clientId,
      clientName: client.name,
      serviceId: data.serviceId,
      serviceName: service.name,
      date: data.date,
      time: data.time,
      duration: service.duration,
      price: service.price,
      status: 'scheduled' as const,
      notes: data.notes,
    };

    if (isEditing && appointment) {
      updateAppointment(appointment.id, appointmentData);
    } else {
      addAppointment(appointmentData);
    }

    form.reset();
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (appointment) {
      deleteAppointment(appointment.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editează Programare' : 'Programare Nouă'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serviciu</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează serviciu" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services.map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - {service.price} MDL ({service.duration} min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedService && (
              <div className="p-3 rounded-xl bg-primary/10 text-sm">
                <p className="font-medium text-primary">{selectedService.name}</p>
                <p className="text-muted-foreground">
                  {selectedService.duration} min • {selectedService.price} MDL
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP', { locale: ro })
                          ) : (
                            <span>Alege o dată</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ora</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (opțional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Adaugă note..." 
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              {isEditing && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete}
                  className="flex-1"
                >
                  Șterge
                </Button>
              )}
              <Button type="submit" className="flex-1">
                {isEditing ? 'Salvează' : 'Adaugă'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDialog;
