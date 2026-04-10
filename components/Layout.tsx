import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Tags, Scale, Users, LogOut, 
  Menu, Shield, UserCircle, LucideIcon, ChevronRight, Pin, 
  Settings, User as UserIcon, ChevronDown, Bell
} from 'lucide-react';
import { AuthState } from '../types';
import { api } from '../services/api';
import { AbilityContext, Can } from '../context/AbilityContext';
import { Subject } from '../services/ability';
import { NAV_STRUCTURE, NavItem } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  auth: AuthState;
  setAuth: (auth: AuthState) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, auth, setAuth }) => {
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [lockedMenuId, setLockedMenuId] = useState<string | null>(null);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const ability = useContext(AbilityContext);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await api.auth.logout();
    ability.update([]); // Clear permissions on logout
    setAuth({ user: null, isAuthenticated: false, token: null });
    navigate('/login');
  };

  const visibleItems = NAV_STRUCTURE.filter(item => {
      if (item.menuId === 'dashboard') return ability.can('see_menu', 'Dashboard') || ability.can('manage', 'all');

      if (item.children) {
          return item.children.some(child => ability.can('see_menu', child.resource) || ability.can('manage', 'all'));
      }
      return item.resource && (ability.can('see_menu', item.resource) || ability.can('manage', 'all'));
  });

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const isParentActive = (item: NavItem) => {
    if (item.path && isActive(item.path)) return true;
    if (item.children) {
        return item.children.some(child => isActive(child.path));
    }
    return false;
  };

  const toggleLock = (menuId: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setLockedMenuId(prev => prev === menuId ? null : menuId);
  };

  return (
    <div className="app-container" onClick={() => { setLockedMenuId(null); setUserMenuOpen(false); }}>
      {isMobileOpen && <div className="mobile-overlay lg:hidden" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="sidebar-header">
            <div className="logo-icon">EL</div>
            <span className="logo-text">EcoLocal</span>
        </div>
        
        <nav className="sidebar-nav">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const active = isParentActive(item);
              const isLocked = lockedMenuId === item.menuId;

              return (
                <div key={item.label} className={`nav-group ${isLocked ? 'locked' : ''}`}>
                    {item.children ? (
                        <div 
                            className={`nav-item ${active ? 'active' : ''} ${isLocked ? 'bg-gray-100 shadow-inner' : ''}`}
                            onClick={(e) => toggleLock(item.menuId, e)}
                        >
                             <div className={`nav-icon-box ${item.colorClass}`}>
                                <Icon className="w-5 h-5" />
                             </div>
                             <span className="nav-item-text flex-1">{item.label}</span>
                             <div className="nav-item-text">
                                {isLocked ? <Pin className="w-3 h-3 text-blue-500 fill-current" /> : <ChevronRight className="w-3 h-3 text-gray-400" />}
                             </div>
                        </div>
                    ) : (
                        <Link to={item.path!} onClick={() => setMobileOpen(false)} className={`nav-item ${active ? 'active' : ''}`}>
                            <div className={`nav-icon-box ${item.colorClass}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <span className="nav-item-text">{item.label}</span>
                        </Link>
                    )}

                    {item.children && (
                        <div className="nav-group-children">
                            <div className="flyout-header">
                                <span>{item.label}</span>
                                {isLocked && <Pin className="w-3 h-3 text-blue-500" />}
                            </div>
                            <div className="flyout-grid">
                                {item.children.filter(child => ability.can('see_menu', child.resource) || ability.can('manage', 'all')).map(child => {
                                    const ChildIcon = child.icon;
                                    const childActive = isActive(child.path);
                                    return (
                                        <Link key={child.path} to={child.path} onClick={() => { setMobileOpen(false); setLockedMenuId(null); }} className={`nav-child-item ${childActive ? 'active' : ''}`}>
                                            <div className={`nav-icon-box ${item.colorClass} mb-2`}>
                                                <ChildIcon className="w-5 h-5" />
                                            </div>
                                            <span className="px-1">{child.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
              );
            })}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-item w-full">
            <div className="nav-icon-box bg-gray-400"><LogOut className="w-5 h-5" /></div>
            <span className="nav-item-text">Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="top-header">
          <button className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); setMobileOpen(true); }}>
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 flex justify-end items-center gap-4">
             <button className="p-2 text-gray-400 hover:text-eco-600 hover:bg-eco-50 rounded-full transition-all relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
             </button>

             <div className="h-8 w-px bg-gray-200 mx-1"></div>

             <div className="relative" ref={userMenuRef}>
                 <button onClick={(e) => { e.stopPropagation(); setUserMenuOpen(!isUserMenuOpen); }} className="user-profile flex items-center gap-3 p-1 rounded-full hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
                     <div className="text-right hidden sm:block">
                         <p className="text-sm font-bold text-gray-900 leading-tight">{auth.user?.name || 'User'}</p>
                         <p className="text-[10px] text-eco-600 font-bold uppercase tracking-widest">{auth.user?.role?.name || 'Authorized User'}</p>
                     </div>
                     <div className="user-avatar bg-eco-100 p-1 rounded-full border border-eco-200 shadow-sm overflow-hidden group">
                        {auth.user?.name ? (
                            <div className="w-8 h-8 flex items-center justify-center font-bold text-eco-700 bg-white rounded-full group-hover:bg-eco-50 transition-colors">
                                {auth.user.name.charAt(0)}
                            </div>
                        ) : (
                            <UserCircle className="w-8 h-8 text-eco-600" />
                        )}
                     </div>
                 </button>

                 {isUserMenuOpen && (
                     <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-200">
                         <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Identity</p>
                             <p className="text-sm font-bold text-gray-900">{auth.user?.name}</p>
                             <p className="text-[11px] text-gray-500 truncate">{auth.user?.email}</p>
                             <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-eco-100 text-eco-700 rounded-full text-[10px] font-bold">
                                <Shield className="w-3 h-3" />
                                {auth.user?.role?.name}
                             </div>
                         </div>
                         <div className="p-2">
                             <button onClick={() => navigate('/profile')} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                                 <UserIcon className="w-4 h-4 text-gray-400" /> My Profile
                             </button>
                             <button onClick={() => navigate('/roles')} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                                 <Shield className="w-4 h-4 text-gray-400" /> Permissions
                             </button>
                         </div>
                         <div className="p-2 border-t border-gray-50">
                             <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                                 <LogOut className="w-4 h-4" /> Sign Out
                             </button>
                         </div>
                     </div>
                 )}
             </div>
          </div>
        </header>

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;