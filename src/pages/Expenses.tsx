import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Wallet, TrendingDown, Package, Wrench, Home, Zap, Megaphone, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import ExpenseDialog from '@/components/expenses/ExpenseDialog';
import { Expense } from '@/types';
import { cn } from '@/lib/utils';

const categoryConfig: Record<Expense['category'], { label: string; icon: typeof Package; color: string }> = {
  produse: { label: 'Produse', icon: Package, color: 'bg-primary/10 text-primary border-primary/20' },
  ustensile: { label: 'Ustensile', icon: Wrench, color: 'bg-accent/20 text-accent-foreground border-accent/30' },
  chirie: { label: 'Chirie', icon: Home, color: 'bg-sage/20 text-foreground border-sage/30' },
  utilitati: { label: 'Utilități', icon: Zap, color: 'bg-gold/20 text-foreground border-gold/30' },
  marketing: { label: 'Marketing', icon: Megaphone, color: 'bg-destructive/20 text-destructive border-destructive/30' },
  altele: { label: 'Altele', icon: MoreHorizontal, color: 'bg-muted text-muted-foreground border-border' },
};

const Expenses = () => {
  const { expenses } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>();
  const [activeCategory, setActiveCategory] = useState<Expense['category'] | null>(null);

  const categories = Object.keys(categoryConfig) as Expense['category'][];
  
  const filteredExpenses = activeCategory
    ? expenses.filter(e => e.category === activeCategory)
    : expenses;

  const sortedExpenses = [...filteredExpenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleAdd = () => {
    setSelectedExpense(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-12">
        <PageHeader
          title="Cheltuieli"
          subtitle={`${expenses.length} cheltuieli înregistrate`}
          action={
            <Button size="icon" className="rounded-xl shadow-soft" onClick={handleAdd}>
              <Plus className="h-5 w-5" />
            </Button>
          }
        />

        {/* Total Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-4 mb-6 border border-border/50 shadow-soft"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10">
              <TrendingDown className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Total {activeCategory ? categoryConfig[activeCategory].label : 'Cheltuieli'}
              </p>
              <p className="text-2xl font-display font-semibold text-foreground">
                {totalExpenses.toLocaleString()} MDL
              </p>
            </div>
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide"
        >
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 border',
              !activeCategory
                ? 'bg-primary text-primary-foreground border-primary shadow-soft'
                : 'bg-card text-muted-foreground border-border/50 hover:border-primary/50'
            )}
          >
            Toate
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 border',
                activeCategory === category
                  ? 'bg-primary text-primary-foreground border-primary shadow-soft'
                  : 'bg-card text-muted-foreground border-border/50 hover:border-primary/50'
              )}
            >
              {categoryConfig[category].label}
            </button>
          ))}
        </motion.div>

        {/* Expenses List */}
        <div className="space-y-3">
          {sortedExpenses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-muted-foreground"
            >
              <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Nu ai cheltuieli înregistrate</p>
              <Button variant="link" onClick={handleAdd} className="mt-2">
                Adaugă prima cheltuială
              </Button>
            </motion.div>
          ) : (
            sortedExpenses.map((expense, index) => {
              const config = categoryConfig[expense.category];
              const Icon = config.icon;
              
              return (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => handleEdit(expense)}
                  className="bg-card rounded-2xl p-4 border border-border/50 shadow-soft cursor-pointer hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('p-2.5 rounded-xl', config.color.split(' ')[0])}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium', config.color)}>
                          {config.label}
                        </span>
                      </div>
                      <h3 className="font-medium text-foreground truncate">
                        {expense.description}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(expense.date, 'd MMMM yyyy', { locale: ro })}
                      </p>
                      {expense.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          📝 {expense.notes}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-semibold text-destructive">
                        -{expense.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">MDL</p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      <ExpenseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        expense={selectedExpense}
      />
    </div>
  );
};

export default Expenses;
