import React from 'react';
import { PackagePlus, HandHeart, Truck, PartyPopper } from 'lucide-react';
import { Reveal, staggerContainer, fadeUp, motion } from '../ui/motion';

const STEPS = [
  {
    icon: PackagePlus,
    title: 'Donors post surplus',
    body: 'Restaurants, grocers, and businesses list extra food in seconds — with quantity, pickup window, and a photo.',
  },
  {
    icon: HandHeart,
    title: 'NGOs claim it',
    body: 'Local NGOs get notified instantly and claim donations that fit the communities they serve.',
  },
  {
    icon: Truck,
    title: 'Volunteers deliver',
    body: 'Volunteers pick up and drop off, updating every step so everyone knows where the food is.',
  },
  {
    icon: PartyPopper,
    title: 'Someone eats well',
    body: 'Fresh food reaches people who need it — and good food is kept out of the landfill.',
  },
];

const HowItWorks: React.FC = () => (
  <section id="how-it-works" className="bg-gradient-to-b from-white to-green-50/50 py-20">
    <div className="container mx-auto px-6">
      <Reveal className="mx-auto mb-14 max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-wider text-green-600">
          How it works
        </span>
        <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
          From surplus to supper in four simple steps
        </h2>
      </Reveal>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div key={step.title} variants={fadeUp} className="relative">
              <div className="h-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs font-bold text-green-600">STEP {i + 1}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{step.body}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  </section>
);

export default HowItWorks;
