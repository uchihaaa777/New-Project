import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Heart, Search, Info } from 'lucide-react';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide mobile menu in group chat
  const isGroupChat = /^\/groups\/.+\/chat$/.test(location.pathname);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled 
          ? theme === 'dark' 
            ? 'bg-dark-200 shadow-lg' 
            : 'bg-white shadow-md'
          : theme === 'dark'
            ? 'bg-transparent'
            : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-1 hover:bg-gray-200 dark:hover:bg-dark-100 rounded-full transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <img 
              src="/logo.png" 
              alt="Anonymess Logo" 
              className={`w-8 h-8 transition-all duration-300 ${theme === 'dark' ? 'brightness-0 invert' : ''}`}
            />
          </button>
          <Link to="/" className="h-8">
            <img 
              src="/logotext.png" 
              alt="Anonymess" 
              className={`h-full transition-all duration-300 ${theme === 'dark' ? 'brightness-0 invert' : ''}`}
            />
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-1">
          <NavLink to="/" current={location.pathname === '/'}>
            Home
          </NavLink>
          <NavLink to="/trending" current={location.pathname === '/trending'}>
            Trending
          </NavLink>
          <NavLink to="/groups" current={location.pathname === '/groups'}>
            Groups
          </NavLink>
          <NavLink to="/live" current={location.pathname === '/live'}>
            <span className="relative mr-1">
              <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </span>
          </NavLink>
        </nav>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/search')}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-100 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => navigate('/privacy-policy')}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-100 transition-colors"
            aria-label="Privacy Policy"
          >
            <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {!isGroupChat && (
        <div className="md:hidden flex justify-around border-t border-gray-200 dark:border-dark-100 bg-white dark:bg-dark-200 fixed bottom-0 left-0 right-0 py-4">
          <MobileNavLink to="/" current={location.pathname === '/'}>
            Home
          </MobileNavLink>
          <MobileNavLink to="/trending" current={location.pathname === '/trending'}>
            Trending
          </MobileNavLink>
          <MobileNavLink to="/groups" current={location.pathname === '/groups'}>
            Groups
          </MobileNavLink>
          <MobileNavLink to="/live" current={location.pathname === '/live'}>
            Live
          </MobileNavLink>
        </div>
      )}
    </header>
  );
};

interface NavLinkProps {
  to: string;
  current: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, current, children }) => (
  <Link
    to={to}
    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
      current
        ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-100'
    }`}
  >
    {children}
  </Link>
);

const MobileNavLink: React.FC<NavLinkProps> = ({ to, current, children }) => (
  <Link
    to={to}
    className={`px-3 py-1 text-xs font-medium text-center rounded-md ${
      current
        ? 'text-primary-600 dark:text-primary-400'
        : 'text-gray-500 dark:text-gray-400'
    }`}
  >
    {children}
  </Link>
);

export default Header;