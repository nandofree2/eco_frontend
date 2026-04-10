import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import { Package, Users, Tags, Scale, Wifi, WifiOff, AlertCircle, RefreshCw, ShieldAlert, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AppLauncher from '../components/AppLauncher';
import SEO from '../components/SEO';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const location = useLocation();
  const navigate = useNavigate();
  const [showForbidden, setShowForbidden] = useState(false);

  useEffect(() => {
    // Check if we were redirected due to lack of permissions
    if (location.state?.forbidden) {
      setShowForbidden(true);
      // Clean up the state so it doesn't reappear on manual refresh
      navigate(location.pathname, { replace: true, state: {} });
      
      // Auto-hide after 6 seconds
      const timer = setTimeout(() => setShowForbidden(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.dashboard.getStats();
        setStats(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [retryCount]);

  const statCards = [
    { name: 'Products', value: stats?.products_count ?? '-', icon: Package, color: 'text-blue-600', bg: 'bg-blue-100', path: '/products' },
    { name: 'Categories', value: stats?.categories_count ?? '-', icon: Tags, color: 'text-orange-600', bg: 'bg-orange-100', path: '/categories' },
    { name: 'Units', value: stats?.units_count ?? '-', icon: Scale, color: 'text-purple-600', bg: 'bg-purple-100', path: '/units' },
    { name: 'Users', value: stats?.users_count ?? '-', icon: Users, color: 'text-green-600', bg: 'bg-green-100', path: '/users' },
  ];

  const chartData = [
    { name: 'Products', count: stats?.products_count || 0 },
    { name: 'Categories', count: stats?.categories_count || 0 },
    { name: 'Units', count: stats?.units_count || 0 },
    { name: 'Users', count: stats?.users_count || 0 },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <SEO 
        title="Dashboard" 
        description="Monitor your sustainable marketplace performance and manage platform resources."
      />
      {/* Forbidden Access Warning */}
      {showForbidden && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-lg animate-in slide-in-from-top-4 duration-500 flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 p-2 rounded-full">
              <ShieldAlert className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-amber-900">Access Denied</p>
              <p className="text-amber-700 text-sm font-medium">Access Denied: You are not authorized to perform this Action.</p>
            </div>
          </div>
          <button onClick={() => setShowForbidden(false)} className="text-amber-400 hover:text-amber-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* App Launcher Section - The "Landing Menu" */}
      <AppLauncher />

      <div className="pt-8 border-t border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div>
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest text-sm">System Overview</h2>
              <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">Real-time platform statistics and activity</p>
          </div>
          
          <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                  error ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'
              }`}>
                  {error ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
                  {error ? 'API Offline' : 'API Online'}
              </div>
              <button 
                  onClick={() => setRetryCount(prev => prev + 1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
                  title="Refresh Statistics"
              >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-8 flex items-start gap-6 animate-in fade-in slide-in-from-top-4 duration-300 shadow-xl shadow-red-100/50 mb-8">
              <div className="bg-red-100 p-4 rounded-2xl">
                  <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div className="flex-1">
                  <h3 className="text-xl font-black text-red-800 uppercase tracking-widest text-sm mb-2">Connection Error</h3>
                  <p className="text-red-700 font-medium">{error}</p>
                  <div className="mt-6 flex gap-4">
                      <button 
                          onClick={() => setRetryCount(prev => prev + 1)}
                          className="bg-red-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95"
                      >
                          Retry Connection
                      </button>
                      <a 
                          href="https://concealable-reemergent-leota.ngrok-free.dev" 
                          target="_blank" 
                          rel="noreferrer"
                          className="bg-white text-red-600 border border-red-200 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                      >
                          Verify Ngrok URL
                      </a>
                  </div>
              </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {statCards.map((item) => (
            <div key={item.name} className="bg-white overflow-hidden shadow-xl shadow-gray-200/40 rounded-[2rem] border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
              <div className="p-8">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-4 rounded-2xl ${item.bg} group-hover:scale-110 transition-transform shadow-inner`}>
                       <item.icon className={`h-7 w-7 ${item.color}`} aria-hidden="true" />
                    </div>
                  </div>
                  <div className="ml-6 w-0 flex-1">
                    <dl>
                      <dt className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.name}</dt>
                      <dd>
                        <div className="text-3xl font-black text-gray-900 mt-1">{loading ? '...' : item.value}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50/50 px-8 py-4 border-t border-gray-50">
                <div className="text-xs">
                  <button onClick={() => navigate(item.path)} className="font-black text-eco-600 hover:text-eco-800 flex items-center justify-between w-full uppercase tracking-widest">
                    Manage {item.name}
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                      <RefreshCw className="w-3 h-3 text-eco-400 group-hover:rotate-180 transition-transform duration-700" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Section */}
        {!error && (
          <div className="bg-white shadow-2xl shadow-gray-200/40 rounded-[3rem] p-10 border border-gray-100">
              <div className="flex items-center justify-between mb-10">
                  <div>
                      <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">Platform Activity</h3>
                      <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">Resource distribution across the system.</p>
                  </div>
                  <div className="flex gap-3 items-center">
                      <div className="w-3 h-3 rounded-full bg-eco-500 shadow-sm shadow-eco-200"></div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Records</span>
                  </div>
              </div>
              <div className="h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <defs>
                              <linearGradient id="ecoGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.4}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                              dataKey="name" 
                              tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} 
                              axisLine={false} 
                              tickLine={false} 
                              dy={15}
                          />
                          <YAxis 
                              tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                              axisLine={false} 
                              tickLine={false} 
                          />
                          <Tooltip 
                              cursor={{fill: '#f8fafc'}} 
                              contentStyle={{
                                  borderRadius: '24px', 
                                  border: '1px solid #f1f5f9', 
                                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                                  padding: '16px',
                                  fontSize: '12px',
                                  fontWeight: 'bold'
                              }} 
                          />
                          <Bar 
                              dataKey="count" 
                              fill="url(#ecoGradient)" 
                              radius={[12, 12, 0, 0]} 
                              barSize={70} 
                              animationDuration={2000}
                          />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;