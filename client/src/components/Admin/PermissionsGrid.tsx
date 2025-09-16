import React from 'react';
import { AdminPermissions } from '../../lib/validators';

interface PermissionsGridProps {
  permissions: AdminPermissions;
  onChange: (permissions: AdminPermissions) => void;
  errors?: Record<string, any>;
  disabled?: boolean;
}

interface PermissionGroup {
  title: string;
  description: string;
  permissions: {
    key: keyof AdminPermissions;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[];
}

const PermissionsGrid: React.FC<PermissionsGridProps> = ({
  permissions,
  onChange,
  errors,
  disabled = false,
}) => {
  const handlePermissionChange = (key: keyof AdminPermissions, value: boolean) => {
    if (disabled) return;
    
    onChange({
      ...permissions,
      [key]: value,
    });
  };

  const permissionGroups: PermissionGroup[] = [
    {
      title: 'Properties',
      description: 'Manage property listings and data',
      permissions: [
        {
          key: 'addProperty',
          label: 'Add Property',
          description: 'Create new property listings',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          ),
        },
        {
          key: 'editProperty',
          label: 'Edit Property',
          description: 'Modify existing property details',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          ),
        },
        {
          key: 'deleteProperty',
          label: 'Delete Property',
          description: 'Remove property listings',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          ),
        },
      ],
    },
    {
      title: 'Content',
      description: 'Manage reviews and blog content',
      permissions: [
        {
          key: 'writeReview',
          label: 'Write Review',
          description: 'Create customer reviews',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          ),
        },
        {
          key: 'deleteReview',
          label: 'Delete Review',
          description: 'Remove customer reviews',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          ),
        },
        {
          key: 'writeBlog',
          label: 'Write Blog',
          description: 'Create blog posts',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        },
        {
          key: 'deleteBlog',
          label: 'Delete Blog',
          description: 'Remove blog posts',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          ),
        },
      ],
    },
    {
      title: 'Users & Messages',
      description: 'Manage users and communications',
      permissions: [
        {
          key: 'deleteUser',
          label: 'Delete User',
          description: 'Remove user accounts',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6z" />
            </svg>
          ),
        },
        {
          key: 'viewInquiries',
          label: 'View Inquiries',
          description: 'Access visit requests and inquiries',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          ),
        },
        {
          key: 'viewMessages',
          label: 'View Messages',
          description: 'Access contact messages',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
        },
        {
          key: 'deleteMessages',
          label: 'Delete Messages',
          description: 'Remove contact messages',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          ),
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {permissionGroups.map((group) => (
        <div key={group.title} className="rounded-xl border border-gray-200 p-6 bg-white">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-900">{group.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{group.description}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.permissions.map((permission) => (
              <label
                key={permission.key}
                className={`relative flex items-start p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                  permissions[permission.key]
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={permissions[permission.key]}
                    onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                    disabled={disabled}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="ml-3 flex-1">
                  <div className="flex items-center space-x-2">
                    <div className={`${
                      permissions[permission.key] ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {permission.icon}
                    </div>
                    <div className="font-medium text-sm text-gray-900">
                      {permission.label}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {permission.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}
      
      {/* Permission Summary */}
      <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-900">Permission Summary</h4>
            <p className="text-sm text-blue-800 mt-1">
              {Object.values(permissions).filter(Boolean).length} of {Object.keys(permissions).length} permissions selected.
              Admin will have access to the selected features only.
            </p>
          </div>
        </div>
      </div>

      {errors && Object.keys(errors).length > 0 && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-200">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-red-900">Permission Errors</h4>
              <ul className="text-sm text-red-800 mt-1 space-y-1">
                {Object.entries(errors).map(([key, error]) => (
                  <li key={key}>• {error.message || 'Invalid permission setting'}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionsGrid;