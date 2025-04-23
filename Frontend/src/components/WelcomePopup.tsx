import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface WelcomePopupProps {
  onClose: () => void;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('hasSeenWelcomePopup');
    if (!hasSeenPopup) {
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenWelcomePopup', 'true');
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 transform transition-all duration-300 scale-100 opacity-100">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="text-center space-y-6">
          <div className="inline-block p-3 bg-green-100 rounded-full">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-3xl text-white">🌱</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">Welcome to Zero Hunger</h2>
            <p className="text-gray-600">
              "The best way to find yourself is to lose yourself in the service of others."
            </p>
            <p className="text-sm text-gray-500 italic">- Mahatma Gandhi</p>
          </div>
          
          <div className="pt-4">
            <p className="text-gray-600 mb-4">
              Join us in our mission to create a world where no one goes hungry and no food goes to waste.
            </p>
            <button
              onClick={handleClose}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 transform hover:-translate-y-1"
            >
              Let's Make a Difference
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;