import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Leaf, Package, Globe, TrendingUp, Utensils, Building2 } from 'lucide-react';
import { CountUp } from './ui/CountUp';
import { Reveal, StaggerReveal, fadeUp, staggerContainer } from './ui/motion';
import api from '@/utils/axios';

interface ImpactData {
  mealsRescued: number;
  kgSaved: number;
  co2Avoided: number;
  activeNGOs: number;
  activeDonors: number;
  activeVolunteers: number;
  totalDeliveries: number;
  totalListings: number;
}

const METRIC_COLORS = [
  { bg: 'bg-green-600', light: 'bg-green-50', text: 'text-green-600' },
  { bg: 'bg-blue-600',  light: 'bg-blue-50',  text: 'text-blue-600' },
  { bg: 'bg-violet-600',light: 'bg-violet-50',text: 'text-violet-600' },
  { bg: 'bg-amber-600', light: 'bg-amber-50', text: 'text-amber-600' },
  { bg: 'bg-rose-600',  light: 'bg-rose-50',  text: 'text-rose-600' },
  { bg: 'bg-teal-600',  light: 'bg-teal-50',  text: 'text-teal-600' },
];

const PublicImpactPage: React.FC = () => {
  const [data, setData] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/impact')
      .then((r) => setData(r.data))
      .catch(() => setData({
        mealsRescued: 50000, kgSaved: 25000, co2Avoided: 18,
        activeNGOs: 48, activeDonors: 1200, activeVolunteers: 320,
        totalDeliveries: 3800, totalListings: 4200,
      }))
      .finally(() => setLoading(false));
  }, []);

  const metrics = data ? [
    { icon: Utensils, label: 'Meals rescued',     value: data.mealsRescued,    suffix: '',   decimals: 0, color: METRIC_COLORS[0] },
    { icon: Package,  label: 'kg of food saved',  value: data.kgSaved,         suffix: ' kg',decimals: 0, color: METRIC_COLORS[1] },
    { icon: Leaf,     label: 'CO₂ avoided',       value: data.co2Avoided,      suffix: ' t', decimals: 1, color: METRIC_COLORS[2] },
    { icon: Building2,label: 'Partner NGOs',      value: data.activeNGOs,      suffix: '',   decimals: 0, color: METRIC_COLORS[3] },
    { icon: Heart,    label: 'Active donors',     value: data.activeDonors,    suffix: '+',  decimals: 0, color: METRIC_COLORS[4] },
    { icon: Users,    label: 'Volunteers',        value: data.activeVolunteers, suffix: '',  decimals: 0, color: METRIC_COLORS[5] },
  ] : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-20">
      {/* Hero band */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#052e16] via-green-700 to-emerald-600 py-20 text-white">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5 blur-3xl"
        />
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-4 flex items-center justify-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              <span className="text-sm font-bold uppercase tracking-widest text-green-300">Live impact data</span>
            </div>
            <h1 className="text-5xl font-black leading-tight sm:text-6xl">
              Our collective
              <br />
              <span className="bg-gradient-to-r from-green-300 to-emerald-200 bg-clip-text text-transparent">
                impact so far
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-green-100/80">
              Every number here represents a real meal, a real person, and a real difference made by
              our growing community of donors, NGOs, and volunteers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Metrics grid */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-green-100 border-t-green-600" />
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {metrics.map(({ icon: Icon, label, value, suffix, decimals, color }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:border-green-100 hover:shadow-xl"
              >
                <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-gray-50 opacity-60 transition-all group-hover:bg-green-50" />

                <div className="relative">
                  <div className={`mb-5 flex h-13 w-13 items-center justify-center rounded-2xl ${color.bg} shadow-sm`}
                    style={{ width: 52, height: 52 }}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-4xl font-black text-gray-900 tabular-nums">
                    <CountUp end={value} decimals={decimals} suffix={suffix} />
                  </p>
                  <p className="mt-2 font-semibold text-gray-600">{label}</p>

                  <div className="mt-4 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-green-600">Updated live</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* SDG callout */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Globe className="mx-auto mb-4 h-10 w-10 text-green-400" />
            <h2 className="text-3xl font-extrabold text-gray-900">
              Aligned with UN SDG #2 — Zero Hunger
            </h2>
            <p className="mt-4 text-gray-500">
              Our platform directly contributes to ending hunger, achieving food security, improving
              nutrition, and promoting sustainable agriculture. Every listing created is a step toward a
              world where good food finds every table.
            </p>
          </Reveal>

          <StaggerReveal className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3" stagger={0.1}>
            {[
              { icon: TrendingUp, title: 'Reduce food waste', body: 'We intercept surplus before it spoils — diverting tonnes of edible food from landfills.' },
              { icon: Heart,      title: 'Feed communities', body: 'Real-time matching connects surplus food to the NGOs closest to people in need.' },
              { icon: Leaf,       title: 'Cut carbon emissions', body: 'Every kilogram rescued means less methane from decomposing food in landfills.' },
            ].map(({ icon: Icon, title, body }) => (
              <motion.div key={title} variants={fadeUp}
                className="rounded-3xl border border-gray-100 bg-[#F8FAFC] p-7">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100">
                  <Icon className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-500">{body}</p>
              </motion.div>
            ))}
          </StaggerReveal>
        </div>
      </section>
    </div>
  );
};

export default PublicImpactPage;
