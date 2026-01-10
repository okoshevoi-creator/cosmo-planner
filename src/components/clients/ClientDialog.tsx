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
import { useSettings } from '@/context/SettingsContext';
import { Client } from '@/types';

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
}

const ClientDialog = ({ open, onOpenChange, client }: ClientDialogProps) => {
  const { addClient, updateClient, deleteClient } = useData();
  const { t } = useSettings();
  const isEditing = !!client;

  const formSchema = z.object({
    name: z.string().min(2, t('clients.validation.nameMin')),
    phone: z.string().min(6, t('clients.validation.phoneMin')),
    email: z.string().email(t('clients.validation.emailInvalid')).optional().or(z.literal('')),
    notes: z.string().optional(),
  });

  type FormData = z.infer<typeof formSchema>;

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
            {isEditing ? t('clients.editClient') : t('clients.newClient')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('clients.fullName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('clients.namePlaceholder')} {...field} />
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
                  <FormLabel>{t('clients.phone')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('clients.phonePlaceholder')} {...field} />
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
                  <FormLabel>{t('clients.emailOptional')}</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder={t('clients.emailPlaceholder')} 
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
                  <FormLabel>{t('clients.notesOptional')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('clients.notesPlaceholder')} 
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
                  {t('common.delete')}
                </Button>
              )}
              <Button type="submit" className="flex-1">
                {isEditing ? t('common.save') : t('common.add')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDialog;
