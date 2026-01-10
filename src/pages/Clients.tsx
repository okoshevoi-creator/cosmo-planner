import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { ro, ru, enUS } from 'date-fns/locale';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useData } from '@/context/DataContext';
import { useSettings } from '@/context/SettingsContext';
import ClientDialog from '@/components/clients/ClientDialog';
import { Client } from '@/types';

const Clients = () => {
  const { clients } = useData();
  const { t, language } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>();

  const dateLocale = language === 'ru' ? ru : language === 'en' ? enUS : ro;

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );

  const handleAdd = () => {
    setSelectedClient(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-12">
        <PageHeader
          title={t('clients.title')}
          subtitle={t('clients.registered').replace('{count}', String(clients.length))}
          action={
            <Button size="icon" className="rounded-xl shadow-soft" onClick={handleAdd}>
              <Plus className="h-5 w-5" />
            </Button>
          }
        />

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('common.searchClient')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl bg-card border-border/50 shadow-soft"
          />
        </motion.div>

        {/* Clients List */}
        <div className="space-y-3">
          {filteredClients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => handleEdit(client)}
              className="bg-card rounded-2xl p-4 border border-border/50 shadow-soft cursor-pointer hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-display font-semibold text-lg">
                  {client.name.split(' ').map(n => n[0]).join('')}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    {client.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{client.phone}</span>
                  </div>

                  {client.email && (
                    <div className="flex items-center gap-2 mt-0.5 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-primary">{client.totalVisits}</p>
                      <p className="text-[10px] text-muted-foreground">{t('common.visits')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-accent">{client.totalSpent} {t('common.currency')}</p>
                      <p className="text-[10px] text-muted-foreground">{t('common.totalSpent')}</p>
                    </div>
                    {client.lastVisit && (
                      <div className="text-center flex-1">
                        <p className="text-xs font-medium text-foreground">
                          {format(client.lastVisit, 'd MMM yyyy', { locale: dateLocale })}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{t('common.lastVisit')}</p>
                      </div>
                    )}
                  </div>

                  {client.notes && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      📝 {client.notes}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <ClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={selectedClient}
      />
    </div>
  );
};

export default Clients;