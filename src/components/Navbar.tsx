import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useAdminAuth } from '../hooks/useAdminAuth';
import LoginModal from './LoginModal';
import { 
  HomeIcon, 
  SearchIcon, 
  ChartIcon, 
  UserIcon, 
  SunIcon, 
  MoonIcon,
  FoodIcon 
} from './icons';

export default function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, userProfile, logout } = useAuth();
  const { isAdmin } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Listen for custom event to open login modal
  useEffect(() => {
    const handleOpenLoginModal = () => {
      setIsLoginModalOpen(true);
    };

    window.addEventListener('openLoginModal', handleOpenLoginModal);
    return () => {
      window.removeEventListener('openLoginModal', handleOpenLoginModal);
    };
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <FoodIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            <span className="text-xl font-bold text-gray-800 dark:text-white">SWU EatRank</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <HomeIcon className="w-4 h-4" />
              <span>Homepage</span>
            </Link>
            
            <Link
              to="/search"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/search')
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <SearchIcon className="w-4 h-4" />
              <span>Find Menu</span>
            </Link>
            
            <Link
              to="/board"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/board')
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <ChartIcon className="w-4 h-4" />
              <span>Popular</span>
            </Link>
            
            <Link
              to="/admin"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/admin')
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span>🔧</span>
              <span>Admin</span>
            </Link>
            
            {user && userProfile?.email ? (
              <>
                <Link
                  to="/me"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/me')
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>{userProfile.displayName || 'ฉัน'}</span>
                </Link>

                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-3 py-2 rounded-md text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition-colors"
              >
                เข้าสู่ระบบ
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'light' ? (
                <MoonIcon className="w-5 h-5" />
              ) : (
                <SunIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'light' ? (
                <MoonIcon className="w-5 h-5" />
              ) : (
                <SunIcon className="w-5 h-5" />
              )}
            </button>
            
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
              aria-label="เปิดเมนูมือถือ"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 dark:border-gray-700">
              <Link
                to="/"
                className={`flex items-center space-x-2 block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/')
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <HomeIcon className="w-4 h-4" />
                <span>หน้าแรก</span>
              </Link>
              
              <Link
                to="/search"
                className={`flex items-center space-x-2 block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/search')
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <SearchIcon className="w-4 h-4" />
                <span>ค้นหาเมนู</span>
              </Link>
              
              <Link
                to="/board"
                className={`flex items-center space-x-2 block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/board')
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <ChartIcon className="w-4 h-4" />
                <span>กระดานรวม</span>
              </Link>
              
              <Link
                to="/admin"
                className={`flex items-center space-x-2 block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/admin')
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span>🔧</span>
                <span>Admin</span>
              </Link>
              
              <Link
                to="/me"
                className={`flex items-center space-x-2 block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/me')
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>ฉัน</span>
              </Link>
            </div>
          </div>
        )}

        {/* Login Modal */}
        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
        />
      </div>
    </nav>
  );
}
