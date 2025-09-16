import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, User, Clock, Tag, ArrowLeft, Share2, Heart } from 'lucide-react';
import { blogAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const BlogDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  useEffect(() => {
    fetchBlogBySlug();
  }, [slug]);

  const fetchBlogBySlug = async () => {
    try {
      setLoading(true);
      
      // Try to fetch blog by slug
      const response = await blogAPI.getBySlug(slug);
      
      if (response.data.success) {
        setBlog(response.data.data.blog);
        fetchRelatedBlogs(response.data.data.blog.category);
      } else {
        // If slug not found, try to fetch by ID
        try {
          const idResponse = await blogAPI.getById(slug);
          if (idResponse.data.success) {
            setBlog(idResponse.data.data.blog);
            fetchRelatedBlogs(idResponse.data.data.blog.category);
          } else {
            toast.error('Blog post not found');
            navigate('/blog');
          }
        } catch (idError) {
          toast.error('Blog post not found');
          navigate('/blog');
        }
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('Failed to load blog post');
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedBlogs = async (category) => {
    try {
      const response = await blogAPI.getAll({ category, limit: 3 });
      if (response.data.success) {
        setRelatedBlogs(response.data.data.blogs.filter(b => b.slug !== slug).slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching related blogs:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
          <Link to="/blog" className="text-blue-600 hover:text-blue-800">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <Link 
            to="/blog" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>

      {/* Blog Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Featured Image */}
          {blog.featuredImage && (
            <div className="mb-8">
              <img
                src={blog.featuredImage.url}
                alt={blog.featuredImage.alt || blog.title}
                className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-lg"
              />
            </div>
          )}

          {/* Blog Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            {/* Category */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {blog.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {blog.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
              <div className="flex items-center">
                <User size={18} className="mr-2" />
                <span>{blog.author?.name || 'Promise Realty Team'}</span>
              </div>
              <div className="flex items-center">
                <Calendar size={18} className="mr-2" />
                <span>{formatDate(blog.createdAt)}</span>
              </div>
              <div className="flex items-center">
                <Clock size={18} className="mr-2" />
                <span>{blog.readTime || Math.ceil(blog.content.split(' ').length / 200) + ' min read'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Share2 size={18} />
                Share
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Heart size={18} />
                Like
              </button>
            </div>
          </div>

          {/* Blog Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Tag size={20} className="mr-2" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Blogs */}
          {relatedBlogs.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedBlogs.map((relatedBlog) => (
                  <Link
                    key={relatedBlog._id}
                    to={`/blog/${relatedBlog.slug}`}
                    className="group"
                  >
                    <div className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                      {relatedBlog.featuredImage && (
                        <img
                          src={relatedBlog.featuredImage.url}
                          alt={relatedBlog.title}
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {relatedBlog.title}
                        </h4>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {relatedBlog.excerpt}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <Calendar size={14} className="mr-1" />
                          {formatDate(relatedBlog.createdAt)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;