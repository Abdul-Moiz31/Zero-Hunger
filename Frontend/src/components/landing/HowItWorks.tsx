import React from 'react';
import { PackagePlus, HandHeart, Truck, PartyPopper, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Reveal, StaggerReveal, fadeUp } from '../ui/motion';

const STEPS = [
  {
    icon: PackagePlus,
    step: '01',
    title: 'Donors post surplus',
    body: 'Restaurants, grocers, and businesses list extra food in seconds — with quantity, pickup window, and a photo.',
    color: 'bg-green-600',
    lightColor: 'bg-green-50 text-green-600',
  },
  {
    icon: HandHeart,
    step: '02',
    title: 'NGOs claim it',
    body: 'Local NGOs get notified instantly and claim donations that fit the communities they serve.',
    color: 'bg-blue-600',
    lightColor: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Truck,
    step: '03',
    title: 'Volunteers deliver',
    body: 'Volunteers pick up and drop off, updating every step so everyone knows where the food is.',
    color: 'bg-amber-600',
    lightColor: 'bg-amber-50 text-amber-600',
  },
  {
    icon: PartyPopper,
    step: '04',
    title: 'Someone eats well',
    body: 'Fresh food reaches people who need it — and good food is kept out of the landfill forever.',
    color: 'bg-emerald-600',
    lightColor: 'bg-emerald-50 text-emerald-600',
  },
];

const HowItWorks: React.FC = () => (
  <section id="how-it-works" className="bg-white py-24">
    <div className="mx-auto max-w-7xl px-6">

      {/* Header */}
      <Reveal className="mx-auto mb-16 max-w-2xl text-center">
        <span className="inline-block rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-green-700">
          How it works
        </span>
        <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          From surplus to supper
          <br />
          <span className="text-gray-400">in four simple steps</span>
        </h2>
      </Reveal>

      {/* Steps */}
      <StaggerReveal className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.12}>
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.step}
              variants={fadeUp}
              whileHover={{ y: -8, scale: 1.01 }}
              className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-7 shadow-sm transition-all duration-300 hover:border-green-100 hover:shadow-xl"
            >
              {/* Step number watermark */}
              <span className="absolute right-5 top-4 text-6xl font-black text-gray-50 select-none transition-colors group-hover:text-green-50">
                {step.step}
              </span>

              {/* Icon */}
              <div className={`relative mb-5 flex h-13 w-13 items-center justify-center rounded-2xl ${step.color} shadow-lg`}
                style={{ width: 52, height: 52 }}
              >
                <Icon className="h-6 w-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{step.body}</p>

              {/* Connector arrow (not last) */}
              {i < STEPS.length - 1 && (
                <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 lg:block z-10">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
                    <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </StaggerReveal>

      {/* Bottom CTA strip */}
      <Reveal className="mt-14 text-center">
        <p className="text-sm text-gray-500">
          The whole loop — from listing to delivery — typically takes{' '}
          <span className="font-semibold text-green-700">under 2 hours.</span>
        </p>
      </Reveal>
    </div>
  </section>
);

export default HowItWorks;
