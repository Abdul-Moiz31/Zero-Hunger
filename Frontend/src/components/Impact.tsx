import React from 'react';
import { Utensils, Users, Building2 } from 'lucide-react';

const ImpactCard = ({ icon: Icon, number, label }: { icon: any, number: string, label: string }) => (
  <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg hover-scale">
    <Icon className="w-12 h-12 text-green-600 mb-4" />
    <h3 className="text-4xl font-bold text-gray-800 mb-2">{number}</h3>
    <p className="text-gray-600 text-center">{label}</p>
  </div>
);

const Impact = () => {
  return (
    <section id="impact" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-16 animate-fadeInUp">
          Our Impact So Far
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="animate-fadeInLeft">
            <ImpactCard
              icon={Utensils}
              number="100K+"
              label="Meals Delivered"
            />
          </div>
          <div className="animate-fadeInUp animate-delay-100">
            <ImpactCard
              icon={Building2}
              number="50+"
              label="NGOs Partnered"
            />
          </div>
          <div className="animate-fadeInRight animate-delay-200">
            <ImpactCard
              icon={Users}
              number="1000+"
              label="Active Volunteers"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Impact;