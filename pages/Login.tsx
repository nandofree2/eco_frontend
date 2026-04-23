import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { AuthState } from '../types';
import SEO from '../components/SEO';
import { Leaf, AlertCircle, Mail, Lock, CheckCircle } from 'lucide-react';
import { AbilityContext } from '../context/AbilityContext';
import { parseRules } from '../services/ability';

interface LoginProps {
  setAuth: (auth: AuthState) => void;
}

const Login: React.FC<LoginProps> = ({ setAuth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const ability = useContext(AbilityContext);

  const registrationSuccess = location.state?.registered;
  const [email, setEmail] = useState(location.state?.email || 'owner@test.com');
  const [password, setPassword] = useState('12341234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user, token } = await api.auth.login(email, password);

      // Update CASL Ability immediately
      if (user.role_ability) {
        const rules = parseRules(user.role_ability);
        ability.update(rules);
      } else if (user.role?.name === 'Owner' || user.role_name === 'Owner') {
        ability.update([{ action: 'manage', subject: 'all' }]);
      }

      setAuth({
        user,
        isAuthenticated: true,
        token: token,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <SEO
        title="Sign In"
        description="Access your EcoLocal account to manage your sustainable marketplace and catalog."
      />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 bg-eco-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Leaf className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          EcoLocal Identity
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enterprise Resource Planning & Catalog Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
          {registrationSuccess && (
            <div className="mb-6 p-4 bg-eco-50 border border-eco-100 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
              <CheckCircle className="w-5 h-5 text-eco-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-eco-800">Registration Successful!</p>
                <p className="text-xs text-eco-600 mt-1 leading-relaxed">
                  We've sent a confirmation link to <strong>{location.state?.email}</strong>.
                  Please check your inbox (and spam folder) to verify your account before signing in.
                </p>
              </div>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                <Mail className="w-4 h-4 text-eco-500" /> Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                <Lock className="w-4 h-4 text-eco-500" /> Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-200 flex items-start animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-eco-100 text-sm font-bold text-white bg-eco-600 hover:bg-eco-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-500 disabled:opacity-50 transition-all shadow-lg active:scale-95"
              >
                {loading ? 'Authenticating...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 font-medium">New to EcoLocal?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="w-full flex justify-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all"
              >
                Create new business account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;