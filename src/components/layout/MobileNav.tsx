import { Calendar, Users, BarChart3, LayoutDashboard } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useSettings } from '@/context/SettingsContext';
import MoreMenu from './MoreMenu';

const MobileNav = () => {
  const { t } = useSettings();

  const navItems = [
    { icon: LayoutDashboard, label: t('nav.home'), path: '/' },
    { icon: Calendar, label: t('nav.appointments'), path: '/appointments' },
    { icon: Users, label: t('nav.clients'), path: '/clients' },
    { icon: BarChart3, label: t('nav.reports'), path: '/reports' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all duration-300 min-w-[50px]',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    y: isActive ? -2 : 0,
                  }}
                  className={cn(
                    'p-1.5 rounded-xl transition-colors duration-300',
                    isActive && 'bg-primary/10'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </motion.div>
                <span className="text-[9px] font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
        <MoreMenu />
      </div>
    </nav>
  );
};

export default MobileNav;
