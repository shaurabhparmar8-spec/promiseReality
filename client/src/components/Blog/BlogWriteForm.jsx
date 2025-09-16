import React, { useState } from 'react';
import { PenTool, Image, Tag, FileText, Eye, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const BlogWriteForm = ({ onSubmit, isAdmin = false, className = "" }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [],
    status: 'published',
    image: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const categories = [
    'Home Buying',
    'Investment', 
    'Home Selling',
    'Market Trends',
    'Tips & Advice',
    'Real Estate Tips',
    'Market Updates',
    'Investment Guide',
    'Property News',
    'Legal Advice',
    'Selling Tips'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a blog title');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Please enter blog content');
      return;
    }

    if (!formData.excerpt.trim()) {
      toast.error('Please enter a blog excerpt');
      return;
    }

    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        category: '',
        tags: [],
        status: 'published',
        image: ''
      });
      
      toast.success('Blog post created successfully!');
    } catch (error) {
      console.error('Blog submission error:', error);
      toast.error('Failed to create blog post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Write a Blog Post</h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          Share your knowledge and insights about real estate with our community.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
            Blog Title *
          </label>
          <div className="relative">
            <PenTool className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
              placeholder="Enter an engaging blog title"
              required
            />
          </div>
          <div className="mt-1 text-right">
            <span className={`text-sm ${formData.title.length > 180 ? 'text-red-500' : 'text-gray-500'}`}>
              {formData.title.length}/200
            </span>
          </div>
        </div>

        {/* Category and Status */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Featured Image URL */}
        <div>
          <label htmlFor="image" className="block text-sm font-semibold text-gray-700 mb-2">
            Featured Image URL
          </label>
          <div className="relative">
            <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Enter a URL for the featured image (optional)
          </p>
        </div>

        {/* Excerpt */}
        <div>
          <label htmlFor="excerpt" className="block text-sm font-semibold text-gray-700 mb-2">
            Excerpt *
          </label>
          <div className="relative">
            <Eye className="absolute left-3 top-3 text-gray-400" size={20} />
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              rows={3}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none"
              placeholder="Write a brief excerpt that summarizes your blog post..."
              required
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-500">
              A short summary that will appear in blog listings
            </p>
            <span className={`text-sm font-medium ${
              formData.excerpt.length > 280 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {formData.excerpt.length}/300
            </span>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                placeholder="Add a tag"
              />
            </div>
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
            >
              Add
            </button>
          </div>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
            Blog Content *
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 text-gray-400" size={20} />
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={12}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none"
              placeholder="Write your blog content here... You can use HTML tags for formatting."
              required
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Write your full blog content. You can use basic HTML tags for formatting.
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg text-white transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-300 ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-lg hover:shadow-xl'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Publishing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Save size={20} />
                <span>Publish Blog Post</span>
              </div>
            )}
          </button>
        </div>
      </form>

      {/* Footer Note */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700 text-center">
          <span className="font-semibold">Note:</span> Your blog post will be published immediately. 
          Make sure to review your content before publishing.
        </p>
      </div>
    </div>
  );
};

export default BlogWriteForm;