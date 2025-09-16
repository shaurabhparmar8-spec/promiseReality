import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { fadeIn, staggerAnimation } from '../../styles/animations';
import { useAuth } from '../../context/AuthContext';

// Import admin components
import DashboardOverview from './DashboardOverview';
import ManageProperties from './ManageProperties';
import ManageReviews from './ManageReviews';
import ManageBlogs from './ManageBlogs';
import ManageContacts from './ManageContacts';
import ManageUsers from './ManageUsers';
import ManageVisits from './ManageVisits';
import ManageSubAdmins from './ManageSubAdmins';
import CreateAdminPage from '../../pages/Admin/CreateAdminPage';
import Breadcrumb from './Breadcrumb';

const AdminDashboard = () => {
  const { user, isAdmin, isOwner, isSubAdmin, hasPermission, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin())) {
      // Redirect to login if not authenticated or not admin
      window.location.href = '/login';
      return;
    }

    if (!loading) {
      // Initialize animations
      setTimeout(() => {
        fadeIn('.admin-header');
        staggerAnimation(document.querySelectorAll('.sidebar-item'));
      }, 100);
    }
  }, [loading, user, isAdmin]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !isAdmin()) {
    return <Navigate to="/login" replace />;
  }

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/admin':
      case '/admin/dashboard':
        return 'Dashboard Overview';
      case '/admin/properties':
        return 'Manage Properties';
      case '/admin/reviews':
        return 'Manage Reviews';
      case '/admin/blogs':
        return 'Manage Blogs';
      case '/admin/contacts':
        return 'Manage Contacts';
      case '/admin/users':
        return 'Manage Users';
      case '/admin/visits':
        return 'Schedule Visits';
      case '/admin/sub-admins':
        return 'Manage Sub Admins';
      case '/admin/create-admin':
        return 'Create Admin';
      default:
        return 'Admin Panel';
    }
  };

  const navigationItems = [
    {
      path: '/admin/dashboard',
      name: 'Dashboard',
      icon: '📊',
      show: true
    },
    {
      path: '/admin/properties',
      name: 'Properties',
      icon: '🏠',
      show: hasPermission('addProperty') || hasPermission('editProperty') || hasPermission('deleteProperty') || isOwner()
    },
    {
      path: '/admin/reviews',
      name: 'Reviews',
      icon: '⭐',
      show: hasPermission('writeReview') || hasPermission('deleteReview') || isOwner()
    },
    {
      path: '/admin/blogs',
      name: 'Blogs',
      icon: '📝',
      show: hasPermission('writeBlog') || hasPermission('deleteBlog') || isOwner()
    },
    {
      path: '/admin/contacts',
      name: 'Contacts',
      icon: '📧',
      show: hasPermission('viewMessages') || hasPermission('deleteMessages') || isOwner()
    },
    {
      path: '/admin/users',
      name: 'Users',
      icon: '👥',
      show: hasPermission('deleteUser') || isOwner()
    },
    {
      path: '/admin/visits',
      name: 'Visits',
      icon: '📅',
      show: hasPermission('viewInquiries') || isOwner()
    },
    {
      path: '/admin/sub-admins',
      name: 'Sub Admins',
      icon: '👤',
      show: isOwner()
    },
    {
      path: '/admin/create-admin',
      name: 'Create Admin',
      icon: '➕',
      show: isOwner()
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-20'
      } flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-blue-600">
              {sidebarOpen ? 'Promise Reality' : 'PR'}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {navigationItems.filter(item => item.show).map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 ${
                location.pathname === item.path ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : ''
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && (
                <span className="ml-3 font-medium">{item.name}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Back to Site and User info */}
        <div className="border-t border-gray-200 p-4 space-y-3">
          {/* Back to Site Button */}
          <Link
            to="/"
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {sidebarOpen && 'Back to Site'}
          </Link>
          
          {/* User Info */}
          <div className="flex items-center">
            <div className="text-2xl">👤</div>
            {sidebarOpen && (
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            )}
          </div>
          
          {/* Logout Button */}
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="w-full text-left text-sm text-red-600 hover:text-red-800 transition-colors duration-200 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="admin-header bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="ml-4 text-2xl font-bold text-gray-900">
                {getPageTitle()}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Back to Site Button */}
              <Link
                to="/"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Site
              </Link>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Welcome back, <span className="font-medium">{user?.name}</span>
                </span>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Breadcrumb navigation */}
          {location.pathname !== '/admin' && location.pathname !== '/admin/dashboard' && (
            <Breadcrumb />
          )}
          
          <Routes>
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardOverview />} />
            <Route path="/properties" element={<ManageProperties />} />
            <Route path="/reviews" element={<ManageReviews />} />
            <Route path="/blogs" element={<ManageBlogs />} />
            <Route path="/contacts" element={<ManageContacts />} />
            <Route path="/users" element={<ManageUsers />} />
            <Route path="/visits" element={<ManageVisits />} />
            <Route path="/sub-admins" element={<ManageSubAdmins />} />
            <Route path="/create-admin" element={<CreateAdminPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;