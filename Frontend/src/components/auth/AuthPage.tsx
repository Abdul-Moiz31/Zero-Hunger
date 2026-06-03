import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Leaf, Users, Package, ArrowLeft } from 'lucide-react';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import { User } from '@/types/auth';

const STATS = [
  { icon: Package, value: '50K+', label: 'Meals rescued' },
  { icon: Users, value: '1,200+', label: 'Active donors' },
  { icon: Leaf, value: '18 t', label: 'CO₂ avoided' },
];

const AuthPage: React.FC = () => {
  const [isSignIn, setIsSignIn] = useState<boolean>(true);
  const navigate = useNavigate();

  const handleAuthSuccess = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    navigate(`/${userData.role}-dashboard`);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* ─── Left panel ─── */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-[46%] xl:w-[42%]">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-green-600 to-emerald-500" />

        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-16 -left-12 h-64 w-64 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute right-16 bottom-32 h-40 w-40 rounded-full bg-white/8" />

        <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 self-start rounded-xl p-1 transition hover:opacity-80"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Zero Hunger</span>
          </button>

          {/* Center content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-extrabold leading-tight">
                Every meal saved
                <br />
                is hope restored.
              </h2>
              <p className="mt-4 max-w-sm text-base text-green-100/90">
                Join our network of food heroes — restaurants, NGOs, and volunteers working together
                to eliminate waste and hunger.
              </p>
            </div>

            {/* Stats row */}
            <div className="flex gap-5">
              {STATS.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex flex-col gap-1 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-4 w-4 text-green-200" />
                    <span className="text-lg font-bold">{value}</span>
                  </div>
                  <span className="text-xs text-green-100/80">{label}</span>
                </div>
              ))}
            </div>

            {/* Feature list */}
            <ul className="space-y-3">
              {[
                'Connect with local food donors instantly',
                'Coordinate efficient food distribution',
                'Track real-time impact & deliveries',
              ].map((text) => (
                <li key={text} className="flex items-center gap-3 text-sm text-green-50">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-green-200/60">Free to join. No fees, ever.</p>
        </div>
      </div>

      {/* ─── Right panel ─── */}
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-12 sm:px-10">
        {/* Back to home (mobile) */}
        <button
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-1.5 self-start text-sm font-medium text-gray-500 transition hover:text-green-600 lg:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </button>

        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Zero Hunger</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-gray-900">
              {isSignIn ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              {isSignIn
                ? 'Sign in to continue making a difference.'
                : 'Join our mission to fight food waste and hunger.'}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="mb-7 flex rounded-xl border border-gray-200 bg-gray-100 p-1">
            {(['Sign In', 'Sign Up'] as const).map((tab) => {
              const active = isSignIn ? tab === 'Sign In' : tab === 'Sign Up';
              return (
                <button
                  key={tab}
                  onClick={() => setIsSignIn(tab === 'Sign In')}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all duration-200
                    ${active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignIn ? 'signin' : 'signup'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {isSignIn ? (
                <SignInForm onSuccess={handleAuthSuccess} />
              ) : (
                <SignUpForm onSuccess={handleAuthSuccess} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Toggle link */}
          <p className="mt-6 text-center text-sm text-gray-500">
            {isSignIn ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setIsSignIn((v) => !v)}
              className="font-semibold text-green-600 transition hover:text-green-700 hover:underline"
            >
              {isSignIn ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
