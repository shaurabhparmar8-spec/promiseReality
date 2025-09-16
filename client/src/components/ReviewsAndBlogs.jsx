import React, { useState, useEffect, useRef } from 'react';
import { Star, Quote, Calendar, User, MessageCircle, ThumbsUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { reviewAPI, formatDate } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { staggerAnimation } from '../styles/animations';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';
import WriteReviewForm from './Reviews/WriteReviewForm';

const ReviewsAndBlogs = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { isAuthenticated } = useAuth();
  const sectionRef = useRef(null);

  // Mock blog data (in real app, this would come from API)
  const blogs = [
    {
      id: 1,
      title: "Top 10 Things to Consider When Buying Your First Home",
      excerpt: "Buying your first home is an exciting milestone, but it can also be overwhelming. Here are the essential factors to consider...",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "2024-01-15",
      author: "Promise Realty Team",
      category: "Home Buying",
      readTime: "5 min read"
    },
    {
      id: 2,
      title: "Real Estate Investment Trends in 2024",
      excerpt: "Discover the latest trends shaping the real estate investment landscape and how to capitalize on emerging opportunities...",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "2024-01-10",
      author: "Investment Team",
      category: "Investment",
      readTime: "7 min read"
    },
    {
      id: 3,
      title: "How to Stage Your Home for a Quick Sale",
      excerpt: "Learn professional staging techniques that can help your property sell faster and for a better price in today's market...",
      image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "2024-01-05",
      author: "Sales Team",
      category: "Home Selling",
      readTime: "4 min read"
    }
  ];

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await reviewAPI.getAll({ limit: 6 });
        
        if (response.data.success) {
          setReviews(response.data.data.reviews);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  useEffect(() => {
    if (sectionRef.current && !loading) {
      const cards = sectionRef.current.querySelectorAll('.review-card, .blog-card');
      staggerAnimation(cards, { stagger: 0.15 });
    }
  }, [loading]);

  // Auto-rotate reviews
  useEffect(() => {
    if (reviews.length > 1) {
      const interval = setInterval(() => {
        setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [reviews.length]);

  const nextReview = () => {
    setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleWriteReview = () => {
    setShowReviewForm(true);
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      console.log('Submitting review from ReviewsAndBlogs:', reviewData);
      
      const response = await reviewAPI.create({
        rating: reviewData.rating,
        comment: reviewData.review,
        reviewType: reviewData.reviewType || 'general'
      });

      if (response.data.success) {
        setShowReviewForm(false);
        fetchReviews(); // Refresh reviews
        toast.success('Review submitted successfully! It will be published after approval.');
      } else {
        throw new Error(response.data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      
      // Show specific error message
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        toast.error(`Validation errors: ${errorMessages}`);
      } else {
        toast.error('Failed to submit review. Please try again.');
      }
      
      throw error;
    }
  };

  return (
    <section ref={sectionRef} className="section-padding bg-gray-50">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-gray-900 mb-6">
            Reviews & Insights
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Hear from our satisfied clients and stay updated with the latest real estate insights and market trends.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Reviews Section */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Client Reviews</h3>
              <button
                onClick={handleWriteReview}
                className="btn-primary px-4 py-2 text-sm"
              >
                Write Review
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <LoadingSpinner size="large" />
                <p className="mt-4 text-gray-600">Loading reviews...</p>
              </div>
            ) : reviews.length > 0 ? (
              <div className="relative">
                {/* Featured Review */}
                <div className="review-card bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                        {reviews[currentReviewIndex]?.user?.name?.charAt(0) || 'U'}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-900">
                          {reviews[currentReviewIndex]?.user?.name || 'Anonymous'}
                        </h4>
                        <div className="flex items-center space-x-1">
                          {renderStars(reviews[currentReviewIndex]?.rating || 5)}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        "{reviews[currentReviewIndex]?.comment}"
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDate(reviews[currentReviewIndex]?.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quote Icon */}
                  <Quote className="absolute top-4 right-4 w-8 h-8 text-primary-200" />
                </div>

                {/* Navigation */}
                {reviews.length > 1 && (
                  <div className="flex items-center justify-between">
                    <button
                      onClick={prevReview}
                      className="w-10 h-10 bg-white hover:bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    
                    <div className="flex space-x-2">
                      {reviews.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentReviewIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                            index === currentReviewIndex ? 'bg-primary-600' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <button
                      onClick={nextReview}
                      className="w-10 h-10 bg-white hover:bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                )}

                {/* All Reviews Link */}
                <div className="text-center mt-6">
                  <Link
                    to="/reviews"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View All Reviews →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No reviews yet. Be the first to share your experience!</p>
                <button
                  onClick={handleWriteReview}
                  className="btn-primary mt-4 px-6 py-2"
                >
                  Write First Review
                </button>
              </div>
            )}
          </div>

          {/* Blogs Section */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Latest Insights</h3>
              <Link
                to="/blog"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                View All →
              </Link>
            </div>

            <div className="space-y-6">
              {blogs.map((blog, index) => (
                <article key={blog.id} className="blog-card bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 group hover:shadow-xl transition-shadow duration-300">
                  <div className="flex">
                    <div className="w-32 h-32 flex-shrink-0">
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                          {blog.category}
                        </span>
                        <span className="text-xs text-gray-500">{blog.readTime}</span>
                      </div>
                      
                      <h4 className="font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2">
                        <Link to={`/blog/${blog.id}`}>
                          {blog.title}
                        </Link>
                      </h4>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {blog.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          <span>{blog.author}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>{formatDate(blog.date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">4.9/5</div>
              <div className="text-gray-600">Average Rating</div>
              <div className="flex justify-center mt-2">
                {renderStars(5)}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-gray-600">Happy Reviews</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">50+</div>
              <div className="text-gray-600">Blog Articles</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">10K+</div>
              <div className="text-gray-600">Monthly Readers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Write a Review</h2>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <WriteReviewForm 
                onSubmit={handleReviewSubmit}
                className="shadow-none"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ReviewsAndBlogs;