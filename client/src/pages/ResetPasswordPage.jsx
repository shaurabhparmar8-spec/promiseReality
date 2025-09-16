import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Lock, CheckCircle, AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import PasswordInput from '../components/PasswordInput';
import { pageTransition } from '../styles/animations';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [tokenValidating, setTokenValidating] = useState(true);
  const [passwordValidation, setPasswordValidation] = useState(null);
  const navigate = useNavigate();
  const { token } = useParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
    setValue,
    control,
    getValues
  } = useForm();

  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');

  // Page transition animation
  useEffect(() => {
    const pageElement = document.querySelector('.reset-password-page');
    if (pageElement) {
      pageTransition.enter(pageElement);
    }
  }, []);

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false);
        setTokenValidating(false);
        return;
      }

      try {
        const response = await api.get(`/auth/reset-password/validate?token=${token}`);
        const result = response.data;
        
        setTokenValid(result.valid);
      } catch (error) {
        console.error('Token validation error:', error);
        setTokenValid(false);
      } finally {
        setTokenValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const onSubmit = async (data) => {
    // Validate password match
    if (data.newPassword !== data.confirmPassword) {
      setError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match'
      });
      return;
    }

    // Check password validation
    if (passwordValidation && !passwordValidation.isValid) {
      toast.error('Please fix password requirements before submitting');
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { 
        newPassword: data.newPassword 
      });
      const result = response.data;

      if (result.success) {
        setResetSuccess(true);
        toast.success('🎉 Password reset successful! You can now login with your new password.');
      } else {
        if (result.errors && Array.isArray(result.errors)) {
          result.errors.forEach(error => toast.error(error));
        } else {
          toast.error(result.message || 'Failed to reset password');
        }
        
        setError('root', {
          type: 'manual',
          message: result.message || 'Failed to reset password'
        });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach(err => toast.error(err));
        } else if (errorData.message?.includes('token')) {
          setTokenValid(false);
          toast.error('Reset link has expired or is invalid');
        } else {
          toast.error(errorData.message || 'Password reset failed');
        }
      } else {
        toast.error('Network error. Please try again.');
      }
      
      setError('root', {
        type: 'manual',
        message: error.response?.data?.message || 'Network error. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading state for token validation
  if (tokenValidating) {
    return (
      <div className="reset-password-page min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <LoadingSpinner size="lg" />
            <h2 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
              Validating Reset Link
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your password reset link...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (resetSuccess) {
    return (
      <div className="reset-password-page min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              🎉 Password Reset Successful!
            </h1>
            
            <p className="text-gray-600 mb-6">
              Your password has been successfully updated with enhanced security. 
              You can now login with your new password.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-800 font-medium">
                  Security Notice: All previous sessions have been invalidated for your protection.
                </p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Continue to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="reset-password-page min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Invalid or Expired Link
            </h1>
            
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            
            <div className="space-y-4">
              <Link
                to="/forgot-password"
                className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 text-center"
              >
                Request New Link
              </Link>
              
              <Link
                to="/login"
                className="block w-full text-center text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <Link
          to="/login"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Reset Your Password
            </h1>
            <p className="text-gray-600">
              Enter your new password below.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* New Password Field with Strength Meter */}
            <Controller
              name="newPassword"
              control={control}
              rules={{
                required: 'Password is required',
                minLength: { value: 10, message: 'Password must be at least 10 characters long' }
              }}
              render={({ field }) => (
                <PasswordInput
                  label="New Password"
                  placeholder="Enter your new secure password"
                  value={field.value || ''}
                  onChange={field.onChange}
                  onValidation={setPasswordValidation}
                  showStrengthMeter={true}
                  showGenerator={true}
                  required={true}
                  error={errors.newPassword?.message}
                />
              )}
            />

            {/* Confirm Password Field */}
            <Controller
              name="confirmPassword"
              control={control}
              rules={{
                required: 'Please confirm your password',
                validate: value => value === getValues('newPassword') || 'Passwords do not match'
              }}
              render={({ field }) => (
                <PasswordInput
                  label="Confirm New Password"
                  placeholder="Confirm your new password"
                  value={field.value || ''}
                  onChange={field.onChange}
                  required={true}
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            {/* Error Message */}
            {errors.root && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Reset Password
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;