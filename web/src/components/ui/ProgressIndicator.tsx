import React from 'react';
import { Badge } from './Badge';

interface ProgressIndicatorProps {
  percentage: number;
  total: number;
  completed: number;
  showBadge?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Détermine le statut de performance basé sur le pourcentage
 * - 100% = Excellent (vert)
 * - 80-99% = Bon (vert clair)
 * - 50-79% = En cours (orange)
 * - 1-49% = Débuté (jaune)
 * - 0% = Non commencé (gris)
 */
const getPerformanceStatus = (percentage: number, total: number) => {
  if (total === 0) return { color: 'slate', variant: 'default' as const, label: 'No items' };
  if (percentage === 100) return { color: 'emerald', variant: 'success' as const, label: 'Complete' };
  if (percentage >= 80) return { color: 'green', variant: 'success' as const, label: 'On Track' };
  if (percentage >= 50) return { color: 'amber', variant: 'warning' as const, label: 'In Progress' };
  if (percentage > 0) return { color: 'yellow', variant: 'warning' as const, label: 'Started' };
  return { color: 'slate', variant: 'default' as const, label: 'Not Started' };
};

const getProgressBarColor = (percentage: number) => {
  if (percentage === 100) return 'from-emerald-500 to-emerald-600';
  if (percentage >= 80) return 'from-green-500 to-green-600';
  if (percentage >= 50) return 'from-amber-500 to-amber-600';
  if (percentage > 0) return 'from-yellow-500 to-yellow-600';
  return 'from-slate-300 to-slate-400';
};

const sizeStyles = {
  sm: { bar: 'h-2', text: 'text-xs' },
  md: { bar: 'h-2.5', text: 'text-sm' },
  lg: { bar: 'h-3', text: 'text-base' },
};

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  percentage,
  total,
  completed,
  showBadge = true,
  size = 'md',
}) => {
  const status = getPerformanceStatus(percentage, total);
  const progressColor = getProgressBarColor(percentage);
  const styles = sizeStyles[size];

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-[100px]">
        <div className="w-full bg-slate-200 rounded-full overflow-hidden shadow-inner" style={{ height: styles.bar }}>
          <div
            className={`bg-gradient-to-r ${progressColor} rounded-full transition-all duration-500 shadow-sm`}
            style={{ width: `${percentage}%`, height: styles.bar }}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 min-w-[120px]">
        <span className={`font-semibold ${styles.text} text-slate-700`}>
          {completed}/{total}
        </span>
        <span className={`font-bold ${styles.text} text-slate-500`}>
          ({percentage}%)
        </span>
        {showBadge && (
          <Badge variant={status.variant} size="sm">
            {status.label}
          </Badge>
        )}
      </div>
    </div>
  );
};

