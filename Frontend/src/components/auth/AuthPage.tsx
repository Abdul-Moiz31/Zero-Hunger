import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ArrowRight } from 'lucide-react';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import { User } from '@/types/auth'; // ✅ Import the correct User type

const AuthPage = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const navigate = useNavigate();

  // ✅ Use correct type here instead of 'any'
  const handleAuthSuccess = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    navigate(`/${userData.role}-dashboard`);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Background and Quote */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 to-green-800/90" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white animate-fadeInLeft">
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center space-x-3 mb-12 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="bg-white rounded-full p-2">
              <UtensilsCrossed className="w-10 h-10 text-green-600" />
            </div>
            <span className="text-3xl font-bold">Zero Hunger</span>
          </div>
          <blockquote className="text-3xl font-light italic mb-6">
            "Alone we can do so little; together we can do so much."
          </blockquote>
          <p className="text-xl mb-8">
            Join our community of donors, NGOs, and volunteers working together to eliminate hunger and reduce food waste.
          </p>
          <div className="space-y-4">
            {['Connect with local food donors', 'Coordinate efficient food distribution', 'Make a real impact in your community'].map((text, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="bg-white/20 p-2 rounded-full">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md animate-fadeInRight">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isSignIn ? 'Welcome Back!' : 'Join Our Mission'}
            </h2>
            <p className="text-gray-600">
              {isSignIn 
                ? 'Sign in to continue making a difference' 
                : 'Create an account to start helping your community'}
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            {isSignIn ? (
              <SignInForm onSuccess={handleAuthSuccess} />
            ) : (
              <SignUpForm onSuccess={handleAuthSuccess} />
            )}
            
            <div className="mt-6">
              <button
                onClick={() => setIsSignIn(!isSignIn)}
                className="w-full text-center text-sm text-gray-600 hover:text-green-500 transition duration-300"
              >
                {isSignIn 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
