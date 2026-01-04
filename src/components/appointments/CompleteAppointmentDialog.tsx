import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useData } from '@/context/DataContext';
import { Appointment } from '@/types';

interface CompleteAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
}

const CompleteAppointmentDialog = ({
  open,
  onOpenChange,
  appointment,
}: CompleteAppointmentDialogProps) => {
  const { updateAppointment } = useData();
  const [finalPrice, setFinalPrice] = useState('');

  useEffect(() => {
    if (appointment && open) {
      setFinalPrice(appointment.price.toString());
    }
  }, [appointment, open]);

  const handleComplete = () => {
    if (!appointment) return;

    updateAppointment(appointment.id, {
      status: 'completed',
      finalPrice: parseFloat(finalPrice) || appointment.price,
    });

    onOpenChange(false);
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Finalizare programare
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <p className="text-sm font-medium">{appointment.clientName}</p>
            <p className="text-sm text-muted-foreground">{appointment.serviceName}</p>
            <p className="text-xs text-muted-foreground">
              Preț inițial: {appointment.price} MDL
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="finalPrice">Suma finală (MDL)</Label>
            <Input
              id="finalPrice"
              type="number"
              value={finalPrice}
              onChange={(e) => setFinalPrice(e.target.value)}
              placeholder="Introduceți suma finală"
              className="text-lg font-semibold"
            />
            <p className="text-xs text-muted-foreground">
              Această sumă va fi contabilizată la venituri
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anulează
          </Button>
          <Button onClick={handleComplete} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Finalizează
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompleteAppointmentDialog;
