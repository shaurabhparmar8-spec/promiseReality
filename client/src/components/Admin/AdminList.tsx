import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { adminAPI_functions, formatDate } from '../../lib/api';
import { Admin, AdminPermissions } from '../../lib/validators';
import { SkeletonRows } from './SkeletonRow';
import EditPermissionsModal from './EditPermissionsModal';
import ResetPasswordModal from './ResetPasswordModal';

interface AdminListProps {
  refreshTrigger: number;
}

const AdminList: React.FC<AdminListProps> = ({ refreshTrigger }) => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [showEditPermissions, setShowEditPermissions] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAdminId, setDeletingAdminId] = useState<string | null>(null);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const adminsList = await adminAPI_functions.getAdmins();
      setAdmins(adminsList);
    } catch (error: any) {
      toast.error('Failed to fetch admins');
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [refreshTrigger]);

  const handleRefresh = () => {
    fetchAdmins();
  };

  const handleEditPermissions = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowEditPermissions(true);
  };

  const handleResetPassword = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowResetPassword(true);
  };

  const handleDeleteAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAdmin) return;
    
    try {
      setDeletingAdminId(selectedAdmin._id);
      await adminAPI_functions.deleteAdmin(selectedAdmin._id);
      
      // Remove admin from local state
      setAdmins(prev => prev.filter(admin => admin._id !== selectedAdmin._id));
      
      toast.success(`${selectedAdmin.name} has been deleted successfully`);
      setShowDeleteConfirm(false);
      setSelectedAdmin(null);
    } catch (error: any) {
      toast.error(`Failed to delete admin: ${error.message || 'Unknown error'}`);
      console.error('Error deleting admin:', error);
    } finally {
      setDeletingAdminId(null);
    }
  };

  const handlePermissionsUpdated = (updatedAdmin: Admin) => {
    setAdmins(prev => prev.map(admin => 
      admin._id === updatedAdmin._id ? updatedAdmin : admin
    ));
    setShowEditPermissions(false);
    setSelectedAdmin(null);
  };

  const handlePasswordReset = () => {
    setShowResetPassword(false);
    setSelectedAdmin(null);
  };

  const getPermissionBadges = (permissions: AdminPermissions) => {
    const enabledPermissions = Object.entries(permissions)
      .filter(([_, enabled]) => enabled)
      .map(([key, _]) => {
        const labels: Record<string, string> = {
          addProperty: 'Add Property',
          editProperty: 'Edit Property',
          deleteProperty: 'Delete Property',
          writeReview: 'Write Review',
          deleteReview: 'Delete Review',
          writeBlog: 'Write Blog',
          deleteBlog: 'Delete Blog',
          deleteUser: 'Delete User',
          viewInquiries: 'View Inquiries',
          viewMessages: 'View Messages',
          deleteMessages: 'Delete Messages',
        };
        return labels[key] || key;
      });

    return enabledPermissions;
  };

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.phoneNumber.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Manage Admins</h2>
          <div className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
        </div>
        <SkeletonRows count={3} />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Manage Admins</h2>
          
          {/* Search and Refresh */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
              <svg 
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <button
              onClick={handleRefresh}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Refresh list"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Admin List */}
        {filteredAdmins.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No admins found' : 'No admins yet'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Try adjusting your search terms.' 
                : 'Create your first admin using the form on the left.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAdmins.map((admin) => {
              const permissionBadges = getPermissionBadges(admin.permissions);
              
              return (
                <div 
                  key={admin._id} 
                  className="bg-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    {/* Admin Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-medium">
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        
                        {/* Name and Contact */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{admin.name}</h3>
                          <p className="text-gray-600">{admin.phoneNumber}</p>
                        </div>
                      </div>
                      
                      {/* Permissions */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions</h4>
                        {permissionBadges.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {permissionBadges.map((permission) => (
                              <span
                                key={permission}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {permission}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No permissions assigned</p>
                        )}
                      </div>
                      
                      {/* Created Date */}
                      <p className="text-xs text-gray-500">
                        Created on {formatDate(admin.createdAt)}
                      </p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col space-y-2 ml-6">
                      <button
                        onClick={() => handleEditPermissions(admin)}
                        className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Edit Permissions
                      </button>
                      
                      <button
                        onClick={() => handleResetPassword(admin)}
                        className="flex items-center px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 border border-orange-200 rounded-lg transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Reset Password
                      </button>
                      
                      <button
                        onClick={() => handleDeleteAdmin(admin)}
                        className="flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Admin
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showEditPermissions && selectedAdmin && (
        <EditPermissionsModal
          admin={selectedAdmin}
          onClose={() => {
            setShowEditPermissions(false);
            setSelectedAdmin(null);
          }}
          onUpdated={handlePermissionsUpdated}
        />
      )}

      {showResetPassword && selectedAdmin && (
        <ResetPasswordModal
          admin={selectedAdmin}
          onClose={() => {
            setShowResetPassword(false);
            setSelectedAdmin(null);
          }}
          onPasswordReset={handlePasswordReset}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete Admin Account
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to permanently delete <strong>{selectedAdmin.name}</strong>'s admin account?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-800">
                    <strong>Warning:</strong> This action cannot be undone. The admin will immediately lose access to the system.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedAdmin(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deletingAdminId === selectedAdmin._id}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {deletingAdminId === selectedAdmin._id ? 'Deleting...' : 'Delete Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminList;