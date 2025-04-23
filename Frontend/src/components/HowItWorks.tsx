import React from 'react';
import { Package2, Building, UserCheck } from 'lucide-react';

const Step = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <div className="flex flex-col items-center text-center">
    <div className="bg-green-100 p-4 rounded-full mb-4">
      <Icon className="w-8 h-8 text-green-600" />
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-16">
          How Zero Hunger Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <Step
            icon={Package2}
            title="Donors"
            description="Register and list available food donations. Our platform connects you with nearby NGOs and volunteers."
          />
          <Step
            icon={Building}
            title="NGOs"
            description="Browse available donations, coordinate with donors, and manage volunteer networks efficiently."
          />
          <Step
            icon={UserCheck}
            title="Volunteers"
            description="Sign up to help with food collection and delivery. Make a direct impact in your community."
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;