import React, { useEffect } from 'react';
import BlogWriteForm from '../components/Blog/BlogWriteForm';
import { blogAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const WriteBlogPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please login to write a blog post');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmitBlog = async (blogData) => {
    try {
      console.log('Submitting blog data:', blogData);
      
      // Create the blog using the API
      const response = await blogAPI.create(blogData);

      console.log('Blog submission response:', response);

      if (response.data.success) {
        toast.success('Blog post created successfully!');
        
        // Redirect to blog page or dashboard
        setTimeout(() => {
          if (isAdmin()) {
            navigate('/admin/blogs');
          } else {
            navigate('/blog', { 
              state: { 
                message: 'Your blog post has been published successfully!' 
              }
            });
          }
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Failed to create blog post');
      }
    } catch (error) {
      console.error('Error submitting blog:', error);
      
      // Show specific error message
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        toast.error(`Validation errors: ${errorMessages}`);
      } else {
        toast.error('Failed to create blog post. Please try again.');
      }
      
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4">
      <div className="container mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Write a Blog Post</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share your expertise and insights about real estate with our community of readers.
          </p>
        </div>

        {/* Blog Form */}
        <BlogWriteForm onSubmit={handleSubmitBlog} isAdmin={isAdmin()} />

        {/* Additional Information */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Rich Content</h3>
              <p className="text-gray-600 text-sm">
                Create engaging blog posts with rich text formatting and images.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Wide Reach</h3>
              <p className="text-gray-600 text-sm">
                Your blog posts will be visible to all visitors and potential clients.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">SEO Optimized</h3>
              <p className="text-gray-600 text-sm">
                Use categories and tags to make your content easily discoverable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteBlogPage;