import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { AuthState } from '../types';
import SEO from '../components/SEO';
import { Leaf, AlertCircle, Building, User, Mail, Lock, CheckCircle } from 'lucide-react';
import { AbilityContext } from '../context/AbilityContext';
import { parseRules } from '../services/ability';

interface RegisterProps {
  setAuth: (auth: AuthState) => void;
}

const Register: React.FC<RegisterProps> = ({ setAuth }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    name: '',
    email: '',
    password: '',
    passwordConfirmation: ''
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const ability = useContext(AbilityContext);

  // Refs for auto-focusing invalid fields like UnitModal
  const businessNameRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfirmRef = useRef<HTMLInputElement>(null);

  // Handle focus when server errors arrive
  useEffect(() => {
    if (Object.keys(fieldErrors).length > 0) {
      if (fieldErrors.businessName) businessNameRef.current?.focus();
      else if (fieldErrors.name) nameRef.current?.focus();
      else if (fieldErrors.email) emailRef.current?.focus();
      else if (fieldErrors.password) passwordRef.current?.focus();
      else if (fieldErrors.passwordConfirmation) passwordConfirmRef.current?.focus();
    }
  }, [fieldErrors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    if (formData.password !== formData.passwordConfirmation) {
      setFieldErrors({ passwordConfirmation: ['does not match password'] });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        tenant: { name: formData.businessName },
        user: {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.passwordConfirmation
        }
      };

      const { user, token } = await api.auth.register(payload);

      // Navigate to login instead of auto-authenticating
      navigate('/login', { state: { registered: true, email: formData.email } });
    } catch (err: any) {
      if (err.status === 422 && err.errors) {
        const flattenedErrors: Record<string, string[]> = {};

        // Handle array-based errors (e.g. ["Email has already been taken"])
        if (Array.isArray(err.errors)) {
          err.errors.forEach((msg: any) => {
            if (typeof msg !== 'string') return;
            const lowMsg = msg.toLowerCase();
            if (lowMsg.includes('email')) {
              flattenedErrors.email = [...(flattenedErrors.email || []), msg];
            } else if (lowMsg.includes('password confirmation') || lowMsg.includes('password_confirmation')) {
              flattenedErrors.passwordConfirmation = [...(flattenedErrors.passwordConfirmation || []), msg];
            } else if (lowMsg.includes('password')) {
              flattenedErrors.password = [...(flattenedErrors.password || []), msg];
            } else if (lowMsg.includes('business') || lowMsg.includes('tenant') || (lowMsg.includes('name') && !lowMsg.includes('user'))) {
              flattenedErrors.businessName = [...(flattenedErrors.businessName || []), msg];
            } else if (lowMsg.includes('name')) {
              flattenedErrors.name = [...(flattenedErrors.name || []), msg];
            }
          });
        } else {
          // Handle object-based errors (e.g. { "tenant_name": ["taken"] })
          Object.keys(err.errors).forEach(key => {
            const lowKey = key.toLowerCase();
            const val = err.errors[key];

            if (lowKey.includes('tenant_name') || lowKey.includes('tenant.name') || lowKey === 'business_name') {
              flattenedErrors.businessName = val;
            } else if (lowKey.includes('email')) {
              flattenedErrors.email = val;
            } else if (lowKey.includes('user.name') || lowKey === 'name') {
              // If there's a generic 'name' and we haven't assigned businessName, try to guess or use both
              if (lowKey === 'name' && !flattenedErrors.businessName) {
                flattenedErrors.businessName = val;
              } else {
                flattenedErrors.name = val;
              }
            } else if (lowKey.includes('password_confirmation')) {
              flattenedErrors.passwordConfirmation = val;
            } else if (lowKey.includes('password')) {
              flattenedErrors.password = val;
            } else {
              flattenedErrors[key] = val;
            }
          });
        }

        setFieldErrors(flattenedErrors);
        setError('Validation failed. Please correct the highlighted fields.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const hasError = (field: string) => fieldErrors[field] && fieldErrors[field].length > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <SEO
        title="Register Business"
        description="Join EcoLocal and start managing your sustainable business and product catalog today."
      />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 bg-eco-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Leaf className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create Your EcoLocal Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Start managing your business and catalog today.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-800">Check your information</p>
                  <p className="text-xs text-red-600 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label className={`block text-sm font-bold mb-1 flex items-center gap-2 ${hasError('businessName') ? 'text-red-600' : 'text-gray-700'}`}>
                <Building className={`w-4 h-4 ${hasError('businessName') ? 'text-red-500' : 'text-eco-500'}`} /> Business Name
              </label>
              <input
                ref={businessNameRef}
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className={`appearance-none block w-full px-4 py-2.5 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 transition-all font-medium ${hasError('businessName')
                    ? 'border-red-300 ring-2 ring-red-100 focus:border-red-500 bg-red-50/30'
                    : 'border-gray-200 focus:ring-eco-500/10 focus:border-eco-500'
                  }`}
                placeholder="e.g. Green Earth Organics"
              />
              {hasError('businessName') && (
                <p className="mt-1 text-xs text-red-500 font-bold flex items-center gap-1 animate-in slide-in-from-top-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.businessName[0].includes('Name') ? fieldErrors.businessName[0] : `Name ${fieldErrors.businessName[0]}`}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className={`block text-sm font-bold mb-1 flex items-center gap-2 ${hasError('name') ? 'text-red-600' : 'text-gray-700'}`}>
                  <User className={`w-4 h-4 ${hasError('name') ? 'text-red-500' : 'text-eco-500'}`} /> Owner Name
                </label>
                <input
                  ref={nameRef}
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`appearance-none block w-full px-4 py-2.5 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 transition-all font-medium ${hasError('name')
                      ? 'border-red-300 ring-2 ring-red-100 focus:border-red-500 bg-red-50/30'
                      : 'border-gray-200 focus:ring-eco-500/10 focus:border-eco-500'
                    }`}
                  placeholder="Your Full Name"
                />
                {hasError('name') && (
                  <p className="mt-1 text-xs text-red-500 font-bold flex items-center gap-1 animate-in slide-in-from-top-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.name[0]}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-bold mb-1 flex items-center gap-2 ${hasError('email') ? 'text-red-600' : 'text-gray-700'}`}>
                  <Mail className={`w-4 h-4 ${hasError('email') ? 'text-red-500' : 'text-eco-500'}`} /> Email Address
                </label>
                <input
                  ref={emailRef}
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`appearance-none block w-full px-4 py-2.5 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 transition-all font-medium ${hasError('email')
                      ? 'border-red-300 ring-2 ring-red-100 focus:border-red-500 bg-red-50/30'
                      : 'border-gray-200 focus:ring-eco-500/10 focus:border-eco-500'
                    }`}
                  placeholder="owner@example.com"
                />
                {hasError('email') && (
                  <p className="mt-1 text-xs text-red-500 font-bold flex items-center gap-1 animate-in slide-in-from-top-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.email[0].includes('Email') ? fieldErrors.email[0] : `Email ${fieldErrors.email[0]}`}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-bold mb-1 flex items-center gap-2 ${hasError('password') ? 'text-red-600' : 'text-gray-700'}`}>
                  <Lock className={`w-4 h-4 ${hasError('password') ? 'text-red-500' : 'text-eco-500'}`} /> Password
                </label>
                <input
                  ref={passwordRef}
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`appearance-none block w-full px-4 py-2.5 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 transition-all ${hasError('password')
                      ? 'border-red-300 ring-2 ring-red-100 focus:border-red-500 bg-red-50/30'
                      : 'border-gray-200 focus:ring-eco-500/10 focus:border-eco-500'
                    }`}
                />
                {hasError('password') && (
                  <p className="mt-1 text-xs text-red-500 font-bold flex items-center gap-1 animate-in slide-in-from-top-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.password[0].includes('Password') ? fieldErrors.password[0] : `Password ${fieldErrors.password[0]}`}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-bold mb-1 flex items-center gap-2 ${hasError('passwordConfirmation') ? 'text-red-600' : 'text-gray-700'}`}>
                  <CheckCircle className={`w-4 h-4 ${hasError('passwordConfirmation') ? 'text-red-500' : 'text-eco-500'}`} /> Confirm
                </label>
                <input
                  ref={passwordConfirmRef}
                  type="password"
                  required
                  value={formData.passwordConfirmation}
                  onChange={(e) => setFormData({ ...formData, passwordConfirmation: e.target.value })}
                  className={`appearance-none block w-full px-4 py-2.5 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 transition-all ${hasError('passwordConfirmation')
                      ? 'border-red-300 ring-2 ring-red-100 focus:border-red-500 bg-red-50/30'
                      : 'border-gray-200 focus:ring-eco-500/10 focus:border-eco-500'
                    }`}
                />
                {hasError('passwordConfirmation') && (
                  <p className="mt-1 text-xs text-red-500 font-bold flex items-center gap-1 animate-in slide-in-from-top-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.passwordConfirmation[0].includes('Password') ? fieldErrors.passwordConfirmation[0] : `Password ${fieldErrors.passwordConfirmation[0]}`}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-eco-100 text-sm font-bold text-white bg-eco-600 hover:bg-eco-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-500 disabled:opacity-50 transition-all active:scale-95"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </div>
                ) : 'Register Business'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 font-medium">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all"
              >
                Sign in instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;