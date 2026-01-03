import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/context/DataContext';
import { Client } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, 'Numele trebuie să aibă minim 2 caractere'),
  phone: z.string().min(6, 'Numărul de telefon trebuie să aibă minim 6 cifre'),
  email: z.string().email('Email invalid').optional().or(z.literal('')),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
}

const ClientDialog = ({ open, onOpenChange, client }: ClientDialogProps) => {
  const { addClient, updateClient, deleteClient } = useData();
  const isEditing = !!client;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: client?.name || '',
        phone: client?.phone || '',
        email: client?.email || '',
        notes: client?.notes || '',
      });
    }
  }, [open, client, form]);

  const onSubmit = (data: FormData) => {
    const clientData = {
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      notes: data.notes,
    };

    if (isEditing && client) {
      updateClient(client.id, clientData);
    } else {
      addClient(clientData);
    }

    form.reset();
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (client) {
      deleteClient(client.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editează Client' : 'Client Nou'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nume complet</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Maria Popescu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 0722 123 456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (opțional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="Ex: maria@email.com" 
                      {...field} 
                    />
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
                      placeholder="Ex: Preferă programări dimineața, alergii..." 
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

export default ClientDialog;
