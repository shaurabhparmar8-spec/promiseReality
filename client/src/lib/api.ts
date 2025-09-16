import axios from 'axios';
import { CreateAdminFormData, AdminPermissions, Admin } from './validators';

// Create axios instance for admin API calls
const adminAPI = axios.create({
  baseURL: 'http://localhost:5000/api/admin',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
adminAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
adminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Unauthorized - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Admin API functions
export const getAdmins = async (): Promise<Admin[]> => {
  try {
    const response = await adminAPI.get('/list');
    return response.data.admins;
  } catch (error) {
    // Mock data for development if API is not available
    console.warn('Admin API not available, using mock data');
    return mockAdmins;
  }
};

export const createAdmin = async (adminData: CreateAdminFormData): Promise<Admin> => {
  try {
    const response = await adminAPI.post('/create', adminData);
    return response.data.admin;
  } catch (error: any) {
    // Check for specific error codes
    if (error.response?.status === 409) {
      throw new Error('An admin with this phone number already exists');
    }
    throw error;
  }
};

export const updateAdminPermissions = async (
  adminId: string, 
  permissions: AdminPermissions
): Promise<Admin> => {
  try {
    const response = await adminAPI.put(`/${adminId}/permissions`, { permissions });
    return response.data.admin;
  } catch (error) {
    throw error;
  }
};

export const resetAdminPassword = async (
  adminId: string, 
  newPassword: string
): Promise<void> => {
  try {
    await adminAPI.put(`/${adminId}/password`, { newPassword });
  } catch (error) {
    throw error;
  }
};

export const deleteAdmin = async (adminId: string): Promise<void> => {
  try {
    await adminAPI.delete(`/${adminId}`);
  } catch (error) {
    throw error;
  }
};

// Mock data for development/fallback
const mockAdmins: Admin[] = [];

// LocalStorage key for persistence
const MOCK_ADMIN_STORE_KEY = 'promise_realty_mock_admins';
const MOCK_ADMIN_ID_KEY = 'promise_realty_mock_admin_next_id';

// Initialize mock store with persistence
const initializeMockStore = (): Admin[] => {
  try {
    const stored = localStorage.getItem(MOCK_ADMIN_STORE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load mock admin data from localStorage:', error);
  }
  
  // If no stored data or error, start with empty array
  localStorage.setItem(MOCK_ADMIN_STORE_KEY, JSON.stringify([]));
  localStorage.setItem(MOCK_ADMIN_ID_KEY, '1');
  
  // Remove 9876543210 admin password if it exists
  const passwordStore = JSON.parse(localStorage.getItem('mock_admin_passwords') || '{}');
  if (passwordStore['9876543210']) {
    delete passwordStore['9876543210'];
    localStorage.setItem('mock_admin_passwords', JSON.stringify(passwordStore));
  }
  
  return [];
};

const getNextMockId = (): number => {
  try {
    const stored = localStorage.getItem(MOCK_ADMIN_ID_KEY);
    return stored ? parseInt(stored, 10) : 1;
  } catch {
    return 1;
  }
};

const setNextMockId = (id: number): void => {
  localStorage.setItem(MOCK_ADMIN_ID_KEY, id.toString());
};

const saveMockStore = (store: Admin[]): void => {
  localStorage.setItem(MOCK_ADMIN_STORE_KEY, JSON.stringify(store));
};

// In-memory store for mock operations (development only) - now with persistence
let mockAdminStore = initializeMockStore();
let nextMockId = getNextMockId();

// Mock implementations that simulate API behavior
export const mockCreateAdmin = async (adminData: CreateAdminFormData): Promise<Admin> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Check for duplicate phone number
      const existingAdmin = mockAdminStore.find(admin => 
        admin.phoneNumber === adminData.phoneNumber
      );
      
      if (existingAdmin) {
        reject(new Error('An admin with this phone number already exists'));
        return;
      }

      const newAdmin: Admin = {
        _id: nextMockId.toString(),
        name: adminData.name,
        phoneNumber: adminData.phoneNumber,
        role: 'admin',
        permissions: adminData.permissions,
        createdAt: new Date().toISOString(),
      };

      // Store password hash for authentication (in real app, this would be hashed)
      // Use the provided password from the form
      const passwordStore = JSON.parse(localStorage.getItem('mock_admin_passwords') || '{}');
      passwordStore[adminData.phoneNumber] = adminData.password; // Store the actual password provided
      localStorage.setItem('mock_admin_passwords', JSON.stringify(passwordStore));

      mockAdminStore.push(newAdmin);
      nextMockId++;
      setNextMockId(nextMockId);
      saveMockStore(mockAdminStore);
      resolve(newAdmin);
    }, 1000); // Simulate network delay
  });
};

export const mockUpdateAdminPermissions = async (
  adminId: string,
  permissions: AdminPermissions
): Promise<Admin> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const adminIndex = mockAdminStore.findIndex(admin => admin._id === adminId);
      
      if (adminIndex === -1) {
        reject(new Error('Admin not found'));
        return;
      }

      mockAdminStore[adminIndex] = {
        ...mockAdminStore[adminIndex],
        permissions,
      };

      saveMockStore(mockAdminStore);
      resolve(mockAdminStore[adminIndex]);
    }, 500);
  });
};

export const mockResetAdminPassword = async (
  adminId: string,
  newPassword: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const admin = mockAdminStore.find(admin => admin._id === adminId);
      
      if (!admin) {
        reject(new Error('Admin not found'));
        return;
      }

      // In a real implementation, this would hash and store the password
      console.log(`Password reset for admin ${admin.name} (${adminId})`);
      resolve();
    }, 500);
  });
};

export const mockDeleteAdmin = async (adminId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const adminIndex = mockAdminStore.findIndex(admin => admin._id === adminId);
      
      if (adminIndex === -1) {
        reject(new Error('Admin not found'));
        return;
      }

      // Don't allow deleting the owner (safety check)
      if (mockAdminStore[adminIndex].role === 'owner') {
        reject(new Error('Cannot delete owner account'));
        return;
      }

      mockAdminStore.splice(adminIndex, 1);
      saveMockStore(mockAdminStore);
      resolve();
    }, 500);
  });
};

export const mockGetAdmins = async (): Promise<Admin[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Refresh from localStorage in case it was updated
      mockAdminStore = initializeMockStore();
      resolve([...mockAdminStore]);
    }, 300);
  });
};

// Utility function to check if we're in development mode
export const isDevelopment = true; // Set to false for production

// Export the appropriate functions based on environment
// Mock authentication functions for development
export const mockAdminLogin = async (credentials: { phoneNumber: string; password: string }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('🔧 Mock Admin Login - Credentials:', credentials);
      
      // Define hardcoded admin credentials for testing
      const hardcodedAdmins = [
        { phone: '9876543209', password: 'owner123', role: 'owner', name: 'Owner Admin' },
        { phone: '9876543211', password: 'sub123', role: 'sub-admin', name: 'Sub Admin' }
      ];
      
      // Find admin by phone
      const admin = hardcodedAdmins.find(a => a.phone === credentials.phoneNumber);
      
      if (!admin) {
        console.log('❌ Admin not found for phone:', credentials.phoneNumber);
        reject(new Error('Invalid phone number or password'));
        return;
      }
      
      // Check password
      if (credentials.password !== admin.password) {
        console.log('❌ Invalid password for:', credentials.phoneNumber);
        reject(new Error('Invalid phone number or password'));
        return;
      }
      
      console.log('✅ Mock admin login successful:', admin.role, admin.name);
      
      const userData = {
        _id: 'mock_' + admin.phone,
        name: admin.name,
        phone: admin.phone,
        email: `${admin.name.toLowerCase().replace(/\s+/g, '.')}@promiserealty.com`,
        role: admin.role,
        permissions: admin.role === 'owner' ? {
          addProperty: true,
          editProperty: true,
          deleteProperty: true,
          writeReview: true,
          deleteReview: true,
          writeBlog: true,
          deleteBlog: true,
          viewMessages: true,
          deleteMessages: true,
          deleteUser: true,
          viewInquiries: true,
          manageSubAdmins: true,
          createAdmin: true
        } : {
          addProperty: true,
          editProperty: true,
          deleteProperty: true,
          writeReview: true,
          deleteReview: true,
          writeBlog: true,
          deleteBlog: true,
          viewMessages: true,
          deleteMessages: true,
          deleteUser: true,
          viewInquiries: true
        }
      };
      
      const token = 'mock_admin_token_' + userData._id + '_' + Date.now();
      
      resolve({
        success: true,
        data: {
          user: userData,
          token: token
        }
      });
    }, 800); // Simulate network delay
  });
};

// Reset localStorage data (for testing purposes)
export const resetMockData = () => {
  localStorage.removeItem(MOCK_ADMIN_STORE_KEY);
  localStorage.removeItem(MOCK_ADMIN_ID_KEY);
  localStorage.removeItem('mock_admin_passwords');
  alert('Mock data cleared! Please refresh the page.');
};

export const adminAPI_functions = {
  getAdmins: isDevelopment ? mockGetAdmins : getAdmins,
  createAdmin: isDevelopment ? mockCreateAdmin : createAdmin,
  updateAdminPermissions: isDevelopment ? mockUpdateAdminPermissions : updateAdminPermissions,
  resetAdminPassword: isDevelopment ? mockResetAdminPassword : resetAdminPassword,
  deleteAdmin: isDevelopment ? mockDeleteAdmin : deleteAdmin,
  adminLogin: isDevelopment ? mockAdminLogin : null, // Add mock login function
  resetMockData, // Add reset function for testing
};

// Utility functions for formatting
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  }
};