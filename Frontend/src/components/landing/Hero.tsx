import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, HeartHandshake, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUp } from '../ui/motion';
import { Button } from '../ui/Button';

/**
 * Landing hero. Leads with empathy ("good food, wasted; people, hungry") and a
 * clear call to action. Animated entrance + a soft floating image card.
 */
const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-green-50 via-white to-white pt-28 pb-20">
      {/* Decorative blurred blobs */}
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-green-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-40 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />

      <div className="container relative mx-auto grid items-center gap-12 px-6 lg:grid-cols-2">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-green-700 backdrop-blur"
          >
            <Sparkles className="h-4 w-4" />
            Turning surplus into second chances
          </motion.span>

          <motion.h1
            variants={fadeUp}
            className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
          >
            Good food shouldn't go to waste while{' '}
            <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              neighbors go hungry
            </span>
            .
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-6 max-w-xl text-lg text-gray-600">
            Zero Hunger connects restaurants and businesses with surplus food to the NGOs and
            volunteers who can get it to people in need — fresh, fast, and free. Every meal rescued
            is a little more hope on someone's plate.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" icon={HeartHandshake} onClick={() => navigate('/auth')}>
              Start rescuing food
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/listings')}
            >
              Browse available food
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-6 text-sm text-gray-500">
            Free to join for donors, NGOs, and volunteers. No fees, ever.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="animate-float overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5">
            <img
              src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80"
              alt="Volunteers sharing rescued food with the community"
              className="h-[420px] w-full object-cover"
              loading="eager"
            />
          </div>
          {/* Floating stat chip */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="absolute -bottom-5 left-6 flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-lg ring-1 ring-black/5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <HeartHandshake className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">1 in 3</p>
              <p className="text-xs text-gray-500">meals could be saved from waste</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
