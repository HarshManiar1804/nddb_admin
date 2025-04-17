import { Link, useLocation } from 'react-router-dom';
import { routes } from '@/lib/utils';

const Sidebar = () => {
  // Get current route location to highlight active menu item
  const location = useLocation();

  return (
    <div className="h-screen bg-gray-50 border-r border-gray-200 left-0 top-0 pt-2 w-64">
      {/* Navigation menu items */}
      <div className="flex flex-col p-4 space-y-2">
        {routes.map((route) => {
          const isActive = location.pathname === route.path;
          return (
            <div key={route.path}>
              {/* Navigation link with conditional styling based on active state */}
              <Link
                to={route.path}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${isActive
                  ? 'bg-gray-400 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <span className="font-medium">{route.name}</span>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;