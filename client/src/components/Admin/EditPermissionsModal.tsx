import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { permissionsSchema, AdminPermissions, Admin } from '../../lib/validators';
import { adminAPI_functions } from '../../lib/api';
import PermissionsGrid from './PermissionsGrid';

interface EditPermissionsModalProps {
  admin: Admin;
  onClose: () => void;
  onUpdated: (updatedAdmin: Admin) => void;
}

const EditPermissionsModal: React.FC<EditPermissionsModalProps> = ({
  admin,
  onClose,
  onUpdated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingPermissions, setPendingPermissions] = useState<AdminPermissions | null>(null);

  const {
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<{ permissions: AdminPermissions }>({
    resolver: zodResolver(z.object({ permissions: permissionsSchema })),
    defaultValues: {
      permissions: admin.permissions,
    },
  });

  const permissions = watch('permissions');

  const hasPermissionChanges = () => {
    return JSON.stringify(permissions) !== JSON.stringify(admin.permissions);
  };

  const getRevokedPermissions = (oldPerms: AdminPermissions, newPerms: AdminPermissions) => {
    const revoked: string[] = [];
    Object.entries(oldPerms).forEach(([key, value]) => {
      if (value && !newPerms[key as keyof AdminPermissions]) {
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
        revoked.push(labels[key] || key);
      }
    });
    return revoked;
  };

  const onSubmit = async (data: { permissions: AdminPermissions }) => {
    const revokedPermissions = getRevokedPermissions(admin.permissions, data.permissions);
    
    // Show confirmation if revoking critical permissions
    if (revokedPermissions.length > 0 && !showConfirm) {
      setPendingPermissions(data.permissions);
      setShowConfirm(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedAdmin = await adminAPI_functions.updateAdminPermissions(
        admin._id,
        data.permissions
      );
      toast.success('Permissions updated successfully!');
      onUpdated(updatedAdmin);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update permissions');
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
      setPendingPermissions(null);
    }
  };

  const handleConfirmUpdate = () => {
    if (pendingPermissions) {
      onSubmit({ permissions: pendingPermissions });
    }
  };

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 150);
  };

  return (
    <>
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black transition-opacity duration-200 ${
        isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
      }`} onClick={handleClose}>
      <div 
        className={`bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-200 ${
          isVisible ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Edit Permissions</h2>
              <p className="text-sm text-gray-600 mt-1">
                Managing permissions for <span className="font-medium">{admin.name}</span>
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <PermissionsGrid
                permissions={permissions}
                onChange={(newPermissions) => setValue('permissions', newPermissions)}
                errors={errors.permissions}
              />

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {hasPermissionChanges() ? (
                    <span className="text-orange-600 font-medium">● Unsaved changes</span>
                  ) : (
                    'No changes made'
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !hasPermissionChanges()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isSubmitting ? 'Updating...' : 'Update Permissions'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && pendingPermissions && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black bg-opacity-75 animate-in fade-in duration-200"
          onClick={() => setShowConfirm(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Confirm Permission Changes</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    You are about to revoke the following permissions from <strong>{admin.name}</strong>:
                  </p>
                  <ul className="mt-2 text-sm text-gray-700 list-disc list-inside">
                    {getRevokedPermissions(admin.permissions, pendingPermissions).map((permission) => (
                      <li key={permission}>{permission}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm text-red-600">
                    This action will immediately restrict their access to these features.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpdate}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Confirm Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditPermissionsModal;