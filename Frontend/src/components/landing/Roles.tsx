import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Building2, Bike, Check, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Reveal, StaggerReveal, fadeUp } from '../ui/motion';

const ROLES = [
  {
    icon: Store,
    title: 'For Donors',
    tagline: 'Restaurants, grocers & businesses',
    description: 'Turn your daily surplus into community impact. List in seconds, track outcomes.',
    points: [
      'List surplus food in under 60 seconds',
      'Reduce waste-disposal costs',
      'Receive a monthly impact report',
      'Set recurring donation schedules',
    ],
    cta: 'Become a donor',
    color: 'from-green-600 to-emerald-600',
    iconBg: 'bg-green-100 text-green-600',
    featured: false,
  },
  {
    icon: Building2,
    title: 'For NGOs',
    tagline: 'Charities, food banks & shelters',
    description: 'Receive matched food donations directly to your door. No phone-tag, just food.',
    points: [
      'Get instant donation alerts',
      'Smart matching to your food preferences',
      'Coordinate your volunteer fleet',
      'Inventory log & delivery tracking',
    ],
    cta: 'Partner as an NGO',
    color: 'from-blue-600 to-violet-600',
    iconBg: 'bg-blue-100 text-blue-600',
    featured: true,
  },
  {
    icon: Bike,
    title: 'For Volunteers',
    tagline: 'Everyday changemakers',
    description: 'Pick up and deliver nearby rescues. Build your community impact record.',
    points: [
      'Browse nearby tasks on a live map',
      'Live GPS tracking during deliveries',
      'Earn ratings and recognition',
      'Proof-of-delivery photo upload',
    ],
    cta: 'Start volunteering',
    color: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-100 text-amber-600',
    featured: false,
  },
];

const Roles: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-[#F8FAFC] py-24">
      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}
        <Reveal className="mx-auto mb-16 max-w-2xl text-center">
          <span className="inline-block rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-green-700">
            Who it's for
          </span>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            There's a place for everyone
            <br />
            <span className="text-gray-400">at the table</span>
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            However you show up, you help close the gap between waste and want.
          </p>
        </Reveal>

        {/* Cards */}
        <StaggerReveal className="grid grid-cols-1 gap-6 md:grid-cols-3" stagger={0.12}>
          {ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={role.title}
                variants={fadeUp}
                whileHover={{ y: -8 }}
                className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300
                  ${role.featured
                    ? 'border-transparent bg-white ring-2 ring-blue-200 shadow-xl shadow-blue-100/40'
                    : 'border-gray-100 bg-white shadow-sm hover:shadow-xl'
                  }`}
              >
                {/* Featured badge */}
                {role.featured && (
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2 text-xs font-bold text-white">
                    <Sparkles className="h-3.5 w-3.5" />
                    Most popular for food rescue
                  </div>
                )}

                <div className="flex flex-1 flex-col p-7">
                  {/* Icon */}
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${role.iconBg}`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Copy */}
                  <h3 className="text-xl font-bold text-gray-900">{role.title}</h3>
                  <p className="mt-1 text-xs font-medium text-gray-400 uppercase tracking-wide">{role.tagline}</p>
                  <p className="mt-3 text-sm leading-relaxed text-gray-500">{role.description}</p>

                  {/* Feature list */}
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {role.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-sm text-gray-700">
                        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-100">
                          <Check className="h-2.5 w-2.5 text-green-600" />
                        </div>
                        {p}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/auth')}
                    className={`mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r py-3 text-sm font-bold text-white transition-all hover:opacity-90 ${role.color}`}
                  >
                    {role.cta}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </StaggerReveal>
      </div>
    </section>
  );
};

export default Roles;
