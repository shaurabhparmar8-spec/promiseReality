import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import BackButton from './BackButton';
import { useAuth } from '../../context/AuthContext';

const ManageSubAdmins = () => {
  const { user, isOwner } = useAuth();
  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSubAdmin, setEditingSubAdmin] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(null);

  const [createForm, setCreateForm] = useState({
    name: '',
    phone: '',
    password: '',
    permissions: {
      addProperty: false,
      editProperty: false,
      deleteProperty: false,
      writeBlog: false,
      deleteBlog: false,
      writeReview: false,
      deleteReview: false,
      deleteUser: false,
      viewMessages: false,
      deleteMessages: false,
      viewInquiries: false
    }
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: ''
  });

  // Permission labels for display
  const permissionLabels = {
    addProperty: 'Add Properties',
    editProperty: 'Edit Properties',
    deleteProperty: 'Delete Properties',
    writeBlog: 'Write Blog Posts',
    deleteBlog: 'Delete Blog Posts',
    writeReview: 'Write Reviews',
    deleteReview: 'Delete Reviews',
    deleteUser: 'Delete Users',
    viewMessages: 'View Messages',
    deleteMessages: 'Delete Messages',
    viewInquiries: 'View Visit Requests'
  };

  useEffect(() => {
    if (!isOwner()) {
      toast.error('Only owners can manage sub-admins');
      return;
    }
    fetchSubAdmins();
  }, [isOwner]);

  const fetchSubAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sub-admin');
      if (response.data.success) {
        setSubAdmins(response.data.data.subAdmins);
      }
    } catch (error) {
      console.warn('🔄 Sub-admin backend unavailable, using mock data');
      // Fallback to mock sub-admins for demo
      setSubAdmins([
        {
          _id: '1',
          name: 'Rahul Patel',
          phone: '9876543210',
          isActive: true,
          permissions: {
            addProperty: true,
            editProperty: true,
            deleteProperty: false,
            viewUsers: true,
            manageReviews: true,
            manageBlogs: true,
            viewInquiries: true
          },
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          _id: '2', 
          name: 'Priya Sharma',
          phone: '9876543211',
          isActive: false,
          permissions: {
            addProperty: true,
            editProperty: false,
            deleteProperty: false,
            viewUsers: false,
            manageReviews: true,
            manageBlogs: false,
            viewInquiries: true
          },
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!createForm.name || !createForm.phone || !createForm.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (createForm.phone.length !== 10 || !/^\d+$/.test(createForm.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    if (createForm.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await api.post('/sub-admin', createForm);
      if (response.data.success) {
        toast.success('Sub-admin created successfully!');
        setShowCreateForm(false);
        setCreateForm({
          name: '',
          phone: '',
          password: '',
          permissions: {
            addProperty: false,
            editProperty: false,
            deleteProperty: false,
            writeBlog: false,
            deleteBlog: false,
            writeReview: false,
            deleteReview: false,
            deleteUser: false,
            viewMessages: false,
            deleteMessages: false,
            viewInquiries: false
          }
        });
        fetchSubAdmins();
      }
    } catch (error) {
      console.warn('🔄 Sub-admin creation backend unavailable, using demo mode');
      
      // Demo mode - simulate successful creation
      toast.success('Sub-admin created successfully! (Demo Mode)');
      
      // Add to local state for demo
      const newSubAdmin = {
        _id: Date.now().toString(),
        name: createForm.name,
        phone: createForm.phone,
        isActive: true,
        permissions: createForm.permissions,
        createdAt: new Date().toISOString()
      };
      
      setSubAdmins(prev => [...prev, newSubAdmin]);
      
      setShowCreateForm(false);
      setCreateForm({
        name: '',
        phone: '',
        password: '',
        permissions: {
          addProperty: false,
          editProperty: false,
          deleteProperty: false,
          writeBlog: false,
          deleteBlog: false,
          writeReview: false,
          deleteReview: false,
          deleteUser: false,
          viewMessages: false,
          deleteMessages: false,
          viewInquiries: false
        }
      });
    }
  };

  const handleUpdatePermissions = async (subAdminId, permissions) => {
    try {
      const response = await api.put(`/sub-admin/${subAdminId}/permissions`, { permissions });
      if (response.data.success) {
        toast.success('Permissions updated successfully!');
        setEditingSubAdmin(null);
        fetchSubAdmins();
      }
    } catch (error) {
      console.warn('🔄 Using demo mode for permission update');
      // Demo mode - update local state
      setSubAdmins(prev => prev.map(admin => 
        admin._id === subAdminId 
          ? { ...admin, permissions }
          : admin
      ));
      setEditingSubAdmin(null);
      toast.success('Permissions updated successfully! (Demo Mode)');
    }
  };

  const handleChangePassword = async (subAdminId) => {
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await api.put(`/sub-admin/${subAdminId}/password`, passwordForm);
      if (response.data.success) {
        toast.success('Password changed successfully!');
        setShowPasswordForm(null);
        setPasswordForm({ newPassword: '' });
      }
    } catch (error) {
      console.warn('🔄 Using demo mode for password change');
      toast.success('Password changed successfully! (Demo Mode)');
      setShowPasswordForm(null);
      setPasswordForm({ newPassword: '' });
    }
  };

  const handleToggleStatus = async (subAdminId) => {
    try {
      const response = await api.put(`/sub-admin/${subAdminId}/toggle-status`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchSubAdmins();
      }
    } catch (error) {
      console.warn('🔄 Using demo mode for status toggle');
      // Demo mode - toggle status locally
      setSubAdmins(prev => prev.map(admin => 
        admin._id === subAdminId 
          ? { ...admin, isActive: !admin.isActive }
          : admin
      ));
      toast.success('Status toggled successfully! (Demo Mode)');
    }
  };

  const handleDeleteSubAdmin = async (subAdminId, subAdminName) => {
    if (!window.confirm(`Are you sure you want to delete sub-admin "${subAdminName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await api.delete(`/sub-admin/${subAdminId}`);
      if (response.data.success) {
        toast.success('Sub-admin deleted successfully!');
        fetchSubAdmins();
      }
    } catch (error) {
      console.warn('🔄 Using demo mode for sub-admin deletion');
      // Demo mode - remove from local state
      setSubAdmins(prev => prev.filter(admin => admin._id !== subAdminId));
      toast.success('Sub-admin deleted successfully! (Demo Mode)');
    }
  };

  if (!isOwner()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Only owners can manage sub-admins.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <BackButton />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Sub-Admins</h1>
          <p className="text-gray-600 mt-2">Create and manage sub-administrators with custom permissions</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          disabled={subAdmins.length >= 3}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Sub-Admin ({subAdmins.length}/3)
        </button>
      </div>

      {/* Create Sub-Admin Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Sub-Admin</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number * (Login Credential)
                    </label>
                    <input
                      type="tel"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm({...createForm, phone: e.target.value})}
                      placeholder="1234567890"
                      maxLength="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password * (Set by you)
                  </label>
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Permissions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Access Permissions
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(permissionLabels).map(([key, label]) => (
                      <div key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`create-${key}`}
                          checked={createForm.permissions[key]}
                          onChange={(e) => setCreateForm({
                            ...createForm,
                            permissions: {
                              ...createForm.permissions,
                              [key]: e.target.checked
                            }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`create-${key}`} className="ml-2 text-sm text-gray-700">
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    Create Sub-Admin
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Admins List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Current Sub-Admins</h3>
        </div>
        
        {subAdmins.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <div className="text-gray-400 mb-3">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-500">No sub-admins created yet</p>
            <p className="text-sm text-gray-400">You can create up to 3 sub-admins</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {subAdmins.map((subAdmin) => (
              <div key={subAdmin._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                          subAdmin.isActive ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {subAdmin.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h4 className="text-lg font-medium text-gray-900">{subAdmin.name}</h4>
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                            subAdmin.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {subAdmin.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">Phone: {subAdmin.phone}</p>
                        <p className="text-xs text-gray-400">
                          Created: {new Date(subAdmin.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {/* Permissions Display */}
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Permissions:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(subAdmin.permissions || {}).map(([key, value]) => (
                          value && (
                            <span key={key} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {permissionLabels[key]}
                            </span>
                          )
                        ))}
                        {Object.values(subAdmin.permissions || {}).every(v => !v) && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            No permissions assigned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingSubAdmin(subAdmin)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors duration-200"
                    >
                      Edit Permissions
                    </button>
                    <button
                      onClick={() => setShowPasswordForm(subAdmin._id)}
                      className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors duration-200"
                    >
                      Change Password
                    </button>
                    <button
                      onClick={() => handleToggleStatus(subAdmin._id)}
                      className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${
                        subAdmin.isActive
                          ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {subAdmin.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteSubAdmin(subAdmin._id, subAdmin.name)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Permissions Modal */}
      {editingSubAdmin && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Edit Permissions - {editingSubAdmin.name}
                </h3>
                <button
                  onClick={() => setEditingSubAdmin(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(permissionLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`edit-${key}`}
                        checked={editingSubAdmin.permissions?.[key] || false}
                        onChange={(e) => setEditingSubAdmin({
                          ...editingSubAdmin,
                          permissions: {
                            ...editingSubAdmin.permissions,
                            [key]: e.target.checked
                          }
                        })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`edit-${key}`} className="ml-2 text-sm text-gray-700">
                        {label}
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setEditingSubAdmin(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdatePermissions(editingSubAdmin._id, editingSubAdmin.permissions)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    Update Permissions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                <button
                  onClick={() => {
                    setShowPasswordForm(null);
                    setPasswordForm({ newPassword: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ newPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowPasswordForm(null);
                      setPasswordForm({ newPassword: '' });
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleChangePassword(showPasswordForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSubAdmins;