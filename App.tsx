import React, { useState, useEffect, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/products/ProductList';
import UserList from './pages/UserList';
import Profile from './pages/Profile';
import CategoryList from './pages/CategoryList';
import UnitList from './pages/units/UnitList';
import RoleList from './pages/roles/RoleList';
import RoleForm from './pages/roles/RoleForm';
import ProvinceList from './pages/ProvinceList';
import CityList from './pages/CityList';
import BranchList from './pages/BranchList';
import CustomerList from './pages/CustomerList';
import StockProductList from './pages/StockProductList';
import AdjustmentProductList from './pages/AdjustmentProductList';
import { AuthState } from './types';
import { AbilityProvider, AbilityContext } from './context/AbilityContext';
// Import singleton ability to ensure it's hydrated globally
import { parseRules, Subject, ability } from './services/ability';

interface ProtectedRouteProps {
  auth: AuthState;
  setAuth: (auth: AuthState) => void;
  children: React.ReactNode;
  resource?: Subject;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ auth, setAuth, children, resource }) => {
  const abilityContext = useContext(AbilityContext);
  const location = useLocation();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Strict Protection: If resource is defined, check read permission
  if (resource && resource !== 'Dashboard' && !abilityContext.can('read', resource)) {
    console.warn("Access Denied: You are not authorized to perform this Action.");
    // Pass state to Dashboard so it can show a visual warning
    return <Navigate to="/" replace state={{ forbidden: true }} />;
  }

  return <Layout auth={auth} setAuth={setAuth}>{children}</Layout>;
};

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    token: null,
  });

  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
     try {
         const storedUser = localStorage.getItem('ecolocal_user');
         const storedToken = localStorage.getItem('ecolocal_token');
         
         if (storedUser && storedToken) {
             const user = JSON.parse(storedUser);
             
             // Sync Ability from stored user data using the singleton ability instance
             if (user.role_ability) {
                const rules = parseRules(user.role_ability);
                ability.update(rules);
             } else if (user.role?.name === 'Owner' || user.role_name === 'Owner') {
                ability.update([{ action: 'manage', subject: 'all' }]);
             }
             
             setAuth({
                 user: user,
                 token: storedToken,
                 isAuthenticated: true
             });
         }
     } catch (err) {
         console.error('Hydration failed:', err);
         localStorage.removeItem('ecolocal_user');
         localStorage.removeItem('ecolocal_token');
     } finally {
         setIsHydrating(false);
     }
  }, []);

  if (isHydrating) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-eco-600 mb-4"></div>
                  <p className="text-gray-500 font-medium">Restoring Session...</p>
              </div>
          </div>
      );
  }

  return (
    <AbilityProvider>
        <Router>
        <Routes>
            <Route path="/login" element={
                auth.isAuthenticated ? <Navigate to="/" replace /> : <Login setAuth={setAuth} />
            } />

            <Route path="/register" element={
                auth.isAuthenticated ? <Navigate to="/" replace /> : <Register setAuth={setAuth} />
            } />
            
            <Route path="/" element={
            <ProtectedRoute auth={auth} setAuth={setAuth} resource="Dashboard">
                <Dashboard />
            </ProtectedRoute>
            } />

            <Route path="/profile" element={
            <ProtectedRoute auth={auth} setAuth={setAuth}>
                <Profile />
            </ProtectedRoute>
            } />
            
            <Route path="/products" element={
            <ProtectedRoute auth={auth} setAuth={setAuth} resource="Product">
                <ProductList />
            </ProtectedRoute>
            } />

            <Route path="/categories" element={
            <ProtectedRoute auth={auth} setAuth={setAuth} resource="Category">
                <CategoryList />
            </ProtectedRoute>
            } />

            <Route path="/units" element={
            <ProtectedRoute auth={auth} setAuth={setAuth} resource="UnitOfMeasurement">
                <UnitList />
            </ProtectedRoute>
            } />

            <Route path="/users" element={
            <ProtectedRoute auth={auth} setAuth={setAuth} resource="User">
                <UserList />
            </ProtectedRoute>
            } />

            <Route path="/roles" element={
            <ProtectedRoute auth={auth} setAuth={setAuth} resource="Role">
                <RoleList />
            </ProtectedRoute>
            } />

            <Route path="/roles/new" element={
            <ProtectedRoute auth={auth} setAuth={setAuth} resource="Role">
                <RoleForm />
            </ProtectedRoute>
            } />

            <Route path="/roles/:id" element={
            <ProtectedRoute auth={auth} setAuth={setAuth} resource="Role">
                <RoleForm />
            </ProtectedRoute>
            } />

            <Route path="/provinces" element={
            <ProtectedRoute auth={auth} setAuth={setAuth} resource="Province">
                <ProvinceList />
            </ProtectedRoute>
            } />

            <Route path="/cities" element={
            <ProtectedRoute auth={auth} setAuth={setAuth} resource="City">
                <CityList />
            </ProtectedRoute>
            } />

            <Route path="/branches" element={
            <ProtectedRoute auth={auth} setAuth={setAuth} resource="Branch">
                <BranchList />
            </ProtectedRoute>
            } />

            <Route path="/customers" element={
            <ProtectedRoute auth={auth} setAuth={setAuth} resource="Customer">
                <CustomerList />
            </ProtectedRoute>
            } />

            <Route path="/stock_products" element={
            <ProtectedRoute auth={auth} setAuth={setAuth} resource="StockProduct">
                <StockProductList />
            </ProtectedRoute>
            } />

            <Route path="/adjustment_products" element={
            <ProtectedRoute auth={auth} setAuth={setAuth} resource="AdjustmentProduct">
                <AdjustmentProductList />
            </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Router>
    </AbilityProvider>
  );
};

export default App;