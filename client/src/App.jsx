import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { initPageAnimations } from './styles/animations';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminDashboard from './components/Admin/AdminDashboardClean';
import UserDashboard from './pages/UserDashboard';
import SubAdminLoginPage from './pages/Admin/SubAdminLoginPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import WriteReviewPage from './pages/WriteReviewPage';
import ReviewFormDemo from './pages/ReviewFormDemo';
import ReviewsPage from './pages/ReviewsPage';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import WriteBlogPage from './pages/WriteBlogPage';
import NotFoundPage from './pages/NotFoundPage';
import ReviewSubmissionTest from './components/Debug/ReviewSubmissionTest';
import SubmissionTest from './components/Debug/SubmissionTest';
import AdminNavigationTest from './components/Debug/AdminNavigationTest';
import UserBlogTest from './components/Debug/UserBlogTest';
import SimpleBlogTest from './components/Debug/SimpleBlogTest';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

// Layout component to conditionally render navbar and footer
const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = ['/login', '/register', '/forgot-password', '/sub-admin/login'].includes(location.pathname) || 
                     location.pathname.startsWith('/reset-password');

  return (
    <div className="App min-h-screen bg-gray-50 flex flex-col">
      {!isAdminRoute && !isAuthRoute && <Navbar />}
      <main className={`flex-grow ${(isAdminRoute || isAuthRoute) ? "" : "main-content"}`}>
        {children}
      </main>
      {!isAdminRoute && !isAuthRoute && <Footer />}
    </div>
  );
};

function App() {
  useEffect(() => {
    // Initialize page animations
    initPageAnimations();
    
    // Cleanup function
    return () => {
      // Clean up any global event listeners if needed
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/property/:id" element={<PropertyDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/write-review" element={<WriteReviewPage />} />
            <Route path="/write-blog" element={<WriteBlogPage />} />
            <Route path="/review-demo" element={<ReviewFormDemo />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogDetailPage />} />
            <Route path="/test-submission" element={<ReviewSubmissionTest />} />
            <Route path="/submission-test" element={<SubmissionTest />} />
            <Route path="/admin-nav-test" element={<AdminNavigationTest />} />
            <Route path="/user-blog-test" element={<UserBlogTest />} />
            <Route path="/simple-blog-test" element={<SimpleBlogTest />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/admin/login" element={<SubAdminLoginPage />} />
            <Route path="/sub-admin/login" element={<SubAdminLoginPage />} />
            
            {/* Protected User Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Admin Routes */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#4aed88',
              },
            },
            error: {
              duration: 4000,
              theme: {
                primary: '#ff4b4b',
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;