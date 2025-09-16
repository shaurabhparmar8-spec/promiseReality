import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight, MapPin, Bed, Bath, Square, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getImageUrl, formatPrice } from '../utils/api';
import { slideUp, cardHoverAnimation } from '../styles/animations';

const Slider = ({ properties = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);
  const intervalRef = useRef(null);

  // Auto-slide functionality
  useEffect(() => {
    if (properties.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % properties.length);
      }, 20000); // 20 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [properties.length]);

  // Initialize animations
  useEffect(() => {
    if (sliderRef.current && properties.length > 0) {
      slideUp(sliderRef.current);
      
      // Add hover animations to property cards
      const cards = sliderRef.current.querySelectorAll('.property-card');
      cards.forEach(card => cardHoverAnimation(card));
    }
  }, [properties]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % properties.length);
    resetAutoSlide();
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + properties.length) % properties.length);
    resetAutoSlide();
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    resetAutoSlide();
  };

  const resetAutoSlide = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % properties.length);
      }, 20000);
    }
  };

  if (properties.length === 0) {
    return null; // Don't render slider if no properties
  }

  return (
    <section ref={sliderRef} className="section-padding bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-gray-900 mb-4">
            Featured Properties
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of premium properties that offer the perfect blend of luxury and comfort.
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative">
          {/* Main Slider */}
          <div className="overflow-hidden rounded-2xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {properties.map((property) => (
                <div key={property._id} className="w-full flex-shrink-0">
                  <div className="property-card relative h-96 sm:h-[500px] lg:h-[600px] group cursor-pointer">
                    {/* Property Image */}
                    <img
                      src={getImageUrl(property.images?.[0]?.url)}
                      alt={property.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
                      }}
                    />
                    
                    {/* Overlay */}
                    <div className="overlay-gradient" />
                    
                    {/* Content */}
                    <div className="card-content absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-12">
                      {/* Property Type Badge */}
                      <div className="mb-4">
                        <span className="inline-block px-3 py-1 bg-primary-600 text-white text-sm font-medium rounded-full">
                          {property.type}
                        </span>
                        {property.price.priceType === 'rent' && (
                          <span className="inline-block ml-2 px-3 py-1 bg-secondary-500 text-white text-sm font-medium rounded-full">
                            For Rent
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 group-hover:text-primary-200 transition-colors duration-300">
                        {property.title}
                      </h3>

                      {/* Location */}
                      <div className="flex items-center text-gray-200 mb-4">
                        <MapPin className="w-5 h-5 mr-2" />
                        <span className="text-lg">
                          {property.location.city}, {property.location.state}
                        </span>
                      </div>

                      {/* Property Details */}
                      <div className="flex flex-wrap items-center gap-6 text-gray-200 mb-6">
                        {property.specifications.bedrooms > 0 && (
                          <div className="flex items-center">
                            <Bed className="w-5 h-5 mr-2" />
                            <span>{property.specifications.bedrooms} Beds</span>
                          </div>
                        )}
                        {property.specifications.bathrooms > 0 && (
                          <div className="flex items-center">
                            <Bath className="w-5 h-5 mr-2" />
                            <span>{property.specifications.bathrooms} Baths</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Square className="w-5 h-5 mr-2" />
                          <span>{property.specifications.area.value} {property.specifications.area.unit}</span>
                        </div>
                        <div className="flex items-center">
                          <Eye className="w-5 h-5 mr-2" />
                          <span>{property.views} Views</span>
                        </div>
                      </div>

                      {/* Price and CTA */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                            {formatPrice(property.price.amount)}
                            {property.price.priceType === 'rent' && (
                              <span className="text-lg text-gray-300">/{property.price.rentPeriod}</span>
                            )}
                          </div>
                          <div className="text-gray-300">
                            {property.price.priceType === 'sale' ? 'For Sale' : 'For Rent'}
                          </div>
                        </div>
                        
                        <Link
                          to={`/property/${property._id}`}
                          className="btn-primary px-6 py-3 text-lg font-medium transform hover:scale-105 transition-all duration-200"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {properties.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {properties.length > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {properties.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentSlide
                      ? 'bg-primary-600 scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* View All Properties Link */}
        <div className="text-center mt-12">
          <Link
            to="/properties"
            className="btn-outline px-8 py-3 text-lg font-medium"
          >
            View All Properties
          </Link>
        </div>
      </div>
    </section>
  );
};

Slider.propTypes = {
  properties: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
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
      views: PropTypes.number.isRequired,
    })
  ),
};

export default Slider;