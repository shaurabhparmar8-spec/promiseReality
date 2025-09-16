import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { adminAPI_functions, isDevelopment } from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set up axios interceptor for token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          // Check if it's a mock token (development mode)
          if (isDevelopment && token.startsWith('mock_')) {
            // For mock tokens, get user data from localStorage
            const userData = localStorage.getItem('user');
            if (userData) {
              setUser(JSON.parse(userData));
            } else {
              logout();
            }
          } else {
            // Real token - check with backend
            const response = await api.get('/auth/profile');
            if (response.data.success) {
              setUser(response.data.data.user);
            } else {
              // Invalid token
              logout();
            }
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (credentials, isAdmin = false) => {
    try {
      // Use mock authentication in development mode for admin login
      if (isDevelopment && isAdmin && adminAPI_functions.adminLogin) {
        try {
          // Map the credentials to match mock authentication expected format
          const mockCredentials = {
            phoneNumber: credentials.phone || credentials.phoneNumber,
            password: credentials.password
          };
          const response = await adminAPI_functions.adminLogin(mockCredentials);
          
          if (response.success) {
            const { user, token } = response.data;
            
            setUser(user);
            setToken(token);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            if (user.role === 'admin' || user.role === 'owner') {
              toast.success('Admin login successful! You can access the Admin Dashboard from the menu.');
            } else {
              toast.success('Login successful!');
            }
            return { success: true, user };
          }
        } catch (error) {
          toast.error(error.message || 'Invalid credentials');
          return { success: false, message: error.message };
        }
      }
      
      // Use real API for production or non-admin login
      const endpoint = isAdmin ? '/auth/admin/login' : '/auth/login';
      const response = await api.post(endpoint, credentials);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        
        setUser(user);
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        if (user.role === 'admin') {
          toast.success('Admin login successful! You can access the Admin Dashboard from the menu.');
        } else {
          toast.success('Login successful!');
        }
        return { success: true, user };
      } else {
        toast.error(response.data.message || 'Login failed');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        
        setUser(user);
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        toast.success('Registration successful!');
        return { success: true, user };
      } else {
        toast.error(response.data.message || 'Registration failed');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      
      if (response.data.success) {
        setUser(response.data.data.user);
        toast.success('Profile updated successfully!');
        return { success: true };
      } else {
        toast.error(response.data.message || 'Update failed');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const isAuthenticated = () => {
    return !!user && !!token;
  };

  const isAdmin = () => {
    return user?.role === 'admin' || user?.role === 'owner' || user?.role === 'sub-admin';
  };

  const isOwner = () => {
    return user?.role === 'owner';
  };

  const isMainAdmin = () => {
    return user?.role === 'admin' || user?.role === 'owner';
  };

  const isSubAdmin = () => {
    return user?.role === 'sub-admin';
  };

  const hasPermission = (permission) => {
    // Owners and main admins have all permissions
    if (user?.role === 'owner' || user?.role === 'admin') {
      return true;
    }
    
    // Sub-admins only have specific permissions
    if (user?.role === 'sub-admin') {
      return user?.permissions && user?.permissions[permission] === true;
    }
    
    // Regular users have no admin permissions
    return false;
  };

  const loginSubAdmin = async (credentials) => {
    try {
      const response = await api.post('/sub-admin/login', credentials);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        
        setUser(user);
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        toast.success('Sub-admin login successful!');
        return { success: true, user };
      } else {
        toast.error(response.data.message || 'Sub-admin login failed');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Sub-admin login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    loginSubAdmin,
    isAuthenticated,
    isAdmin,
    isOwner,
    isMainAdmin,
    isSubAdmin,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};