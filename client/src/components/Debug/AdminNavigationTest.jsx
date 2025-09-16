import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, Home, User, LogOut } from 'lucide-react';

const AdminNavigationTest = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleBackToHome = () => {
    console.log('Navigating back to home...');
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Navigation Test</h2>
        <p className="text-gray-600">Test admin login behavior and navigation</p>
      </div>

      {/* Authentication Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Authentication Status</h3>
        {isAuthenticated() ? (
          <div className="space-y-2">
            <div className="text-green-600">
              ✅ Logged in as: <strong>{user.name}</strong> ({user.email})
            </div>
            <div className="text-blue-600">
              👤 Role: <strong>{user.role}</strong>
            </div>
            {isAdmin() && (
              <div className="text-purple-600">
                🔑 Admin privileges: <strong>Active</strong>
              </div>
            )}
          </div>
        ) : (
          <div className="text-red-600">
            ❌ Not logged in
          </div>
        )}
      </div>

      {/* Navigation Test Buttons */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Navigation Test</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Home Navigation */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Home Navigation</h4>
            <div className="space-y-2">
              <Link
                to="/"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Home size={18} />
                <span>Go to Home (Link)</span>
              </Link>
              <button
                onClick={handleBackToHome}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full"
              >
                <Home size={18} />
                <span>Go to Home (Navigate)</span>
              </button>
            </div>
          </div>

          {/* Admin Dashboard Navigation */}
          {isAdmin() && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Admin Dashboard</h4>
              <div className="space-y-2">
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Settings size={18} />
                  <span>Admin Dashboard</span>
                </Link>
                <Link
                  to="/admin/dashboard"
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Settings size={18} />
                  <span>Admin Overview</span>
                </Link>
              </div>
            </div>
          )}

          {/* User Dashboard Navigation */}
          {isAuthenticated() && !isAdmin() && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">User Dashboard</h4>
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <User size={18} />
                <span>My Dashboard</span>
              </Link>
            </div>
          )}

          {/* Logout */}
          {isAuthenticated() && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Logout</h4>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Login Behavior Information */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Fixed Login Behavior</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>✅ <strong>Before Fix:</strong> Admin login automatically redirected to /admin</li>
          <li>✅ <strong>After Fix:</strong> Admin login goes to home page, admin can choose to go to dashboard</li>
          <li>✅ <strong>Admin Dashboard Link:</strong> Available in navbar menu for admin users</li>
          <li>✅ <strong>Back Button:</strong> Uses React Router navigate() instead of window.location</li>
          <li>✅ <strong>Success Message:</strong> Admin login shows helpful message about dashboard access</li>
        </ul>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <h3 className="font-semibold text-green-900 mb-2">Test Instructions</h3>
        <ol className="text-green-800 text-sm space-y-1 list-decimal list-inside">
          <li>Login as admin user</li>
          <li>Verify you land on home page (not admin dashboard)</li>
          <li>Check navbar menu for "Admin Dashboard" link</li>
          <li>Click "Admin Dashboard" to access admin panel</li>
          <li>In admin dashboard, click "Back to Website" button</li>
          <li>Verify you return to home page successfully</li>
        </ol>
      </div>
    </div>
  );
};

export default AdminNavigationTest;