import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Eye, Heart, Share2 } from 'lucide-react';
import { getImageUrl, formatPrice, authAPI } from '../utils/api';
import { staggerAnimation, cardHoverAnimation } from '../styles/animations';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const FeaturedProperties = ({ properties = [] }) => {
  const sectionRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (sectionRef.current && properties.length > 0) {
      const cards = sectionRef.current.querySelectorAll('.property-card');
      staggerAnimation(cards);
      cards.forEach(card => cardHoverAnimation(card));
    }
  }, [properties]);

  const handleShare = async (property) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this amazing ${property.type} in ${property.location.city}`,
          url: `${window.location.origin}/property/${property._id}`
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      const url = `${window.location.origin}/property/${property._id}`;
      navigator.clipboard.writeText(url).then(() => {
        toast.success('Property link copied to clipboard!');
      });
    }
  };

  const handleWishlist = async (property) => {
    if (!isAuthenticated()) {
      toast.error('Please login to add properties to wishlist');
      navigate('/login');
      return;
    }

    try {
      const response = await authAPI.toggleLike(property._id);
      if (response.data.success) {
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
      console.error('Error toggling wishlist:', error);
    }
  };

  if (properties.length === 0) {
    return null;
  }

  return (
    <section id="featured-properties" ref={sectionRef} className="section-padding bg-gray-50">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-gray-900 mb-6">
            Premium Properties
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore our carefully curated collection of premium properties that combine luxury, 
            comfort, and prime locations to offer you the perfect living experience.
          </p>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {properties.map((property) => (
            <div key={property._id} className="property-card card group overflow-hidden">
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={getImageUrl(property.images?.[0]?.url)}
                  alt={property.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                  }}
                />
                
                {/* Overlay Actions */}
                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => handleWishlist(property)}
                    aria-label="Add to wishlist"
                    className="w-10 h-10 bg-white/90 hover:bg-white text-gray-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleShare(property)}
                    aria-label="Share property"
                    className="w-10 h-10 bg-white/90 hover:bg-white text-gray-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Property Type Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-primary-600 text-white text-sm font-medium rounded-full">
                    {property.type}
                  </span>
                  {property.price.priceType === 'rent' && (
                    <span className="block mt-2 px-3 py-1 bg-secondary-500 text-white text-sm font-medium rounded-full">
                      For Rent
                    </span>
                  )}
                </div>

                {/* Price Badge */}
                <div className="absolute bottom-4 left-4">
                  <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg">
                    <div className="text-xl font-bold text-gray-900">
                      {formatPrice(property.price.amount)}
                      {property.price.priceType === 'rent' && (
                        <span className="text-sm text-gray-600">/{property.price.rentPeriod}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="card-content p-6">
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
                  <Link 
                    to={`/property/${property._id}`} 
                    className="hover:underline"
                  >
                    {property.title}
                  </Link>
                </h3>

                {/* Location */}
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{property.location.city}, {property.location.state}</span>
                </div>

                {/* Property Details */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-4">
                    {property.specifications.bedrooms > 0 && (
                      <div className="flex items-center">
                        <Bed className="w-4 h-4 mr-1" />
                        <span>{property.specifications.bedrooms}</span>
                      </div>
                    )}
                    {property.specifications.bathrooms > 0 && (
                      <div className="flex items-center">
                        <Bath className="w-4 h-4 mr-1" />
                        <span>{property.specifications.bathrooms}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Square className="w-4 h-4 mr-1" />
                      <span>{property.specifications.area.value} {property.specifications.area.unit}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    <span>{property.views}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {property.description}
                </p>

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.slice(0, 3).map((amenity, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                      {property.amenities.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{property.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <Link
                  to={`/property/${property._id}`}
                  className="block w-full btn-primary text-center py-3 font-medium"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center">
          <Link
            to="/properties"
            className="btn-outline px-8 py-4 text-lg font-medium inline-flex items-center space-x-2 group"
          >
            <span>View All Properties</span>
            <svg 
              className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

FeaturedProperties.propTypes = {
  properties: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      price: PropTypes.shape({
        amount: PropTypes.number.isRequired,
        priceType: PropTypes.oneOf(['sale', 'rent']).isRequired,
        rentPeriod: PropTypes.string,
      }).isRequired,
      location: PropTypes.shape({
        city: PropTypes.string.isRequired,
        state: PropTypes.string.isRequired,
      }).isRequired,
      specifications: PropTypes.shape({
        bedrooms: PropTypes.number,
        bathrooms: PropTypes.number,
        area: PropTypes.shape({
          value: PropTypes.number.isRequired,
          unit: PropTypes.string.isRequired,
        }).isRequired,
      }).isRequired,
      images: PropTypes.arrayOf(
        PropTypes.shape({
          url: PropTypes.string.isRequired,
        })
      ),
      amenities: PropTypes.arrayOf(PropTypes.string),
      views: PropTypes.number.isRequired,
    })
  ),
};

export default FeaturedProperties;
