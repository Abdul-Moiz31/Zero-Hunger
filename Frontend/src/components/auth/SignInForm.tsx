import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '@/types/auth';


type SignInForm = {
  onSuccess: (user: User) => void;
};
type AuthResponse = {
  user: {
    role: string;
  };
};

const SignInForm: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = (await signIn(
        formData.email.trim(),
        formData.password.trim()
      )) as unknown as AuthResponse;

      if (!response?.user?.role) {
        throw new Error('Invalid response from server');
      }

      // Redirect user based on their role
      navigate(`/dashboard/${response.user.role}`);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Invalid email or password. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Email */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter your email"
            required
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter your password"
            required
          />
        </div>
      </div>

      {/* Forgot password link */}
      <div className="text-right text-sm">
        <button
          type="button"
          onClick={() => navigate('/forgot-password')}
          className="text-green-600 hover:underline transition duration-300"
        >
          Forgot Password?
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-500 transition duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Signing in...
          </div>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  );
};

export default SignInForm;
