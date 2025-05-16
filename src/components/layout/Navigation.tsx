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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Sidebar links based on user role
  const navigationLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Accounts', href: '/accounts', icon: CreditCard },
    { name: 'Transactions', href: '/transactions', icon: RefreshCw },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  // Only show admin link if user has admin role
  if (userData?.role === 'admin') {
    navigationLinks.push({ name: 'Admin', href: '/admin', icon: Shield });
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 z-40 w-full bg-white shadow-md md:hidden">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center">
            <CreditCard className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">BankSystem</span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          >
            <span className="sr-only">Open sidebar</span>
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-indigo-700">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-shrink-0 flex items-center px-4">
            <CreditCard className="h-8 w-8 text-white" />
            <span className="ml-2 text-xl font-bold text-white">BankSystem</span>
          </div>
          
          <div className="mt-5 flex-1 h-0 overflow-y-auto">
            <nav className="px-2 space-y-1">
              {navigationLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActive(item.href)
                        ? 'bg-indigo-800 text-white'
                        : 'text-indigo-100 hover:bg-indigo-600'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon
                      className={`mr-4 h-6 w-6 ${
                        isActive(item.href) ? 'text-indigo-300' : 'text-indigo-300'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
              
              <button
                onClick={handleSignOut}
                className="w-full group flex items-center px-2 py-2 text-base font-medium rounded-md text-indigo-100 hover:bg-indigo-600"
              >
                <LogOut className="mr-4 h-6 w-6 text-indigo-300" />
                Sign Out
              </button>
            </nav>
          </div>
        </div>
        
        <div className="flex-shrink-0 w-14" aria-hidden="true">
          {/* Dummy element to force sidebar to shrink to fit close icon */}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-indigo-700">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-indigo-800">
              <CreditCard className="h-8 w-8 text-white" />
              <span className="ml-2 text-xl font-bold text-white">BankSystem</span>
            </div>
            
            <div className="flex-1 flex flex-col overflow-y-auto">
              {currentUser && userData && (
                <div className="px-4 py-4 border-b border-indigo-800">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                        {userData.fullName?.charAt(0) || userData.email?.charAt(0) || 'U'}
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">
                        {userData.fullName || 'User'}
                      </p>
                      <p className="text-xs text-indigo-200 truncate">
                        {userData.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigationLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive(item.href)
                          ? 'bg-indigo-800 text-white'
                          : 'text-indigo-100 hover:bg-indigo-600'
                      }`}
                    >
                      <Icon
                        className={`mr-3 h-5 w-5 ${
                          isActive(item.href) ? 'text-indigo-300' : 'text-indigo-300'
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
                
                <button
                  onClick={handleSignOut}
                  className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-indigo-100 hover:bg-indigo-600"
                >
                  <LogOut className="mr-3 h-5 w-5 text-indigo-300" />
                  Sign Out
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Top navigation bar for desktop */}
      <div className="hidden md:flex md:flex-col md:w-0 md:flex-1">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                {location.pathname === '/dashboard' && 'Dashboard'}
                {location.pathname === '/accounts' && 'Accounts'}
                {location.pathname === '/transactions' && 'Transactions'}
                {location.pathname === '/profile' && 'Profile'}
                {location.pathname === '/admin' && 'Admin Panel'}
              </h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" />
              </button>

              <div className="ml-3 relative">
                <div>
                  <button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <span className="sr-only">Open user menu</span>
                    <Settings className="h-6 w-6 text-gray-400 hover:text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;