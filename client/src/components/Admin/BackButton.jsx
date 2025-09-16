import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

const BackButton = ({ 
  label = 'Back', 
  showHomeButton = true, 
  customBackAction = null, 
  className = '' 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (customBackAction) {
      customBackAction();
      return;
    }

    // Custom back logic for different admin pages
    const path = location.pathname;
    
    if (path.includes('/admin/create-admin')) {
      navigate('/admin/sub-admins');
    } else if (path.includes('/admin/properties/') && path.includes('/edit')) {
      navigate('/admin/properties');
    } else if (path.includes('/admin/blogs/') && path.includes('/edit')) {
      navigate('/admin/blogs');
    } else {
      // Default behavior - go to dashboard
      navigate('/admin/dashboard');
    }
  };

  const handleHome = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div className={`flex items-center space-x-3 mb-6 ${className}`}>
      <button
        onClick={handleBack}
        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {label}
      </button>

      {showHomeButton && (
        <button
          onClick={handleHome}
          className="flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:text-blue-800 transition-colors duration-200 shadow-sm"
        >
          <Home className="w-4 h-4 mr-2" />
          Dashboard
        </button>
      )}
    </div>
  );
};

export default BackButton;