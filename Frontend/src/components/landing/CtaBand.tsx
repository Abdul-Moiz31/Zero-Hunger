import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, HeartHandshake, Sparkles } from 'lucide-react';
import { Reveal } from '../ui/motion';

const CtaBand: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#052e16] via-green-700 to-emerald-600 px-8 py-16 text-center shadow-2xl sm:px-16">
            {/* Animated orbs */}
            <motion.div
              animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-green-400/20 blur-3xl"
            />
            <motion.div
              animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl"
            />

            {/* Dot grid */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            <div className="relative">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <HeartHandshake className="h-8 w-8 text-white" />
              </div>

              <div className="mb-3 flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 text-green-300" />
                <span className="text-sm font-bold text-green-300 uppercase tracking-widest">Free to join</span>
                <Sparkles className="h-4 w-4 text-green-300" />
              </div>

              <h2 className="mx-auto max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl">
                Be the reason a meal
                <br />
                finds a home tonight.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-green-100/80">
                It takes a minute to sign up and a lifetime of difference for someone who eats because
                you cared.
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/auth')}
                  className="flex items-center gap-2.5 rounded-2xl bg-white px-8 py-3.5 text-sm font-extrabold text-green-800 shadow-lg transition"
                >
                  Get started free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/listings')}
                  className="flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  Browse available food
                </motion.button>
              </div>

              <p className="mt-6 text-xs text-green-200/50">
                No credit card · No fees · Cancel anytime
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default CtaBand;
