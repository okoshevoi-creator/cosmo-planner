import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import ServiceDialog from '@/components/services/ServiceDialog';
import { Service } from '@/types';
import { cn } from '@/lib/utils';

const categoryColors: Record<string, string> = {
  'Facial': 'bg-primary/10 text-primary border-primary/20',
  'Unghii': 'bg-accent/20 text-accent-foreground border-accent/30',
  'Epilare': 'bg-sage/20 text-foreground border-sage/30',
  'Gene': 'bg-gold/20 text-foreground border-gold/30',
};

const Services = () => {
  const { services } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | undefined>();
  
  const categories = [...new Set(services.map((s) => s.category))];
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredServices = activeCategory
    ? services.filter((s) => s.category === activeCategory)
    : services;

  const handleAdd = () => {
    setSelectedService(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-12">
        <PageHeader
          title="Servicii"
          subtitle={`${services.length} servicii disponibile`}
          action={
            <Button size="icon" className="rounded-xl shadow-soft" onClick={handleAdd}>
              <Plus className="h-5 w-5" />
            </Button>
          }
        />

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
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
              {category}
            </button>
          ))}
        </motion.div>

        {/* Services Grid */}
        <div className="grid gap-4">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => handleEdit(service)}
              className="bg-card rounded-2xl p-4 border border-border/50 shadow-soft relative overflow-hidden cursor-pointer hover:border-primary/30 transition-colors"
            >
              <div className="absolute top-0 right-0 w-24 h-24 gradient-primary opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={cn(
                        'text-[10px] px-2 py-0.5 rounded-full border font-medium',
                        categoryColors[service.category] || 'bg-muted text-muted-foreground'
                      )}
                    >
                      {service.category}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-foreground mb-1">
                    {service.name}
                  </h3>
                  
                  {service.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {service.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{service.duration} min</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-display font-semibold text-primary">
                    {service.price}
                  </p>
                  <p className="text-xs text-muted-foreground">MDL</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <ServiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        service={selectedService}
      />
    </div>
  );
};

export default Services;
