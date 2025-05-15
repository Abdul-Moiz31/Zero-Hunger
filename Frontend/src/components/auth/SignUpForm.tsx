import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Building } from 'lucide-react';
import { UserRole, User as AuthUser } from '../../types/auth';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type SignUpFormProps = {
  onSuccess?: (user: AuthUser) => void;
};

const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess }) => {
  const { signIn, orgNames } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'donor' as UserRole,
    organization_name: '',
    contact_number: ''
  });

  const validateEmail = (email: string) => /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,6}$/.test(email);
  const validatePassword = (password: string) => password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
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
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Sign-up failed');
      }
      setSuccess('Account created successfully!');
      await signIn(email, password);
      onSuccess?.(JSON.parse(localStorage.getItem('user') || '{}'));
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-sm bg-red-100 text-red-600 p-2 rounded">{error}</div>}
      {success && <div className="text-sm bg-green-100 text-green-600 p-2 rounded">{success}</div>}

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Full Name</label>
        <div className="relative">
          <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={formData.name}
            onChange={e => handleChange('name', e.target.value)}
            placeholder="Enter full name"
            className="pl-10 w-full p-3 border border-gray-300 rounded-lg"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="email"
            value={formData.email}
            onChange={e => handleChange('email', e.target.value)}
            placeholder="Enter email"
            className="pl-10 w-full p-3 border border-gray-300 rounded-lg"
            required
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="password"
            value={formData.password}
            onChange={e => handleChange('password', e.target.value)}
            placeholder="Enter password"
            className="pl-10 w-full p-3 border border-gray-300 rounded-lg"
            required
          />
        </div>
      </div>

      {/* Role */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Select Role</label>
        <select
          value={formData.role}
          onChange={e => handleChange('role', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Organization</label>
            <div className="relative">
              <Building className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              {formData.role === 'volunteer' ? (
                <select
                  value={formData.organization_name}
                  onChange={e => handleChange('organization_name', e.target.value)}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select an organization</option>
                  {orgNames.map(org => (
                    <option key={org._id} value={org.organization_name}>
                      {org.organization_name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.organization_name}
                  onChange={e => handleChange('organization_name', e.target.value)}
                  placeholder="Enter organization name"
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              )}
            </div>
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={formData.contact_number}
                onChange={e => handleChange('contact_number', e.target.value)}
                placeholder="Enter contact number"
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg"
                required
              />
            </div>
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
      >
        {isLoading ? 'Creating Account...' : 'Sign Up'}
      </button>
    </form>
  );
};

export default SignUpForm;