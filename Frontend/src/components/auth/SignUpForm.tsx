import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Building, Eye, EyeOff, Loader2 } from 'lucide-react';
import { UserRole, User as AuthUser } from '../../types/auth';
import { useAuth } from '../../contexts/AuthContext';
import api from '@/utils/axios';

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

const INPUT_CLS =
  'w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:opacity-60';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'donor', label: 'Food Donor' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'ngo', label: 'NGO / Organisation' },
];

const SignUpForm: React.FC<SignUpFormProps> = () => {
  const { orgNames } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '', email: '', password: '', role: 'donor', organization_name: '', contact_number: '',
  });

  const set = (field: keyof FormData, value: string) =>
    setFormData((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const { name, email, password, role, organization_name, contact_number } = formData;
    if (!name || !email || !password || !role) { setError('Please fill in all required fields.'); return; }
    if (!/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,6}$/.test(email)) { setError('Please enter a valid email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if ((role === 'ngo' || role === 'volunteer') && (!organization_name || !contact_number)) {
      setError('Please fill in all required fields for your role.'); return;
    }
    setIsLoading(true);
    try {
      await api.post('/auth/register', formData);
      setSuccess('Request sent! You will receive an email once your account is approved.');
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : 'Sign-up failed. Please try again.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>
      )}

      {/* Full name */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">Full name</label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" value={formData.name} onChange={(e) => set('name', e.target.value)}
            placeholder="Jane Doe" className={INPUT_CLS} required disabled={isLoading} />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="email" value={formData.email} onChange={(e) => set('email', e.target.value)}
            placeholder="you@example.com" className={INPUT_CLS} required disabled={isLoading} />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => set('password', e.target.value)}
            placeholder="Min. 6 characters"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:opacity-60"
            required
            disabled={isLoading}
          />
          <button type="button" onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" disabled={isLoading}>
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Role */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">I am a…</label>
        <div className="grid grid-cols-3 gap-2">
          {ROLES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => set('role', value)}
              disabled={isLoading}
              className={`rounded-xl border py-2.5 text-xs font-semibold transition
                ${formData.role === value
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:text-green-600'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* NGO / Volunteer extra fields */}
      {(formData.role === 'ngo' || formData.role === 'volunteer') && (
        <>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Organisation</label>
            <div className="relative">
              <Building className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              {formData.role === 'volunteer' ? (
                <select
                  value={formData.organization_name}
                  onChange={(e) => set('organization_name', e.target.value)}
                  className={INPUT_CLS}
                  required
                  disabled={isLoading}
                >
                  <option value="">Select an organisation</option>
                  {(orgNames as Organization[]).map((org) => (
                    <option key={org._id} value={org.organization_name}>{org.organization_name}</option>
                  ))}
                </select>
              ) : (
                <input type="text" value={formData.organization_name}
                  onChange={(e) => set('organization_name', e.target.value)}
                  placeholder="Organisation name" className={INPUT_CLS} required disabled={isLoading} />
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Contact number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input type="text" value={formData.contact_number}
                onChange={(e) => set('contact_number', e.target.value)}
                placeholder="+92 300 1234567" className={INPUT_CLS} required disabled={isLoading} />
            </div>
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Creating account…</>
        ) : (
          'Create account'
        )}
      </button>
    </form>
  );
};

export default SignUpForm;
