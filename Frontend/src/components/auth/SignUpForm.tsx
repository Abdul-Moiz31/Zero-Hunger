import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Building, Eye, EyeOff } from 'lucide-react';
import { UserRole, User as AuthUser } from '../../types/auth';
import { useAuth } from '../../contexts/AuthContext';
import { toast, ToastContainer } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface SignUpFormProps {
  onSuccess?: (user: AuthUser) => void;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  organization_name: string;
  contact_number: string;
}

interface Organization {
  _id: string;
  organization_name: string;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess }) => {
  const { signIn, orgNames } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    role: 'donor',
    organization_name: '',
    contact_number: '',
  });
  const [success, setSuccess] = useState<string>('');

  const validateEmail = (email: string): boolean => /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,6}$/.test(email);
  const validatePassword = (password: string): boolean => password.length >= 6;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const { name, email, password, role, organization_name, contact_number } = formData;
    if (!name || !email || !password || !role) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }
    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }
    if ((role === 'ngo' || role === 'volunteer') && (!organization_name || !contact_number)) {
      setError('Please fill in all required fields for your role.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Sign-up failed');
      }
      setSuccess('Your request has been sent for approval. You will receive an email once approved.');
      setError('');
      setIsLoading(false);
      return;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setSuccess('');
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center">{error}</div>
        )}
        {success && (
          <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center">{success}</div>
        )}

        {/* Full Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter full name"
              className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Enter email"
              className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Enter password"
              className="pl-10 pr-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Role */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Select Role</label>
          <select
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
            disabled={isLoading}
          >
            <option value="donor">Food Donor</option>
            <option value="volunteer">Volunteer</option>
            <option value="ngo">NGO</option>
          </select>
        </div>

        {/* NGO/Volunteer Fields */}
        {(formData.role === 'ngo' || formData.role === 'volunteer') && (
          <>
            {/* Organization Name or Dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Organization</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                {formData.role === 'volunteer' ? (
                  <select
                    value={formData.organization_name}
                    onChange={(e) => handleChange('organization_name', e.target.value)}
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                    required
                    disabled={isLoading}
                  >
                    <option value="">Select an organization</option>
                    {(orgNames as Organization[]).map((org) => (
                      <option key={org._id} value={org.organization_name}>
                        {org.organization_name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.organization_name}
                    onChange={(e) => handleChange('organization_name', e.target.value)}
                    placeholder="Enter organization name"
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                    required
                    disabled={isLoading}
                  />
                )}
              </div>
            </div>

            {/* Contact Number */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Contact Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.contact_number}
                  onChange={(e) => handleChange('contact_number', e.target.value)}
                  placeholder="Enter contact number"
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-500 transition duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating Account...
            </>
          ) : (
            'Sign Up'
          )}
        </button>
      </form>

      <ToastContainer />
    </div>
  );
};

export default SignUpForm;