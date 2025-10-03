import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Users, BarChart3, Palette } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../utils/cn';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { userProfile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Debug: log userProfile to see what we're getting
  console.log('UserProfile in Layout:', userProfile);

  const navigationItems = [
    { name: 'Jobs Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Candidates', path: '/candidates', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center space-x-3">
                <img
                  src={theme === 'yellow'
                    ? "https://storage.googleapis.com/msgsndr/lGsIinSfGWCV7pg4A0Wx/media/68dfc8ca0ee850516ff681a5.png"
                    : "https://storage.googleapis.com/msgsndr/lGsIinSfGWCV7pg4A0Wx/media/68dfcb7f3474f7389671fef5.png"
                  }
                  alt="Logo"
                  className="h-8 w-auto"
                />
                <h1 className="text-xl font-bold text-primary-600">HR Resume Ranker</h1>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path ||
                    (item.name === 'Jobs Dashboard' && location.pathname.startsWith('/jobs')) ||
                    (item.name === 'Candidates' && location.pathname === '/candidates');

                  return (
                    <button
                      key={item.name}
                      onClick={() => navigate(item.path)}
                      className={cn(
                        'inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors',
                        isActive
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      )}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Welcome, {userProfile?.name?.split(' ')[0] || 'User'}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleTheme}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title={`Switch to ${theme === 'blue' ? 'Yellow' : 'Blue'} theme`}
                >
                  <Palette className="w-4 h-4" />
                </button>
                <User className="w-4 h-4 text-gray-400" />
                <button
                  onClick={signOut}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;