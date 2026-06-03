import React from 'react';

type Status = 'available' | 'assigned' | 'in_progress' | 'completed' | string;

const STYLES: Record<string, string> = {
  available: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  assigned: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  in_progress: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  completed: 'bg-green-50 text-green-700 ring-green-600/20',
  default: 'bg-gray-50 text-gray-600 ring-gray-500/20',
};

const LABELS: Record<string, string> = {
  available: 'Available',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
};

/** Consistent colored pill for food/task status across dashboards. */
export const StatusBadge: React.FC<{ status: Status; className?: string }> = ({
  status,
  className = '',
}) => {
  const style = STYLES[status] ?? STYLES.default;
  const label = LABELS[status] ?? status;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style} ${className}`}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
