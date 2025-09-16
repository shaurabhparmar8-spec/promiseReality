import React, { useState, useEffect } from 'react';
import Welcome from '../components/Welcome';
import CompanyServices from '../components/CompanyServices';
import WhyChoose from '../components/WhyChoose';
import ReviewsAndBlogs from '../components/ReviewsAndBlogs';
import { initPageAnimations } from '../styles/animations';
import { propertyAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';

// Statically import to avoid dynamic import fetch issues
import Slider from '../components/Slider';
import FeaturedProperties from '../components/FeaturedProperties';

const MAX_RETRIES = 3;

const HomePage = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await propertyAPI.getFeatured(6);
      
      if (response.data.success) {
        setFeaturedProperties(response.data.data.properties);
        setError(null);
      } else {
        throw new Error('Failed to load properties');
      }
    } catch (err) {
      console.error('API Error:', {
        error: err,
        endpoint: '/api/properties/featured',
        status: err.response?.status,
        data: err.response?.data
      });
      if (retryCount < MAX_RETRIES) {
        setRetryCount(retryCount + 1);
        setTimeout(fetchData, 2000 * retryCount); // Exponential backoff
      } else {
        setError(`Failed to load properties. ${err.response?.data?.message || 'Server may be unavailable'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    initPageAnimations();
    window.scrollTo(0, 0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-red-50 rounded-lg max-w-md">
          <h3 className="text-xl font-medium text-red-600 mb-2">Error Loading Page</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setRetryCount(0);
              fetchData();
            }}
            className="btn-primary px-4 py-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="homepage">
        <Welcome />
        <Slider properties={featuredProperties} />
        <FeaturedProperties properties={featuredProperties} />
        <CompanyServices />
        <WhyChoose />
        <ReviewsAndBlogs />
      </div>
    </ErrorBoundary>
  );
};

export default HomePage;