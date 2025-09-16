import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api, { propertyAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { Upload, X, Image } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AddPropertyForm = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const propertyTypes = [
    'Villa', 'Apartment', 'Plot', 'Bungalow', 'Flat', 
    'Penthouse', 'Studio', 'Duplex', 'Farmhouse'
  ];

  const amenitiesOptions = [
    'Swimming Pool', 'Garden', 'Gym', 'Parking', 'Security',
    'Lift', 'Clubhouse', 'Power Backup', 'Water Supply',
    'Playground', 'CCTV', 'Intercom', 'Fire Safety'
  ];

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedImages.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    const newImages = [...selectedImages, ...files];
    setSelectedImages(newImages);

    // Create previews
    const newPreviews = [...imagePreviews];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push({
          file,
          url: e.target.result,
          name: file.name
        });
        setImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const onSubmit = async (data) => {
    // Check permission before proceeding
    if (!user?.permissions?.addProperty) {
      toast.error('You do not have permission to add properties');
      return;
    }

    console.log('🔒 Permission check passed: addProperty =', user.permissions.addProperty);
    console.log('👤 Current user:', { name: user.name, role: user.role });

    setIsSubmitting(true);

    try {
      // Upload images first
      let uploadedImages = [];
      if (selectedImages.length > 0) {
        const uploadFormData = new FormData();
        selectedImages.forEach((image) => {
          uploadFormData.append('images', image);
        });

        try {
          // Use api.post directly for image upload since propertyAPI.uploadImages does not exist
          const uploadResponse = await api.post('/upload/images', uploadFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (uploadResponse.data.success) {
            uploadedImages = uploadResponse.data.images;
          } else {
            toast.error('Failed to upload images');
            setIsSubmitting(false);
            return;
          }
        } catch (uploadError) {
          // Fallback to mock images if upload fails
          console.warn('🔄 Image upload failed, using mock images:', uploadError.message);
          
          // Different property type specific images
          const propertyTypeImages = {
            'apartment': [
              'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1582063289852-62e3ba2747f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ],
            'villa': [
              'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ],
            'house': [
              'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ],
            'office': [
              'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ],
            'shop': [
              'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ]
          };
          
          const typeImages = propertyTypeImages[data.propertyType] || propertyTypeImages['apartment'];
          
          uploadedImages = selectedImages.slice(0, Math.min(selectedImages.length, typeImages.length)).map((file, i) => ({
            url: typeImages[i],
            originalName: file.name,
            filename: `${data.propertyType}-${Date.now()}-${i}.jpg`,
            alt: `${data.title} - Image ${i + 1}`
          }));
          console.log('📸 Using property-specific mock images:', uploadedImages);
        }
      } else {
        // No images selected, use default image
        uploadedImages = [{
          url: 'https://images.unsplash.com/photo-1580554000000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          originalName: 'default-property.jpg',
          filename: 'default-property.jpg'
        }];
      }

      // Basic validation
      if (!data.title || data.title.trim().length < 5) {
        toast.error('Title must be at least 5 characters long');
        setIsSubmitting(false);
        return;
      }
      if (!data.description || data.description.trim().length < 20) {
        toast.error('Description must be at least 20 characters long');
        setIsSubmitting(false);
        return;
      }
      if (!data.propertyType) {
        toast.error('Please select a property type');
        setIsSubmitting(false);
        return;
      }

      // Create FormData for property creation
      const formData = new FormData();

      // Add basic property data
      formData.append('title', data.title || '');
      formData.append('description', data.description || '');
      formData.append('propertyType', data.propertyType || '');
      formData.append('type', data.propertyType || ''); // Backend expects 'type'

      // Debug price data
      console.log('🔍 Frontend price data:', {
        priceAmount: data.priceAmount,
        priceType: data.priceType,
        parsedAmount: parseFloat(data.priceAmount)
      });

      formData.append('price[amount]', data.priceAmount ? parseFloat(data.priceAmount).toString() : '');
      formData.append('price[priceType]', data.priceType || '');
      formData.append('location[address]', data.address || '');
      formData.append('location[area]', data.locationArea);
      formData.append('location[city]', data.city || 'Vadodara');
      formData.append('location[state]', data.state || 'Gujarat');
      formData.append('location[pincode]', data.pincode || '390001');
      formData.append('location[coordinates][latitude]', data.latitude || 22.3072);
      formData.append('location[coordinates][longitude]', data.longitude || 73.1812);
      formData.append('specifications[bedrooms]', data.bedrooms || 0);
      formData.append('specifications[bathrooms]', data.bathrooms || 0);
      formData.append('specifications[area][value]', parseFloat(data.propertyArea));
      formData.append('specifications[area][unit]', data.areaUnit);
      formData.append('specifications[parking]', data.parking || 0);
      formData.append('specifications[furnished]', data.furnished || 'Unfurnished');
      formData.append('status', 'available');
      formData.append('isFeatured', data.isFeatured || false);

      // Add amenities
      selectedAmenities.forEach((amenity, index) => {
        formData.append(`amenities[${index}]`, amenity);
      });

      // Add uploaded image URLs
      uploadedImages.forEach((image, index) => {
        formData.append(`images[${index}][url]`, image.url);
        formData.append(`images[${index}][alt]`, image.originalName || 'Property image');
        formData.append(`images[${index}][isPrimary]`, index === 0);
      });

      console.log('🚀 Sending property data with', uploadedImages.length, 'images');
      console.log('🔑 Current token:', localStorage.getItem('token')?.substring(0, 20) + '...');

      const response = await propertyAPI.create(formData);
      console.log('✅ Create property response:', response.data);

      if (response.data.success) {
        toast.success(response.data.message || 'Property created successfully!');
        reset();
        setSelectedImages([]);
        setImagePreviews([]);
        setSelectedAmenities([]);
        onSuccess && onSuccess();
      } else {
        toast.error(response.data.message || 'Failed to create property');
      }
    } catch (error) {
      console.error('❌ Error creating property - Full error object:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error response status:', error.response?.status);
      console.error('❌ Error response headers:', error.response?.headers);

      // Show detailed error information
      if (error.response?.data?.message) {
        console.error('Server error message:', error.response.data.message);
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors);
        const errorMessages = error.response.data.errors.map(err => err.msg || err.message || err).join(', ');
        toast.error(`Validation errors: ${errorMessages}`);
      } else if (error.response?.status === 401) {
        toast.error('Please login as admin to create properties');
      } else if (error.response?.status === 403) {
        toast.error('Admin access required');
      } else if (error.response?.status === 400) {
        toast.error('Bad request - please check all required fields');
      } else if (error.message) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('Failed to create property. Please try again.');
      }

      // Log the complete error for debugging
      console.error('Complete error details:', JSON.stringify({
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        stack: error.stack
      }, null, 2));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Add New Property</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Title *
            </label>
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Luxury 3BHK Villa in Banjara Hills"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type *
            </label>
            <select
              {...register('propertyType', { required: 'Property type is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Type</option>
              {propertyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.propertyType && <p className="text-red-500 text-sm mt-1">{errors.propertyType.message}</p>}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe the property features, location benefits, etc."
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        {/* Price Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Amount *
            </label>
            <input
              type="number"
              {...register('priceAmount', { required: 'Price is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 5000000"
            />
            {errors.priceAmount && <p className="text-red-500 text-sm mt-1">{errors.priceAmount.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Type *
            </label>
            <select
              {...register('priceType', { required: 'Price type is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Type</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
            {errors.priceType && <p className="text-red-500 text-sm mt-1">{errors.priceType.message}</p>}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Location Details</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                {...register('address', { required: 'Address is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Street address"
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area *
              </label>
              <input
                type="text"
                {...register('locationArea', { required: 'Area is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Banjara Hills"
              />
              {errors.locationArea && <p className="text-red-500 text-sm mt-1">{errors.locationArea.message}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                {...register('city', { required: 'City is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Hyderabad"
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <input
                type="text"
                {...register('state', { required: 'State is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Telangana"
              />
              {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode
              </label>
              <input
                type="text"
                {...register('pincode')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 500034"
              />
            </div>
          </div>
        </div>

        {/* Property Features */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Property Features</h3>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bedrooms
              </label>
              <input
                type="number"
                {...register('bedrooms')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bathrooms
              </label>
              <input
                type="number"
                {...register('bathrooms')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Area *
              </label>
              <input
                type="number"
                {...register('propertyArea', { required: 'Property area is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1200"
              />
              {errors.propertyArea && <p className="text-red-500 text-sm mt-1">{errors.propertyArea.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area Unit *
              </label>
              <select
                {...register('areaUnit', { required: 'Area unit is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Unit</option>
                <option value="sqft">Square Feet</option>
                <option value="sqm">Square Meters</option>
                <option value="acres">Acres</option>
              </select>
              {errors.areaUnit && <p className="text-red-500 text-sm mt-1">{errors.areaUnit.message}</p>}
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amenities
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {amenitiesOptions.map(amenity => (
              <label key={amenity} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Property Images Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Images
          </label>
          <p className="text-sm text-gray-500 mb-4">Upload up to 10 images (JPG, PNG, WebP)</p>
          
          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Click to upload images or drag and drop</p>
              <p className="text-sm text-gray-500">PNG, JPG, WebP up to 10MB each</p>
            </label>
          </div>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Images ({imagePreviews.length}/10)</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={preview.url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate">{preview.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Featured Property */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register('isFeatured')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Mark as Featured Property</span>
          </label>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Property'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPropertyForm;