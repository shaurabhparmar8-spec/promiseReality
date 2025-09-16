import React, { useState, useEffect } from 'react';
import { Calendar, User, Clock, Tag, Search } from 'lucide-react';
import { blogAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Mock blog data for demo (in real app, this would come from API)
  const mockBlogs = [
    {
      _id: '1',
      title: "Top 10 Things to Consider When Buying Your First Home",
      excerpt: "Buying your first home is an exciting milestone, but it can also be overwhelming. Here are the essential factors to consider before making this important decision.",
      featuredImage: { url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
      createdAt: "2024-01-15T00:00:00Z",
      author: { name: "Promise Realty Team" },
      category: "Home Buying",
      readTime: 5,
      slug: "top-10-things-buying-first-home"
    },
    {
      _id: '2',
      title: "Real Estate Investment Trends in 2024",
      excerpt: "Discover the latest trends shaping the real estate investment landscape and how to capitalize on emerging opportunities in today's market.",
      featuredImage: { url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
      createdAt: "2024-01-10T00:00:00Z",
      author: { name: "Investment Team" },
      category: "Investment",
      readTime: 7,
      slug: "real-estate-investment-trends-2024"
    },
    {
      _id: '3',
      title: "How to Stage Your Home for a Quick Sale",
      excerpt: "Learn professional staging techniques that can help your property sell faster and for a better price in today's competitive market.",
      featuredImage: { url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
      createdAt: "2024-01-05T00:00:00Z",
      author: { name: "Sales Team" },
      category: "Home Selling",
      readTime: 4,
      slug: "stage-home-quick-sale"
    },
    {
      _id: '4',
      title: "Understanding Property Taxes: A Complete Guide",
      excerpt: "Navigate the complex world of property taxes with our comprehensive guide covering assessments, exemptions, and payment strategies.",
      featuredImage: { url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
      createdAt: "2024-01-01T00:00:00Z",
      author: { name: "Legal Team" },
      category: "Legal Advice",
      readTime: 8,
      slug: "understanding-property-taxes-guide"
    },
    {
      _id: '5',
      title: "Market Analysis: Best Neighborhoods for Families",
      excerpt: "Explore the top family-friendly neighborhoods with excellent schools, parks, and community amenities that make them perfect for raising children.",
      featuredImage: { url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
      createdAt: "2023-12-28T00:00:00Z",
      author: { name: "Market Research Team" },
      category: "Market Trends",
      readTime: 6,
      slug: "best-neighborhoods-families"
    },
    {
      _id: '6',
      title: "Smart Home Technology: Adding Value to Your Property",
      excerpt: "Discover how smart home features can increase your property value and attract modern buyers in today's tech-savvy market.",
      featuredImage: { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
      createdAt: "2023-12-25T00:00:00Z",
      author: { name: "Technology Team" },
      category: "Tips & Advice",
      readTime: 5,
      slug: "smart-home-technology-property-value"
    }
  ];

  const categories = [
    'All Categories',
    'Home Buying',
    'Investment',
    'Home Selling',
    'Market Trends',
    'Tips & Advice',
    'Legal Advice'
  ];

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      // Try to fetch from API first
      try {
        const response = await blogAPI.getAll();
        if (response.data.success && response.data.data.blogs.length > 0) {
          setBlogs(response.data.data.blogs);
        } else {
          // Use mock data if no blogs from API
          setBlogs(mockBlogs);
        }
      } catch (apiError) {
        // Use mock data if API fails
        setBlogs(mockBlogs);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs(mockBlogs);
    } finally {
      setLoading(false);
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || selectedCategory === 'All Categories' || 
                           blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Latest Insights</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest real estate trends, tips, and market insights from our experts
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Blog Grid */}
        {filteredBlogs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog) => (
              <article key={blog._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={blog.featuredImage?.url}
                    alt={blog.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=200&fit=crop';
                    }}
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {blog.category}
                    </span>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{blog.readTime} min read</span>
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {blog.title}
                  </h2>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {blog.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <User className="w-4 h-4" />
                      <span>{blog.author?.name || 'Promise Realty'}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(blog.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Link
                      to={`/blog/${blog.slug || blog._id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Read More →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Articles Found</h3>
            <p className="text-gray-600">Try adjusting your search terms or category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;