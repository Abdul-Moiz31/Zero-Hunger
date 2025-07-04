import React from 'react';
import { Target, Heart, Globe } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fadeInUp">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            About Zero Hunger
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to create a sustainable food ecosystem by connecting those who have with those who need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center animate-fadeInLeft hover-lift">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
            <p className="text-gray-600">
              To reduce food waste and hunger by creating an efficient distribution network connecting food donors with those in need.
            </p>
          </div>

          <div className="text-center animate-fadeInUp animate-delay-100 hover-lift">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Our Values</h3>
            <p className="text-gray-600">
              Compassion, efficiency, and sustainability drive everything we do, ensuring no food goes to waste and no person goes hungry.
            </p>
          </div>

          <div className="text-center animate-fadeInRight animate-delay-200 hover-lift">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Globe className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Our Vision</h3>
            <p className="text-gray-600">
              A world where surplus food efficiently reaches those who need it most, creating a sustainable and hunger-free future.
            </p>
          </div>
        </div>

        <div className="mt-20 animate-fadeInUp animate-delay-300">
          <div className="bg-green-50 rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Join Our Movement</h3>
                <p className="text-gray-600 mb-6">
                  Whether you're a restaurant, grocery store, NGO, or volunteer, your contribution matters. Join us in making a difference in your community.
                </p>
                <button 
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-300"
                  onClick={() => window.location.href = '#how-it-works'}
                >
                  Learn How to Get Involved
                </button>
              </div>
              <div className="relative h-64 md:h-auto">
                <img 
                  src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1650&q=80"
                  alt="Community food distribution"
                  className="w-full h-full object-cover rounded-lg"
                  onError={e => { (e.currentTarget as HTMLImageElement).src = '/default-food-image.jpg'; }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;