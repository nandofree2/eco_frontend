import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AbilityContext } from '../context/AbilityContext';
import { NAV_STRUCTURE } from '../constants';

const AppLauncher: React.FC = () => {
  const ability = useContext(AbilityContext);
  const navigate = useNavigate();

  // Flatten the structure to show all accessible leaf nodes (actual pages)
  const accessibleApps: { label: string; path: string; icon: any; colorClass: string; description?: string }[] = [];

  NAV_STRUCTURE.forEach(item => {
    if (item.children) {
      item.children.forEach(child => {
        if (ability.can('see_menu', child.resource) || ability.can('manage', 'all')) {
          accessibleApps.push({
            label: child.label,
            path: child.path,
            icon: child.icon,
            colorClass: item.colorClass,
            description: child.description
          });
        }
      });
    } else if (item.path && item.path !== '/') { // Skip dashboard in the launcher if it's already the landing
      if (ability.can('see_menu', item.resource!) || ability.can('manage', 'all')) {
        accessibleApps.push({
          label: item.label,
          path: item.path,
          icon: item.icon,
          colorClass: item.colorClass,
          description: item.description
        });
      }
    }
  });

  return (
    <div className="py-8">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
        <p className="text-gray-500 font-medium mt-2">Select an application to get started with your workflow.</p>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4 max-w-6xl">
        {accessibleApps.map((app) => {
          const Icon = app.icon;
          return (
            <button
              key={app.path}
              onClick={() => navigate(app.path)}
              className="group flex flex-col items-center transition-all duration-300"
            >
              <div className="relative mb-2">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg shadow-gray-200/40 flex items-center justify-center group-hover:shadow-xl group-hover:shadow-eco-200/30 transition-all duration-500 group-hover:-translate-y-1 border border-gray-50">
                  <div className={`w-10 h-10 ${app.colorClass} rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                
                {/* Hover indicator dot */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-eco-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <h3 className="font-bold text-gray-800 text-[10px] leading-tight text-center tracking-tight group-hover:text-eco-600 transition-colors">{app.label}</h3>
              <p className="text-[7px] text-gray-400 font-black uppercase tracking-[0.05em] mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Open
              </p>
            </button>
          );
        })}
      </div>

      {accessibleApps.length === 0 && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[3rem] p-20 text-center">
          <p className="text-gray-400 font-bold text-lg italic">No applications available for your current role.</p>
          <p className="text-gray-300 text-sm mt-2">Please contact your administrator for access permissions.</p>
        </div>
      )}
    </div>
  );
};

export default AppLauncher;
