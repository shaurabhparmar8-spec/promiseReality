import React, { useState } from 'react';
import { Toaster } from 'sonner';
import CreateAdminForm from '../../components/Admin/CreateAdminForm';
import AdminList from '../../components/Admin/AdminList';
import BackButton from '../../components/Admin/BackButton';
import { adminAPI_functions } from '../../lib/api';

const CreateAdminPage: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAdminCreated = () => {
    // Trigger refresh of admin list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6 animate-in fade-in duration-700">
        {/* Back Button */}
        <BackButton />
        
        {/* Page Header */}
        <div className="mb-8 animate-in slide-in-from-top duration-500">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Management
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Create and manage sub-admin accounts with granular permissions. 
              Only main admins can create and modify sub-admin accounts.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          {/* Desktop Layout - Side by Side */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8">
            {/* Left Card - Create Admin */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in slide-in-from-left duration-600">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Create New Admin
                </h2>
                <p className="text-gray-600">
                  Add a new sub-admin with customized permissions
                </p>
              </div>
              
              <CreateAdminForm onAdminCreated={handleAdminCreated} />
            </div>

            {/* Right Card - Manage Admins */}
            <div className="animate-in slide-in-from-right duration-600 delay-100">
              <AdminList refreshTrigger={refreshTrigger} />
            </div>
          </div>

          {/* Mobile/Tablet Layout - Stacked */}
          <div className="lg:hidden space-y-8">
            {/* Create Admin Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in slide-in-from-bottom duration-600">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Create New Admin
                </h2>
                <p className="text-gray-600 text-sm">
                  Add a new sub-admin with customized permissions
                </p>
              </div>
              
              <CreateAdminForm onAdminCreated={handleAdminCreated} />
            </div>

            {/* Manage Admins Card */}
            <div className="animate-in slide-in-from-bottom duration-600 delay-200">
              <AdminList refreshTrigger={refreshTrigger} />
            </div>
          </div>
        </div>


      </div>

      {/* Toast Container */}
      <Toaster 
        position="top-right"
        richColors
        expand={true}
        closeButton
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
          },
        }}
      />
    </>
  );
};

export default CreateAdminPage;