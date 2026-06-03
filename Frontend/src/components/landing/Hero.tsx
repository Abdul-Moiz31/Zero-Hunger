import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, HeartHandshake, Leaf, Package, TrendingUp, BarChart3 } from 'lucide-react';
import { fadeUp, fadeRight, fadeLeft, staggerContainer } from '../ui/motion';

// ─── Animated orb ────────────────────────────────────────────────────────────
const Orb = ({ className }: { className: string }) => (
  <motion.div
    animate={{ y: [0, -18, 0], scale: [1, 1.06, 1] }}
    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
    className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
  />
);

// ─── Floating stat chip ───────────────────────────────────────────────────────
const Chip = ({
  icon: Icon, value, label, color, delay,
}: {
  icon: React.ElementType; value: string; label: string; color: string; delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -4, scale: 1.04 }}
    className="flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-white backdrop-blur-md"
  >
    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${color}`}>
      <Icon className="h-3.5 w-3.5 text-white" />
    </div>
    <div>
      <p className="text-sm font-bold leading-none">{value}</p>
      <p className="mt-0.5 text-[10px] text-white/70">{label}</p>
    </div>
  </motion.div>
);

// ─── Dot-grid background ──────────────────────────────────────────────────────
const DotGrid = () => (
  <div
    className="pointer-events-none absolute inset-0 opacity-[0.07]"
    style={{
      backgroundImage:
        'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
      backgroundSize: '28px 28px',
    }}
  />
);

// ─── Feature badge ────────────────────────────────────────────────────────────
const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-green-400/30 bg-green-500/10 px-3.5 py-1.5 text-xs font-semibold text-green-300 backdrop-blur-sm">
    {children}
  </span>
);

// ─── Main Hero ────────────────────────────────────────────────────────────────
const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#052e16] via-[#14532d] to-[#166534] pt-20">
      {/* Background elements */}
      <DotGrid />
      <Orb className="h-[600px] w-[600px] bg-green-500/20 -top-40 -left-40" />
      <Orb className="h-[500px] w-[500px] bg-emerald-400/15 top-1/3 -right-32" />
      <Orb className="h-[350px] w-[350px] bg-teal-400/10 bottom-0 left-1/4" />

      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-24 lg:pt-32">
        <div className="grid items-center gap-16 lg:grid-cols-2">

          {/* ── LEFT — Copy ── */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div variants={fadeUp}>
              <Badge>
                <Leaf className="h-3 w-3" />
                AI-powered food rescue platform
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl"
            >
              End hunger.{' '}
              <br />
              <span className="bg-gradient-to-r from-green-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
                Cut waste.
              </span>
              <br />
              Right now.
            </motion.h1>

            <motion.p variants={fadeUp} className="max-w-lg text-lg leading-relaxed text-green-100/80">
              Zero Hunger connects restaurants and businesses with surplus food directly to the NGOs
              and volunteers who deliver it — fresh, fast, and free of charge.
            </motion.p>

            {/* Chips row */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Chip icon={Package} value="50K+" label="Meals rescued" color="bg-green-600" delay={0.5} />
              <Chip icon={HeartHandshake} value="1,200+" label="Active donors" color="bg-emerald-600" delay={0.65} />
              <Chip icon={Leaf} value="18 t" label="CO₂ avoided" color="bg-teal-600" delay={0.8} />
            </motion.div>

            {/* CTA buttons */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 pt-2">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/auth')}
                className="group flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-green-800 shadow-lg shadow-green-900/30 transition-all hover:bg-green-50"
              >
                <HeartHandshake className="h-4 w-4 transition-transform group-hover:-rotate-12" />
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

            <motion.p variants={fadeUp} className="text-xs text-green-200/50">
              Free to join · No fees, ever · Trusted by NGOs across the country
            </motion.p>
          </motion.div>

          {/* ── RIGHT — Visual card stack ── */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            animate="visible"
            className="relative hidden lg:block"
          >
            {/* Main dashboard card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md"
            >
              {/* Mini header */}
              <div className="mb-5 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <div className="ml-auto text-xs text-white/40">Zero Hunger Dashboard</div>
              </div>

              {/* Fake stat grid */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Rescued Today', value: '127', color: 'bg-green-500/20 text-green-300' },
                  { label: 'Active NGOs', value: '48', color: 'bg-blue-500/20 text-blue-300' },
                  { label: 'Volunteers', value: '203', color: 'bg-amber-500/20 text-amber-300' },
                ].map((s) => (
                  <div key={s.label} className={`rounded-xl p-3 text-center ${s.color}`}>
                    <p className="text-xl font-black">{s.value}</p>
                    <p className="text-[10px] opacity-80 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Fake chart bars */}
              <div className="mb-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-white/50">Meals rescued this week</span>
                  <BarChart3 className="h-3.5 w-3.5 text-white/30" />
                </div>
                <div className="flex items-end gap-1.5 h-14">
                  {[40, 65, 45, 80, 55, 90, 72].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 0.7, delay: 0.5 + i * 0.07 }}
                      className="flex-1 rounded-t-md bg-gradient-to-t from-green-600 to-emerald-400 opacity-80"
                    />
                  ))}
                </div>
                <div className="mt-1 flex justify-between px-0.5">
                  {['M','T','W','T','F','S','S'].map((d) => (
                    <span key={d} className="text-[9px] text-white/30">{d}</span>
                  ))}
                </div>
              </div>

              {/* Recent activity */}
              <div className="space-y-2">
                {[
                  { title: '50 kg rice — Restaurant Al Baik', status: 'Claimed', color: 'text-green-400' },
                  { title: '30 meals — Bakery Central', status: 'In transit', color: 'text-amber-400' },
                  { title: '20 boxes — Café Verde', status: 'Available', color: 'text-blue-400' },
                ].map((r) => (
                  <div key={r.title} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                    <span className="text-xs text-white/60 truncate max-w-[160px]">{r.title}</span>
                    <span className={`text-[10px] font-semibold ${r.color}`}>{r.status}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Floating notification card */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              animate-idle={{ y: [0, -8, 0] }}
              className="absolute -bottom-6 -left-10 flex items-center gap-3 rounded-2xl border border-white/15 bg-green-900/80 px-4 py-3 shadow-xl backdrop-blur-md"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">+23 meals rescued</p>
                <p className="text-[10px] text-green-300/70">in the last hour</p>
              </div>
            </motion.div>

            {/* Floating impact card */}
            <motion.div
              initial={{ opacity: 0, x: -20, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="absolute -right-8 top-6 rounded-2xl border border-white/15 bg-emerald-900/80 px-4 py-3 shadow-xl backdrop-blur-md"
            >
              <p className="text-[10px] text-emerald-300/70">CO₂ offset today</p>
              <p className="text-lg font-black text-white">2.4 t</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-20 flex flex-col items-center gap-2"
        >
          <p className="text-xs text-green-200/40 uppercase tracking-widest">Scroll to explore</p>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-5 w-px bg-gradient-to-b from-green-400/50 to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
