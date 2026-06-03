import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Building2, Bike, Check } from 'lucide-react';
import { Reveal, staggerContainer, fadeUp, motion } from '../ui/motion';

const ROLES = [
  {
    icon: Store,
    title: 'For Donors',
    tagline: 'Restaurants, grocers & businesses',
    points: ['List surplus in seconds', 'Cut waste & disposal costs', 'See your community impact'],
  },
  {
    icon: Building2,
    title: 'For NGOs',
    tagline: 'Charities & food banks',
    points: ['Get instant donation alerts', 'Claim what fits your mission', 'Coordinate your volunteers'],
    featured: true,
  },
  {
    icon: Bike,
    title: 'For Volunteers',
    tagline: 'Everyday changemakers',
    points: ['Pick up nearby tasks', 'Track every delivery', 'Build a rescue record'],
  },
];

const Roles: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-6">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            There's a place for everyone at the table
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            However you show up, you help close the gap between waste and want.
          </p>
        </Reveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={role.title}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className={`flex flex-col rounded-2xl border p-7 shadow-sm transition-shadow hover:shadow-lg ${
                  role.featured ? 'border-green-200 bg-green-50/50 ring-1 ring-green-100' : 'border-gray-100 bg-white'
                }`}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{role.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{role.tagline}</p>
                <ul className="mt-5 space-y-2.5">
                  {role.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      {p}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/auth')}
                  className="mt-7 w-full rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700"
                >
                  Join as {role.title.replace('For ', '')}
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Roles;
