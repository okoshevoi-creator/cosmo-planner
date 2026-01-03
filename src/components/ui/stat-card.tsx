import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  delay?: number;
}

const StatCard = ({ title, value, subtitle, icon, trend, className, delay = 0 }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        'bg-card rounded-2xl p-4 shadow-card border border-border/50 relative overflow-hidden',
        className
      )}
    >
      <div className="absolute top-0 right-0 w-20 h-20 gradient-primary opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            {title}
          </p>
          <p className="text-2xl font-display font-semibold mt-1 text-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                'text-xs font-medium mt-1',
                trend.isPositive ? 'text-sage' : 'text-destructive'
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value}% față de ieri
            </p>
          )}
        </div>
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
