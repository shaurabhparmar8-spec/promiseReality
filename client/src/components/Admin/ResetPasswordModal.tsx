import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { resetPasswordSchema, ResetPasswordFormData, Admin } from '../../lib/validators';
import { adminAPI_functions } from '../../lib/api';

interface ResetPasswordModalProps {
  admin: Admin;
  onClose: () => void;
  onPasswordReset: () => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  admin,
  onClose,
  onPasswordReset,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingPassword, setPendingPassword] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ResetPasswordFormData) => {
    // Show confirmation before proceeding
    if (!showConfirm) {
      setPendingPassword(data.newPassword);
      setShowConfirm(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await adminAPI_functions.resetAdminPassword(admin._id, data.newPassword);
      toast.success(`Password reset successfully for ${admin.name}`);
      onPasswordReset();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
      setPendingPassword('');
    }
  };

  const handleConfirmReset = () => {
    onSubmit({ newPassword: pendingPassword });
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 10) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
      { score: 0, label: 'Very Weak', color: 'bg-red-500' },
      { score: 1, label: 'Weak', color: 'bg-red-400' },
      { score: 2, label: 'Fair', color: 'bg-yellow-400' },
      { score: 3, label: 'Good', color: 'bg-yellow-500' },
      { score: 4, label: 'Strong', color: 'bg-green-400' },
      { score: 5, label: 'Very Strong', color: 'bg-green-500' },
    ];

    return levels[score] || levels[0];
  };

  const passwordStrength = getPasswordStrength(newPassword || '');

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
        className={`bg-white rounded-2xl shadow-xl max-w-md w-full transform transition-all duration-200 ${
          isVisible ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
              <p className="text-sm text-gray-600 mt-1">
                Setting new password for <span className="font-medium">{admin.name}</span>
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
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Security Notice */}
              <div className="rounded-lg bg-orange-50 p-4 border border-orange-200">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-orange-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-orange-900">Security Notice</h4>
                    <p className="text-sm text-orange-800 mt-1">
                      The admin will be notified of this password change and will need to use the new password for their next login.
                    </p>
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    {...register('newPassword')}
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-medium ${
                        passwordStrength.score < 3 ? 'text-red-600' : 
                        passwordStrength.score < 4 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  </div>
                )}

                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-2">Password Requirements:</p>
                <ul className="space-y-1">
                  <li className={`flex items-center space-x-2 ${
                    newPassword && newPassword.length >= 10 ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    <span>{newPassword && newPassword.length >= 10 ? '✓' : '•'}</span>
                    <span>At least 10 characters long</span>
                  </li>
                  <li className={`flex items-center space-x-2 ${
                    newPassword && /[a-z]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    <span>{newPassword && /[a-z]/.test(newPassword) ? '✓' : '•'}</span>
                    <span>At least one lowercase letter</span>
                  </li>
                  <li className={`flex items-center space-x-2 ${
                    newPassword && /[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    <span>{newPassword && /[A-Z]/.test(newPassword) ? '✓' : '•'}</span>
                    <span>At least one uppercase letter</span>
                  </li>
                  <li className={`flex items-center space-x-2 ${
                    newPassword && /[0-9]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    <span>{newPassword && /[0-9]/.test(newPassword) ? '✓' : '•'}</span>
                    <span>At least one number</span>
                  </li>
                  <li className={`flex items-center space-x-2 ${
                    newPassword && /[^A-Za-z0-9]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    <span>{newPassword && /[^A-Za-z0-9]/.test(newPassword) ? '✓' : '•'}</span>
                    <span>At least one special character</span>
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newPassword || passwordStrength.score < 3}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black bg-opacity-75 animate-in fade-in duration-200"
          onClick={() => setShowConfirm(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Confirm Password Reset</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Are you sure you want to reset the password for <strong>{admin.name}</strong>?
                  </p>
                  <p className="mt-2 text-sm text-orange-600">
                    This will immediately invalidate their current password and they will need to use the new one to log in.
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
                onClick={handleConfirmReset}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResetPasswordModal;