import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { CountUp } from './CountUp';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  /** Tailwind color key from the palette, e.g. 'green', 'amber', 'blue'. */
  accent?: 'green' | 'amber' | 'blue' | 'rose' | 'violet';
  decimals?: number;
  suffix?: string;
  index?: number;
}

const ACCENTS: Record<string, { ring: string; bg: string; text: string }> = {
  green: { ring: 'ring-green-100', bg: 'bg-green-50', text: 'text-green-600' },
  amber: { ring: 'ring-amber-100', bg: 'bg-amber-50', text: 'text-amber-600' },
  blue: { ring: 'ring-blue-100', bg: 'bg-blue-50', text: 'text-blue-600' },
  rose: { ring: 'ring-rose-100', bg: 'bg-rose-50', text: 'text-rose-600' },
  violet: { ring: 'ring-violet-100', bg: 'bg-violet-50', text: 'text-violet-600' },
};

/** Animated KPI card used across all role dashboards. */
export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  accent = 'green',
  decimals = 0,
  suffix = '',
  index = 0,
}) => {
  const c = ACCENTS[accent] ?? ACCENTS.green;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className={`flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ring-1 ${c.ring} transition-shadow hover:shadow-md`}
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${c.bg}`}>
        <Icon className={`h-6 w-6 ${c.text}`} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">
          <CountUp end={value} decimals={decimals} suffix={suffix} />
        </p>
      </div>
    </motion.div>
  );
};

export default StatCard;
