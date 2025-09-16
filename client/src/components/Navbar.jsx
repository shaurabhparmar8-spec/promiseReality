import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, Settings, Home, Building, Info, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 30;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once to set initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);
  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Properties', path: '/properties', icon: Building },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: Phone },
  ];

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Determine if current route is admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Animation variants for mobile menu
  const menuVariants = {
    open: {
      opacity: 1,
      height: 'auto',
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    closed: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  };

  return (
    <nav className={`navbar fixed top-0 z-50 transition-all duration-300 w-full ${
      isScrolled
        ? 'bg-white shadow-lg border-b border-gray-200'
        : 'bg-white/95 backdrop-blur-sm'
    } ${isAdminRoute ? 'left-64' : 'left-0'}`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Logo */}
          <Link 
            to="/" 
            className="navbar-logo flex items-center space-x-3 text-3xl font-extrabold font-heading transition-all duration-300 text-gray-900 hover:text-primary-600"
            onClick={() => setIsOpen(false)}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-3">
              <Building className="w-7 h-7 text-white" />
            </div>
            <span className="transition-all duration-300">
              Promise Realty
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  aria-label={link.name}
                  className={`nav-item flex items-center space-x-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg relative overflow-hidden group ${
                    isActivePath(link.path)
                      ? 'text-primary-700 bg-primary-100 shadow-md'
                      : 'text-gray-800 hover:text-primary-700 hover:bg-primary-50'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl"></div>
                  <Icon className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:scale-110" />
                  <span className="relative z-10">{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="user-menu hidden lg:flex items-center space-x-4 xl:space-x-6">
            {isAuthenticated() ? (
              <div className="relative group">
                <button className="flex items-center space-x-3 px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg text-gray-900 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50">
                  <User className="w-5 h-5" />
                  <span className="text-lg">{user?.name}</span>
                </button>
                
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-3">
                    <div className="px-5 py-3 border-b">
                      <p className="text-base font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-600">{user?.phone}</p>
                      {isAdmin() && (
                        <span className="inline-block mt-2 px-3 py-1 text-xs bg-primary-200 text-primary-900 rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                    
                    {!isAdmin() && (
                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-3 px-5 py-3 text-base text-gray-700 hover:bg-gray-100"
                      >
                        <User className="w-5 h-5" />
                        <span>My Dashboard</span>
                      </Link>
                    )}
                    
                    {isAdmin() && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-3 px-5 py-3 text-base text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="w-5 h-5" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-5 py-3 text-base text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-5">
                <Link
                  to="/register"
                  className="px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg text-primary-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50"
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-3 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl transform shadow-lg bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700"
                >
                  Login
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-3 rounded-xl transition-all duration-300 hover:scale-105 text-gray-800 hover:bg-gray-100 shadow-sm"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="lg:hidden absolute top-full left-0 right-0 overflow-hidden z-40"
            >
              <div className="px-6 py-6 bg-white/95 backdrop-blur-sm border-t shadow-lg">
                {/* Navigation Links */}
                <div className="space-y-4 mb-6">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.name}
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-4 px-5 py-4 rounded-lg font-semibold transition-colors duration-200 ${
                          isActivePath(link.path)
                            ? 'text-primary-700 bg-primary-100'
                            : 'text-gray-700 hover:text-primary-700 hover:bg-primary-100'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-lg">{link.name}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* User Section */}
                {isAuthenticated() ? (
                  <div className="border-t pt-6">
                    <div className="flex items-center space-x-4 px-6 py-4 mb-4">
                      <User className="w-6 h-6 text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-sm text-gray-600">{user?.phone}</p>
                      </div>
                    </div>
                    
                    {!isAdmin() && (
                      <Link
                        to="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-4 px-6 py-4 text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        <User className="w-6 h-6" />
                        <span>My Dashboard</span>
                      </Link>
                    )}
                    
                    {isAdmin() && (
                      <Link
                        to="/admin"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-4 px-6 py-4 text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        <Settings className="w-6 h-6" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-4 w-full px-6 py-4 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <LogOut className="w-6 h-6" />
                      <span className="text-lg">Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="border-t pt-6 space-y-4">
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="block w-full px-6 py-4 text-center text-primary-700 font-semibold rounded-lg hover:bg-primary-100"
                    >
                      Sign Up
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block w-full btn-primary text-center text-lg font-semibold"
                    >
                      Login
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
  }

export default Navbar;
