import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, HeartHandshake } from 'lucide-react';
import { Reveal } from '../ui/motion';

const CtaBand: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-14 text-center shadow-xl sm:px-16">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

            <HeartHandshake className="mx-auto mb-5 h-12 w-12 text-white/90" />
            <h2 className="mx-auto max-w-2xl text-3xl font-bold text-white sm:text-4xl">
              Be the reason a meal finds a home tonight
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-green-50">
              It takes a minute to sign up and a lifetime of difference for someone who eats because
              you cared. Join the movement to rescue food and feed your community.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/auth')}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-green-700 shadow-sm transition-transform hover:-translate-y-0.5"
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate('/listings')}
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
              >
                See available food
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default CtaBand;
