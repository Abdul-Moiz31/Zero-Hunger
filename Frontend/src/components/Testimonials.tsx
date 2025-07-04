import React from 'react';
import { Quote } from 'lucide-react';

const TestimonialCard = ({ quote, author, role }: { quote: string, author: string, role: string }) => (
  <div className="bg-white p-8 rounded-lg shadow-lg">
    <Quote className="w-8 h-8 text-green-600 mb-4" aria-hidden="true" />
    <p className="text-gray-600 mb-6">{quote}</p>
    <div>
      <p className="font-semibold text-gray-800">{author}</p>
      <p className="text-gray-500">{role}</p>
    </div>
  </div>
);

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-16">
          Success Stories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <TestimonialCard
            quote="Zero Hunger has revolutionized how we manage food donations. The platform's efficiency has helped us serve 50% more people in need."
            author="Sarah Johnson"
            role="NGO Director"
          />
          <TestimonialCard
            quote="As a restaurant owner, I can now easily donate surplus food. The volunteer network ensures quick pickup and delivery."
            author="Michael Chen"
            role="Restaurant Owner"
          />
          <TestimonialCard
            quote="Volunteering through Zero Hunger has been incredibly rewarding. The platform makes it easy to find opportunities to help."
            author="David Martinez"
            role="Volunteer"
          />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;