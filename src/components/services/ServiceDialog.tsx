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
import { useData } from '@/context/DataContext';
import { useSettings } from '@/context/SettingsContext';
import { Service } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, 'Numele trebuie să aibă minim 2 caractere'),
  category: z.string().min(1, 'Selectează o categorie'),
  duration: z.coerce.number().min(5, 'Durata minimă este 5 minute'),
  price: z.coerce.number().min(1, 'Prețul trebuie să fie pozitiv'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service;
}

const ServiceDialog = ({ open, onOpenChange, service }: ServiceDialogProps) => {
  const { addService, updateService, deleteService } = useData();
  const { serviceCategories } = useSettings();
  const isEditing = !!service;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: '',
      duration: 60,
      price: 0,
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: service?.name || '',
        category: service?.category || '',
        duration: service?.duration || 60,
        price: service?.price || 0,
        description: service?.description || '',
      });
    }
  }, [open, service, form]);

  const onSubmit = (data: FormData) => {
    const serviceData = {
      name: data.name,
      category: data.category,
      duration: data.duration,
      price: data.price,
      description: data.description,
    };

    if (isEditing && service) {
      updateService(service.id, serviceData);
    } else {
      addService(serviceData);
    }

    form.reset();
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (service) {
      deleteService(service.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editează Serviciu' : 'Serviciu Nou'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nume serviciu</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Tratament Facial Hidratant" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categorie</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează categorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {serviceCategories.map(category => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durată (minute)</FormLabel>
                    <FormControl>
                      <Input type="number" min={5} step={5} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preț (MDL)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descriere (opțional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ex: Hidratare profundă cu acid hialuronic" 
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

export default ServiceDialog;
