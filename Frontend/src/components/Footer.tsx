import React from 'react';
import { UtensilsCrossed, Facebook, Twitter, Instagram, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-800 text-white" aria-label="Footer">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div 
              onClick={() => navigate('/')} 
              className="flex items-center space-x-2 mb-4 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <div className="bg-white rounded-full p-1">
                <UtensilsCrossed className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xl font-bold">Zero Hunger</span>
            </div>
            <p className="text-gray-400">
              Creating a world where no food goes to waste and no one goes hungry.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#about" className="text-gray-400 hover:text-white">About Us</a></li>
              <li><a href="#how-it-works" className="text-gray-400 hover:text-white">How It Works</a></li>
              <li><a href="#impact" className="text-gray-400 hover:text-white">Our Impact</a></li>
              <li><a href="#testimonials" className="text-gray-400 hover:text-white">Testimonials</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Get Involved</h3>
            <ul className="space-y-2">
              <li><button onClick={() => navigate('/auth')} className="text-gray-400 hover:text-white">Donate Food</button></li>
              <li><button onClick={() => navigate('/auth')} className="text-gray-400 hover:text-white">Volunteer</button></li>
              <li><button onClick={() => navigate('/auth')} className="text-gray-400 hover:text-white">NGO Partnership</button></li>
              <li><a href="#contact" className="text-gray-400 hover:text-white">Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Zero Hunger. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;