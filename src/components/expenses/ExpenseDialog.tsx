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
import { useSettings } from '@/context/SettingsContext';
import { Expense } from '@/types';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  category: z.string().min(1, 'Selectează o categorie'),
  description: z.string().min(2, 'Descrierea trebuie să aibă minim 2 caractere'),
  amount: z.coerce.number().min(0.01, 'Suma trebuie să fie pozitivă'),
  date: z.date({ required_error: 'Selectează o dată' }),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense;
}

const ExpenseDialog = ({ open, onOpenChange, expense }: ExpenseDialogProps) => {
  const { addExpense, updateExpense, deleteExpense } = useData();
  const { expenseCategories } = useSettings();
  const isEditing = !!expense;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: '',
      description: '',
      amount: 0,
      date: new Date(),
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        category: expense?.category || '',
        description: expense?.description || '',
        amount: expense?.amount || 0,
        date: expense?.date ? new Date(expense.date) : new Date(),
        notes: expense?.notes || '',
      });
    }
  }, [open, expense, form]);

  const onSubmit = (data: FormData) => {
    const expenseData = {
      category: data.category,
      description: data.description,
      amount: data.amount,
      date: data.date,
      notes: data.notes,
    };

    if (isEditing && expense) {
      updateExpense(expense.id, expenseData);
    } else {
      addExpense(expenseData);
    }

    form.reset();
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (expense) {
      deleteExpense(expense.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editează Cheltuială' : 'Cheltuială Nouă'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      {expenseCategories.map(category => (
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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descriere</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Lac gel semipermanent" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sumă (MDL)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step={0.01} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

export default ExpenseDialog;
