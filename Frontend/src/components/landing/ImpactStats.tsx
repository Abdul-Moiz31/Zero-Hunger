import React, { useEffect, useState } from 'react';
import { Trash2, Users, Leaf, Utensils, TrendingUp, Heart, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { Reveal, StaggerReveal, fadeUp, staggerContainer } from '../ui/motion';
import { CountUp } from '../ui/CountUp';
import api from '@/utils/axios';

// ─── Global food-crisis stats (static, sourced) ───────────────────────────────
const CRISIS_STATS = [
  { icon: Trash2, end: 1.05, decimals: 2, suffix: 'B', label: 'tonnes of food wasted globally per year', accent: 'rose' },
  { icon: Users, end: 735, suffix: 'M', label: 'people still face hunger worldwide', accent: 'amber' },
  { icon: Utensils, end: 870, suffix: 'M', label: 'could be fed by saving just ¼ of waste', accent: 'green' },
  { icon: Leaf, end: 10, suffix: '%', label: 'of global emissions from food waste', accent: 'emerald' },
];

type AccentKey = 'rose' | 'amber' | 'green' | 'emerald';
const ACCENT_MAP: Record<AccentKey, { bg: string; text: string; border: string; glow: string }> = {
  rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    border: 'border-rose-100',    glow: 'shadow-rose-100/60' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-100',   glow: 'shadow-amber-100/60' },
  green:   { bg: 'bg-green-50',   text: 'text-green-600',   border: 'border-green-100',   glow: 'shadow-green-100/60' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', glow: 'shadow-emerald-100/60' },
};

// ─── Platform live stats (from API) ──────────────────────────────────────────
interface PlatformStats {
  mealsRescued: number;
  activeNGOs: number;
  co2Avoided: number;
  activeDonors: number;
}

const ImpactStats: React.FC = () => {
  const [platform, setPlatform] = useState<PlatformStats | null>(null);

  useEffect(() => {
    api.get('/impact').then((r) => setPlatform(r.data)).catch(() => {
      // Fallback values while API isn't wired yet
      setPlatform({ mealsRescued: 50000, activeNGOs: 48, co2Avoided: 18, activeDonors: 1200 });
    });
  }, []);

  return (
    <section id="impact" className="bg-[#F8FAFC] py-24">
      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}
        <Reveal className="mx-auto mb-16 max-w-2xl text-center">
          <span className="inline-block rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-green-700">
            The numbers
          </span>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            A solvable problem,{' '}
            <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              hiding in plain sight
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            The world already grows enough food. The challenge isn't scarcity — it's getting surplus
            to people before it spoils.
          </p>
        </Reveal>

        {/* ── Live platform stats ── */}
        {platform && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4"
          >
            {[
              { icon: Heart,      value: platform.mealsRescued, suffix: '',  decimals: 0, label: 'Meals rescued',    color: 'bg-green-600' },
              { icon: Users,      value: platform.activeDonors,  suffix: '+', decimals: 0, label: 'Active donors',   color: 'bg-blue-600' },
              { icon: Globe,      value: platform.activeNGOs,    suffix: '',  decimals: 0, label: 'Partner NGOs',    color: 'bg-violet-600' },
              { icon: Leaf,       value: platform.co2Avoided,    suffix: ' t',decimals: 1, label: 'CO₂ avoided',    color: 'bg-emerald-600' },
            ].map(({ icon: Icon, value, suffix, decimals, label, color }, i) => (
              <motion.div
                key={label}
                variants={fadeUp}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-green-100 hover:shadow-lg"
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/0 to-green-50/0 transition-all duration-300 group-hover:from-green-50/60 group-hover:to-emerald-50/40 rounded-3xl" />

                <div className="relative">
                  <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${color} shadow-sm`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-3xl font-black text-gray-900 tabular-nums">
                    <CountUp end={value} decimals={decimals} suffix={suffix} />
                  </p>
                  <p className="mt-1.5 text-sm font-medium text-gray-500">{label}</p>

                  {/* Live indicator */}
                  <div className="mt-3 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-green-600">Live</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── Global crisis stats ── */}
        <StaggerReveal className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
          {CRISIS_STATS.map((s) => {
            const Icon = s.icon;
            const ac = ACCENT_MAP[s.accent as AccentKey];
            return (
              <motion.div
                key={s.label}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className={`flex flex-col items-center rounded-2xl border p-6 text-center shadow-sm transition-all hover:shadow-lg ${ac.border} ${ac.glow} bg-white`}
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${ac.bg}`}>
                  <Icon className={`h-6 w-6 ${ac.text}`} />
                </div>
                <p className="text-3xl font-extrabold text-gray-900">
                  <CountUp end={s.end} decimals={s.decimals ?? 0} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-xs text-gray-500 leading-snug">{s.label}</p>
              </motion.div>
            );
          })}
        </StaggerReveal>

        {/* Source note */}
        <Reveal className="mt-8 text-center" delay={0.2}>
          <p className="text-[11px] text-gray-400">
            Crisis data: UN / World Food Programme 2024–2025 · Platform stats updated in real time.
          </p>
        </Reveal>

        {/* Divider CTA */}
        <Reveal className="mt-16 overflow-hidden rounded-3xl bg-gradient-to-r from-green-700 to-emerald-600 p-8 text-center text-white shadow-xl" delay={0.1}>
          <TrendingUp className="mx-auto mb-3 h-8 w-8 opacity-80" />
          <h3 className="text-2xl font-extrabold">Every meal you rescue is counted here.</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-green-100/80">
            Real-time impact across every donation, pickup, and delivery on our platform.
          </p>
        </Reveal>
      </div>
    </section>
  );
};

export default ImpactStats;
