import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { propertyAPI, contactAPI, formatPrice, authAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Heart, MapPin, Phone, Mail, Calendar, Clock, User, X, Check, Bed, Bath, Square, Car, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [property, setProperty] = useState(null);
  const [relatedProperties, setRelatedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    message: ''
  });
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProperty();
      fetchRelatedProperties();
      checkIfLiked();
    } else {
      setLoading(false);
    }
  }, [id]);

  const checkIfLiked = async () => {
    if (!isAuthenticated()) return;
    
    try {
      const response = await authAPI.getLikedProperties();
      if (response.data.success) {
        const likedPropertyIds = response.data.data.likedProperties.map(p => p._id);
        setIsLiked(likedPropertyIds.includes(id));
      }
    } catch (error) {
      console.error('Error checking if property is liked:', error);
    }
  };

  const fetchProperty = async () => {
    try {
      setLoading(true);
      console.log('Fetching property with ID:', id);
      const response = await propertyAPI.getById(id);
      console.log('Property API response:', response.data);
      
      if (response.data.success && response.data.data) {
        // Handle different response structures
        const propertyData = response.data.data.property || response.data.data;
        console.log('Property data:', propertyData);
        setProperty(propertyData);
      } else {
        console.error('Property not found in response:', response.data);
        toast.error('Property not found');
        navigate('/properties');
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error('Failed to load property details');
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProperties = async () => {
    try {
      const response = await propertyAPI.getAll({ limit: 3 });
      if (response.data.success && response.data.data) {
        setRelatedProperties(response.data.data.properties.filter(p => p._id !== id).slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to fetch related properties', error);
    }
  };

  const handleScheduleVisit = () => {
    if (!isAuthenticated()) {
      toast.error('Please login to schedule a visit');
      navigate('/login');
      return;
    }
    setShowScheduleForm(true);
  };

  const handleCallAgent = () => {
    window.open('tel:+919558270610', '_self');
  };

  const handleScheduleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingSchedule(true);

    try {
      // Add to visit list using the proper API
      const visitNotes = `Preferred Date: ${scheduleForm.preferredDate}\nPreferred Time: ${scheduleForm.preferredTime}\nMessage: ${scheduleForm.message}`;
      
      const response = await authAPI.addToVisitList(id, visitNotes);
      
      if (response.data.success) {
        toast.success('Visit scheduled successfully! You can view it in your dashboard.');
        setShowScheduleForm(false);
        setScheduleForm({
          name: '',
          email: '',
          phone: '',
          preferredDate: '',
          preferredTime: '',
          message: ''
        });
      } else {
        toast.error(response.data.message || 'Failed to schedule visit. Please try again.');
      }
    } catch (error) {
      console.error('Schedule visit error:', error);
      toast.error(error.response?.data?.message || 'Failed to schedule visit. Please try again.');
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  const handleScheduleFormChange = (e) => {
    const { name, value } = e.target;
    setScheduleForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLikeToggle = async () => {
    if (!isAuthenticated()) {
      toast.error('Please login to like properties');
      navigate('/login');
      return;
    }

    setLikeLoading(true);
    try {
      const response = await authAPI.toggleLike(id);
      if (response.data.success) {
        setIsLiked(response.data.data.isLiked);
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to update like status');
      console.error('Error toggling like:', error);
    } finally {
      setLikeLoading(false);
    }
  };

  const nextImage = () => {
    if (property.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
          <button
            onClick={() => navigate('/properties')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative h-screen">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={property.images?.[currentImageIndex]?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&h=1080&fit=crop'}
            alt={property.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&h=1080&fit=crop';
            }}
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Navigation Controls */}
        {property.images && property.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute top-1/2 left-8 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-4 text-white hover:bg-white/30 transition-all duration-200 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute top-1/2 right-8 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-4 text-white hover:bg-white/30 transition-all duration-200 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full p-8 lg:p-12">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                {/* Property Info */}
                <div className="text-white">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      {property.type || 'Property'}
                    </span>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      property.price?.priceType === 'sale' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-orange-500 text-white'
                    }`}>
                      For {property.price?.priceType === 'sale' ? 'Sale' : 'Rent'}
                    </span>
                  </div>
                  
                  <h1 className="text-4xl lg:text-6xl font-bold mb-4 leading-tight">
                    {property.title || 'Property Details'}
                  </h1>
                  
                  <div className="flex items-center text-xl mb-6">
                    <MapPin size={24} className="mr-3" />
                    <span>{property.location?.address || 'Address'}, {property.location?.city || 'City'}</span>
                  </div>

                  <div className="text-3xl lg:text-4xl font-bold text-primary-400">
                    {property.price?.amount ? formatPrice(property.price.amount) : 'Price on Request'}
                    {property.price?.priceType === 'rent' && <span className="text-lg text-gray-300">/month</span>}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleLikeToggle}
                    disabled={likeLoading}
                    className="bg-white/20 backdrop-blur-sm text-white px-6 py-4 rounded-2xl font-semibold hover:bg-white/30 transition-all duration-200 flex items-center justify-center gap-3"
                  >
                    <Heart
                      size={24}
                      className={`${isLiked ? 'text-red-400 fill-red-400' : 'text-white'} transition-colors duration-200`}
                    />
                    {isLiked ? 'Liked' : 'Like'}
                  </button>
                  
                  <button
                    onClick={handleScheduleVisit}
                    className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-primary-700 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg"
                  >
                    <Calendar size={24} />
                    Schedule Visit
                  </button>
                  
                  <button
                    onClick={handleCallAgent}
                    className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg"
                  >
                    <Phone size={24} />
                    Call Agent
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Indicators */}
        {property.images && property.images.length > 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {property.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Property Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-3xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Square className="w-8 h-8 text-primary-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{property.specifications?.area?.value || 'N/A'}</div>
            <div className="text-gray-600 font-medium">{property.specifications?.area?.unit || 'sqft'}</div>
          </div>
          
          <div className="bg-white rounded-3xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bed className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{property.specifications?.bedrooms || 'N/A'}</div>
            <div className="text-gray-600 font-medium">Bedrooms</div>
          </div>
          
          <div className="bg-white rounded-3xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bath className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{property.specifications?.bathrooms || 'N/A'}</div>
            <div className="text-gray-600 font-medium">Bathrooms</div>
          </div>
          
          <div className="bg-white rounded-3xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Car className="w-8 h-8 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{property.specifications?.parking || 'N/A'}</div>
            <div className="text-gray-600 font-medium">Parking</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Description and Features */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Property Description</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                {property.description || "This premium property offers modern amenities, excellent connectivity, and a luxurious lifestyle. Perfect for families looking for comfort and convenience in a prime location."}
              </p>
            </div>

            {/* Property Features */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Property Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(property.features && property.features.length > 0 ? property.features : [
                  'Modular Kitchen',
                  'Covered Parking', 
                  '24x7 Security',
                  'Power Backup',
                  'Garden Facing',
                  'Elevator Access'
                ]).map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-gray-800 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Amenities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(property.amenities && property.amenities.length > 0 ? property.amenities : [
                  'Swimming Pool',
                  'Gymnasium',
                  'Clubhouse',
                  'Children\'s Play Area',
                  'Landscaped Gardens',
                  'Jogging Track'
                ]).map((amenity, idx) => (
                  <div key={idx} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-gray-800 font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Agent and Map */}
          <div className="space-y-8">
            {/* Agent Info */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Agent</h3>
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                  alt="Anjana Solanki"
                  className="w-20 h-20 rounded-2xl object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face';
                  }}
                />
                <div>
                  <h4 className="font-bold text-xl text-gray-900">Anjana Solanki</h4>
                  <p className="text-gray-600 mb-2">Property Consultant</p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone size={16} />
                      <span className="text-sm">+91 9558270610</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleCallAgent}
                  className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Phone size={18} />
                  Call
                </button>
                <button
                  onClick={() => setShowContactForm(true)}
                  className="flex-1 bg-gray-100 text-gray-900 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Mail size={18} />
                  Message
                </button>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Location</h3>
              <div className="h-64 w-full rounded-2xl overflow-hidden">
                <iframe
                  title="Property Location"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(property.location.address + ', ' + property.location.city)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allowFullScreen=""
                  aria-hidden="false"
                  tabIndex="0"
                  className="rounded-2xl"
                />
              </div>
              <div className="mt-4 flex items-center text-gray-600">
                <MapPin size={20} className="mr-2" />
                <span>{property.location.address}, {property.location.city}</span>
              </div>
            </div>

            {/* Property Views */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Property Views</h4>
                  <p className="text-gray-600">Total interested users</p>
                </div>
                <div className="flex items-center space-x-2 text-primary-600">
                  <Eye size={24} />
                  <span className="text-2xl font-bold">{property.views || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Properties */}
        <div className="mt-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Similar Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedProperties.map((relProp) => (
              <div 
                key={relProp._id} 
                className="bg-white rounded-3xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300" 
                onClick={() => navigate(`/property/${relProp._id}`)}
              >
                <div className="relative">
                  <img
                    src={relProp.images?.[0]?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop'}
                    alt={relProp.title}
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {relProp.type}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1">{relProp.title}</h3>
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin size={16} className="mr-1" />
                    <span className="text-sm">{relProp.location.city}</span>
                  </div>
                  <p className="text-primary-600 text-2xl font-bold">{formatPrice(relProp.price.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Visit Modal */}
      <AnimatePresence>
        {showScheduleForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowScheduleForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Schedule Visit</h3>
                <button
                  onClick={() => setShowScheduleForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleScheduleFormSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={scheduleForm.name}
                    onChange={handleScheduleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={scheduleForm.email}
                    onChange={handleScheduleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={scheduleForm.phone}
                    onChange={handleScheduleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      name="preferredDate"
                      value={scheduleForm.preferredDate}
                      onChange={handleScheduleFormChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Preferred Time *
                    </label>
                    <select
                      name="preferredTime"
                      value={scheduleForm.preferredTime}
                      onChange={handleScheduleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Time</option>
                      <option value="09:00">09:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="15:00">03:00 PM</option>
                      <option value="16:00">04:00 PM</option>
                      <option value="17:00">05:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    name="message"
                    value={scheduleForm.message}
                    onChange={handleScheduleFormChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="Any specific requirements or questions..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingSchedule}
                  className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isSubmittingSchedule ? 'Scheduling...' : 'Schedule Visit'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyDetailPage;
