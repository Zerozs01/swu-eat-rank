import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
              <span>หน้าแรก</span>
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
              <span>ค้นหาเมนู</span>
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
              <span>กระดานรวม</span>
            </Link>
            
            <Link
              to="/me"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/me')
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>ฉัน</span>
            </Link>

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
      </div>
    </nav>
  );
}
