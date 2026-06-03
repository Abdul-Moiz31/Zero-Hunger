import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, HeartHandshake, Leaf, Package, Users, TrendingUp, BarChart3 } from 'lucide-react';

// ─── Floating chip ────────────────────────────────────────────────────────────
const Chip = ({
  icon: Icon,
  value,
  label,
  delay,
  className = '',
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  delay: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    className={`flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-md ${className}`}
  >
    <Icon className="h-3.5 w-3.5 text-green-300 shrink-0" />
    <div>
      <p className="text-sm font-bold leading-none text-white">{value}</p>
      <p className="mt-0.5 text-[10px] text-green-200/70">{label}</p>
    </div>
  </motion.div>
);

// ─── Animated bar chart (decorative) ─────────────────────────────────────────
const MiniChart = () => (
  <div className="flex items-end gap-1 h-10">
    {[40, 65, 45, 80, 55, 90, 72].map((h, i) => (
      <motion.div
        key={i}
        initial={{ height: 0 }}
        animate={{ height: `${h}%` }}
        transition={{ duration: 0.6, delay: 0.8 + i * 0.06, ease: 'easeOut' }}
        className="flex-1 rounded-sm bg-gradient-to-t from-green-500 to-emerald-300 opacity-80 min-w-[6px]"
      />
    ))}
  </div>
);

// ─── Hero ─────────────────────────────────────────────────────────────────────
const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#052e16]">
      {/* ── Background ── */}
      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Gradient orbs */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -25, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-green-500/20 blur-[80px]"
      />
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-emerald-400/15 blur-[80px]"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute left-0 top-1/2 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-teal-500/10 blur-[60px]"
      />

      {/* ── Content ── */}
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 pb-16 pt-32 lg:flex-row lg:gap-16 lg:pt-24">

        {/* LEFT — Copy */}
        <div className="flex-1 text-center lg:text-left">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-semibold text-green-300"
          >
            <Leaf className="h-3.5 w-3.5" />
            AI-powered food rescue platform
            <span className="ml-1 h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl font-black leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            Good food
            <br />
            <span className="bg-gradient-to-r from-green-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
              shouldn't waste
            </span>
            <br />
            while people hunger.
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-green-100/75 lg:mx-0"
          >
            Zero Hunger connects restaurants and businesses with surplus food directly to the NGOs
            and volunteers who deliver it — fresh, fast, and completely free of charge.
          </motion.p>

          {/* Stat chips */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.34 }}
            className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start"
          >
            <Chip icon={Package}       value="50K+" label="Meals rescued"   delay={0.45} />
            <Chip icon={Users}         value="1,200+" label="Active donors" delay={0.55} />
            <Chip icon={HeartHandshake} value="48"   label="Partner NGOs"  delay={0.65} />
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.42 }}
            className="mt-9 flex flex-wrap justify-center gap-4 lg:justify-start"
          >
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(74,222,128,0.25)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/auth')}
              className="group flex items-center gap-2.5 rounded-2xl bg-white px-7 py-3.5 text-sm font-extrabold text-green-900 shadow-lg transition-all"
            >
              <HeartHandshake className="h-4 w-4 transition-transform group-hover:scale-110" />
              Start rescuing food
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/listings')}
              className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              Browse food listings
              <ArrowRight className="h-3.5 w-3.5" />
            </motion.button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-5 text-xs text-green-200/40"
          >
            Free to join · No fees ever · Trusted by NGOs nationwide
          </motion.p>
        </div>

        {/* RIGHT — Dashboard card */}
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-14 w-full max-w-sm shrink-0 lg:mt-0 lg:max-w-md"
        >
          {/* Main card */}
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/8 p-6 shadow-2xl backdrop-blur-md"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            {/* Window dots */}
            <div className="mb-5 flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
              <span className="ml-auto text-[10px] text-white/30">Zero Hunger — Live Dashboard</span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              {[
                { label: 'Rescued Today', value: '127', color: 'bg-green-500/20 text-green-300' },
                { label: 'Active NGOs',   value: '48',  color: 'bg-blue-500/20 text-blue-300' },
                { label: 'Volunteers',    value: '203', color: 'bg-amber-500/20 text-amber-300' },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl px-3 py-3 text-center ${s.color}`}>
                  <p className="text-xl font-black">{s.value}</p>
                  <p className="mt-0.5 text-[9px] opacity-75 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="mb-4 rounded-xl bg-white/5 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] text-white/40">Meals rescued this week</span>
                <BarChart3 className="h-3 w-3 text-white/20" />
              </div>
              <MiniChart />
              <div className="mt-1.5 flex justify-between">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <span key={i} className="text-[8px] text-white/20">{d}</span>
                ))}
              </div>
            </div>

            {/* Recent */}
            <div className="space-y-1.5">
              {[
                { t: '50 kg rice — Al Baik',   s: 'Claimed',   c: 'text-green-400' },
                { t: '30 meals — Bakery Central', s: 'In transit', c: 'text-amber-400' },
                { t: '20 boxes — Café Verde',  s: 'Available', c: 'text-blue-400' },
              ].map((r) => (
                <div key={r.t} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                  <span className="truncate text-[11px] text-white/50 max-w-[160px]">{r.t}</span>
                  <span className={`shrink-0 text-[10px] font-bold ${r.c}`}>{r.s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Floating notification */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.85 }}
            className="absolute -bottom-5 -left-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-green-900/90 px-4 py-3 shadow-xl backdrop-blur-md"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-500">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">+23 meals rescued</p>
              <p className="text-[10px] text-green-300/70">in the last hour</p>
            </div>
          </motion.div>

          {/* Floating CO₂ chip */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="absolute -right-5 top-8 rounded-2xl border border-white/10 bg-emerald-900/90 px-4 py-3 shadow-xl backdrop-blur-md"
          >
            <p className="text-[10px] text-emerald-300/70">CO₂ offset today</p>
            <p className="text-lg font-black text-white">2.4 t</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll nudge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5"
      >
        <p className="text-[10px] uppercase tracking-[0.2em] text-green-300/30">Scroll</p>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="h-6 w-px bg-gradient-to-b from-green-400/40 to-transparent"
        />
      </motion.div>
    </section>
  );
};

export default Hero;
