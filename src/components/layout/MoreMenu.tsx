import { useState } from 'react';
import { Sparkles, Wallet, Settings, MoreHorizontal, X } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '@/context/SettingsContext';

const MoreMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t } = useSettings();

  const menuItems = [
    { icon: Sparkles, label: t('nav.services'), path: '/services' },
    { icon: Wallet, label: t('nav.expenses'), path: '/expenses' },
    { icon: Settings, label: t('nav.settings'), path: '/settings' },
  ];

  const isAnyActive = menuItems.some((item) => location.pathname === item.path);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all duration-300 min-w-[50px]',
          isAnyActive || isOpen
            ? 'text-primary'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <motion.div
          initial={false}
          animate={{
            scale: isAnyActive || isOpen ? 1.1 : 1,
            y: isAnyActive || isOpen ? -2 : 0,
          }}
          className={cn(
            'p-1.5 rounded-xl transition-colors duration-300',
            (isAnyActive || isOpen) && 'bg-primary/10'
          )}
        >
          {isOpen ? <X className="h-4 w-4" /> : <MoreHorizontal className="h-4 w-4" />}
        </motion.div>
        <span className="text-[9px] font-medium">{t('nav.more')}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full right-0 mb-2 z-50 bg-card border border-border rounded-2xl shadow-lg overflow-hidden min-w-[160px]"
            >
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-3 transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-muted'
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MoreMenu;
