import React, { useState, useEffect } from 'react';
import { propertyAPI, formatPrice, getImageUrl } from '../../utils/api';
import toast from 'react-hot-toast';
import AddPropertyForm from './AddPropertyForm';
import BackButton from './BackButton';
import { useAuth } from '../../context/AuthContext';

const ManageProperties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProperties();
  }, [currentPage]);

  const fetchProperties = async () => {
    try {
      console.log('🔄 ManageProperties: fetchProperties called, page:', currentPage);
      setLoading(true);
      const response = await propertyAPI.getAll({
        page: currentPage,
        limit: 10
      });
      
      console.log('📋 ManageProperties: API response:', response.data);
      
      if (response.data.success) {
        const propertiesData = response.data.data.properties || [];
        console.log('🏠 ManageProperties: Setting properties:', propertiesData.length, 'items');
        setProperties(propertiesData);
        setTotalPages(response.data.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('❌ ManageProperties: Error fetching properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    // Check permission before proceeding
    if (!user?.permissions?.deleteProperty) {
      toast.error('You do not have permission to delete properties');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      const response = await propertyAPI.delete(propertyId);
      if (response.data.success) {
        toast.success('Property deleted successfully');
        fetchProperties();
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    }
  };

  const handlePropertyCreated = async () => {
    console.log('✅ ManageProperties: handlePropertyCreated called');
    setShowAddForm(false);
    
    // Add a small delay to ensure localStorage is updated
    console.log('⏳ ManageProperties: Waiting 500ms for storage update...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Reset to page 1 to show newly created property (they're added to beginning)
    if (currentPage !== 1) {
      console.log('📄 ManageProperties: Changing to page 1 (will trigger useEffect)...');
      setCurrentPage(1);
    } else {
      console.log('🔄 ManageProperties: Already on page 1, manually triggering fetchProperties...');
      fetchProperties();
    }
  };

  if (showAddForm) {
    // Check permission before showing form
    if (!user?.permissions?.addProperty) {
      toast.error('You do not have permission to add properties');
      setShowAddForm(false);
      return null;
    }
    
    return (
      <AddPropertyForm
        onSuccess={handlePropertyCreated}
        onCancel={() => setShowAddForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <BackButton />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Properties</h1>
          <p className="text-gray-600">Add, edit, and manage property listings</p>
        </div>
        {user?.permissions?.addProperty && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Add New Property
          </button>
        )}
      </div>

      {/* Properties List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏠</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
            <p className="text-gray-600 mb-4">Start by adding your first property listing.</p>
            {user?.permissions?.addProperty && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Add Property
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties.map((property) => (
                  <tr key={property._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16">
                          <img
                            src={getImageUrl(property.images?.[0]?.url)}
                            alt={property.title}
                            className="h-16 w-16 rounded-lg object-cover"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80';
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {property.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {property.specifications?.bedrooms || property.features?.bedrooms}BR • {property.specifications?.area?.value || property.features?.area} {property.specifications?.area?.unit || property.features?.areaUnit}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{property.location?.area}</div>
                      <div className="text-sm text-gray-500">{property.location?.city}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(property.price?.amount)}
                      </div>
                      <div className="text-sm text-gray-500">
                        For {property.price?.priceType === 'sale' ? 'Sale' : 'Rent'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {property.type || property.propertyType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          property.status === 'available' ? 'bg-green-100 text-green-800' :
                          property.status === 'sold' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {property.status}
                        </span>
                        {property.isFeatured && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <a
                          href={`/property/${property._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900 px-2 py-1 text-xs bg-blue-50 rounded"
                        >
                          View
                        </a>
                        {user?.permissions?.deleteProperty && (
                          <button
                            onClick={() => handleDeleteProperty(property._id)}
                            className="text-red-600 hover:text-red-900 px-2 py-1 text-xs bg-red-50 rounded"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProperties;