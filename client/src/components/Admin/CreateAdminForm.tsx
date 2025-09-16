import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { createAdminSchema, CreateAdminFormData } from '../../lib/validators';
import { adminAPI_functions } from '../../lib/api';
import PermissionsGrid from './PermissionsGrid';

interface CreateAdminFormProps {
  onAdminCreated: () => void;
}

const CreateAdminForm: React.FC<CreateAdminFormProps> = ({ onAdminCreated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<CreateAdminFormData>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      password: '',
      permissions: {
        addProperty: false,
        editProperty: false,
        deleteProperty: false,
        writeReview: false,
        deleteReview: false,
        writeBlog: false,
        deleteBlog: false,
        deleteUser: false,
        viewInquiries: false,
        viewMessages: false,
        deleteMessages: false,
      }
    }
  });

  const permissions = watch('permissions');

  const onSubmit = async (data: CreateAdminFormData) => {
    setIsSubmitting(true);
    try {
      // Map data to sub-admin creation format
      const subAdminData = {
        name: data.name,
        phone: data.phoneNumber,
        password: data.password,
        permissions: data.permissions
      };
      
      // Use sub-admin API instead of admin API
      const response = await fetch('http://localhost:5000/api/sub-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(subAdminData)
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create admin');
      }
      
      toast.success(`Admin created successfully! Login credentials: Phone: ${data.phoneNumber}, Password: ${data.password}`);
      reset();
      onAdminCreated();
    } catch (error: any) {
      console.error('Create admin error:', error);
      toast.error(error.message || 'Failed to create admin. Please check the phone number format and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Admin Details Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Admin Details
        </h3>
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Admin Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            placeholder="Enter admin name (3-60 characters)"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            {...register('phoneNumber')}
            type="tel"
            id="phoneNumber"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            placeholder="Enter phone number (10-15 digits)"
          />
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            {...register('password')}
            type="password"
            id="password"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            placeholder="Enter secure password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.password.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Must be 10+ characters with uppercase, lowercase, number, and special character
          </p>
        </div>
      </div>

      {/* Permissions Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
          Permissions
        </h3>
        <PermissionsGrid
          permissions={permissions}
          onChange={(newPermissions) => setValue('permissions', newPermissions)}
          errors={errors.permissions}
        />
      </div>

      {/* Submit Button */}
      <div className="pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Admin...
            </div>
          ) : (
            'Create Admin'
          )}
        </button>
      </div>
    </form>
  );
};

export default CreateAdminForm;
