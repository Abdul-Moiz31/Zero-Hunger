import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Heart, ChevronRight, LayoutDashboard, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const NAV_LINKS = [
  { label: 'Listings', href: '/listings', external: false },
  { label: 'Impact', href: '/impact', external: false },
  { label: 'How it works', href: '#how-it-works', anchor: true },
  { label: 'About', href: '#about', anchor: true },
];

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // On non-home pages always show the solid style
  const solid = scrolled || !isHome;

  const handleAnchor = (href: string) => {
    if (href.startsWith('#')) {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(href);
    }
    setMobileOpen(false);
  };

  const handleSignOut = async () => {
    await signOut().catch(() => {});
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500
        ${solid
          ? 'bg-white/90 shadow-sm shadow-black/5 backdrop-blur-xl'
          : 'bg-transparent'
        }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">

        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 rounded-xl p-1 transition hover:opacity-80"
        >
          <div className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all
            ${solid ? 'bg-green-600' : 'bg-white/20 backdrop-blur-sm'}`}
          >
            <Heart className="h-4 w-4 text-white" />
          </div>
          <span className={`text-[15px] font-extrabold tracking-tight transition-colors
            ${solid ? 'text-gray-900' : 'text-white'}`}
          >
            Zero Hunger
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              onClick={() => handleAnchor(link.href)}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors
                ${solid
                  ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
                }
                ${location.pathname === link.href ? (solid ? 'text-green-600 font-semibold' : 'text-white font-semibold') : ''}`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition
                  ${solid
                    ? 'border border-gray-200 bg-white text-gray-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700'
                    : 'border border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20'
                  }`}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                  {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
                </div>
                <span className="hidden sm:inline">{user.name?.split(' ')[0]}</span>
                <ChevronRight className={`h-3.5 w-3.5 transition-transform ${userMenuOpen ? 'rotate-90' : ''}`} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl"
                  >
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs capitalize text-gray-400">{user.role}</p>
                    </div>
                    <button
                      onClick={() => { navigate(`/${user.role}-dashboard`); setUserMenuOpen(false); }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <LayoutDashboard className="h-4 w-4 text-gray-400" />
                      Dashboard
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 border-t border-gray-100 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate('/auth')}
                className={`hidden rounded-xl px-4 py-2 text-sm font-medium transition sm:block
                  ${solid ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'}`}
              >
                Sign in
              </button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/auth')}
                className={`flex items-center gap-1.5 rounded-xl px-5 py-2 text-sm font-bold transition
                  ${solid
                    ? 'bg-green-600 text-white shadow-sm hover:bg-green-700'
                    : 'bg-white text-green-800 hover:bg-green-50'
                  }`}
              >
                Get started
                <ChevronRight className="h-3.5 w-3.5" />
              </motion.button>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className={`rounded-lg p-2 transition md:hidden
              ${solid ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden border-t border-white/10 bg-[#052e16] md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleAnchor(link.href)}
                  className="rounded-xl px-4 py-3 text-left text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </button>
              ))}
              {user ? (
                <button
                  onClick={() => { navigate(`/${user.role}-dashboard`); setMobileOpen(false); }}
                  className="mt-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-green-800"
                >
                  Go to Dashboard
                </button>
              ) : (
                <button
                  onClick={() => { navigate('/auth'); setMobileOpen(false); }}
                  className="mt-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-green-800"
                >
                  Get started — it's free
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
