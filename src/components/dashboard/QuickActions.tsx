import { motion } from 'framer-motion';
import { Plus, Calendar, UserPlus, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const actions = [
  { icon: Plus, label: 'Programare Nouă', color: 'bg-primary', path: '/appointments' },
  { icon: UserPlus, label: 'Client Nou', color: 'bg-accent', path: '/clients' },
  { icon: Sparkles, label: 'Servicii', color: 'bg-sage', path: '/services' },
  { icon: Calendar, label: 'Calendar', color: 'bg-gold', path: '/appointments' },
];

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action, index) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          onClick={() => navigate(action.path)}
          className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-card transition-all duration-300 active:scale-95"
        >
          <div className={`p-2.5 rounded-xl ${action.color} text-primary-foreground`}>
            <action.icon className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground text-center leading-tight">
            {action.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
};

export default QuickActions;
