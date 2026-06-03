import React from 'react';
import { Trash2, Users, Leaf, Utensils } from 'lucide-react';
import { Reveal, staggerContainer, fadeUp, motion } from '../ui/motion';
import { CountUp } from '../ui/CountUp';

/**
 * The "why this matters" section — real, sourced figures with animated counters
 * to make the scale of food waste and hunger tangible and motivating.
 */
const STATS = [
  {
    icon: Trash2,
    end: 1.05,
    decimals: 2,
    suffix: 'B',
    label: 'tonnes of food wasted every year',
    accent: 'text-rose-600 bg-rose-50',
  },
  {
    icon: Users,
    end: 735,
    suffix: 'M',
    label: 'people face hunger worldwide',
    accent: 'text-amber-600 bg-amber-50',
  },
  {
    icon: Utensils,
    end: 870,
    suffix: 'M',
    label: 'could be fed by saving just ¼ of waste',
    accent: 'text-green-600 bg-green-50',
  },
  {
    icon: Leaf,
    end: 10,
    suffix: '%',
    label: 'of global emissions come from food waste',
    accent: 'text-emerald-600 bg-emerald-50',
  },
];

const ImpactStats: React.FC = () => (
  <section id="impact" className="bg-white py-20">
    <div className="container mx-auto px-6">
      <Reveal className="mx-auto mb-14 max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          A solvable problem, hiding in plain sight
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          The world already grows enough food. The challenge isn't scarcity — it's getting surplus
          to people before it spoils. That's exactly what Zero Hunger is built to do.
        </p>
      </Reveal>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              variants={fadeUp}
              className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm"
            >
              <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${s.accent}`}>
                <Icon className="h-6 w-6" />
              </div>
              <p className="text-3xl font-extrabold text-gray-900">
                <CountUp end={s.end} decimals={s.decimals ?? 0} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-sm text-gray-500">{s.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      <Reveal className="mt-8 text-center" delay={0.2}>
        <p className="text-xs text-gray-400">
          Sources: UN / World Food Programme, 2024–2025 estimates.
        </p>
      </Reveal>
    </div>
  </section>
);

export default ImpactStats;
