import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  CreditCard, 
  RefreshCw, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Shield
} from 'lucide-react';

const Navigation: React.FC = () => {
  const { currentUser, userData, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navigationLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Accounts', href: '/accounts', icon: CreditCard },
    { name: 'Transactions', href: '/transactions', icon: RefreshCw },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  if (userData?.role === 'admin') {
    navigationLinks.push({ name: 'Admin', href: '/admin', icon: Shield });
  }

  return (
    <>
      {/* Fixed top navigation bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/dashboard" className="flex items-center">
                  <CreditCard className="h-8 w-8 text-white" />
                  <span className="ml-2 text-xl font-bold text-white">BankSystem</span>
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-200 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Desktop navigation links */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {navigationLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(item.href)
                        ? 'bg-indigo-800 text-white'
                        : 'text-indigo-100 hover:bg-indigo-600'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
              <button
                onClick={handleSignOut}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-indigo-100 hover:bg-indigo-600"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-indigo-700 p-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <Link to="/dashboard" className="flex items-center">
                <CreditCard className="h-8 w-8 text-white" />
                <span className="ml-2 text-xl font-bold text-white">BankSystem</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-1">
              {navigationLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(item.href)
                        ? 'bg-indigo-800 text-white'
                        : 'text-indigo-100 hover:bg-indigo-600'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-indigo-100 hover:bg-indigo-600"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;