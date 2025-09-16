import React, { useState, useEffect } from 'react';
import { authAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { formatDate, getImageUrl } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const ManageVisits = () => {
  const { user } = useAuth();
  const [visitRequests, setVisitRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVisitRequests();
  }, [currentPage, selectedStatus]);

  const fetchVisitRequests = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10
      };

      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await authAPI.getAllVisitRequests(params);
      
      if (response.data.success) {
        setVisitRequests(response.data.data.visitRequests);
        setTotalPages(response.data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching visit requests:', error);
      toast.error('Failed to load visit requests');
    } finally {
      setLoading(false);
    }
  };

  const updateVisitStatus = async (userId, propertyId, status, notes = '') => {
    try {
      const response = await authAPI.updateVisitStatus(userId, propertyId, status, notes);

      if (response.data.success) {
        toast.success('Visit status updated successfully');
        
        // Update local state immediately (works for both demo and real mode)
        setVisitRequests(prev => prev.map(request => 
          (request.user._id === userId && request.property._id === propertyId)
            ? { ...request, status, notes }
            : request
        ));
      }
    } catch (error) {
      console.error('Error updating visit status:', error);
      toast.error('Failed to update visit status');
    }
  };

  const deleteVisitRequest = async (userId, propertyId, userName, propertyTitle) => {
    if (window.confirm(`Are you sure you want to delete the visit request from ${userName} for "${propertyTitle}"? This action cannot be undone.`)) {
      try {
        const response = await authAPI.deleteVisitRequest(userId, propertyId);

        if (response.data.success) {
          toast.success('Visit request deleted successfully');
          
          // Update local state immediately - remove the deleted item
          setVisitRequests(prev => prev.filter(request => 
            !(request.user._id === userId && request.property._id === propertyId)
          ));
        }
      } catch (error) {
        console.error('Error deleting visit request:', error);
        toast.error('Failed to delete visit request');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'contacted':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchVisitRequests();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visit Requests</h1>
          <p className="text-gray-600">Manage property visit requests from users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by user name or property..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </form>

          {/* Status Filter */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visit Requests List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {visitRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Visit Requests</h3>
            <p className="text-gray-600">No visit requests found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User & Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request Date
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
                {visitRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <img
                            src={getImageUrl(request.property?.images?.[0]?.url)}
                            alt={request.property?.title}
                            className="w-12 h-12 rounded-lg object-cover"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80';
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {request.user?.name}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {request.property?.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {request.property?.location?.area}, {request.property?.location?.city}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <p>{request.user?.phone}</p>
                        {request.user?.email && (
                          <p className="text-gray-600">{request.user.email}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(request.requestedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {user?.permissions?.viewInquiries && (
                          <>
                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateVisitStatus(request.user._id, request.property._id, 'contacted')}
                                  className="text-blue-600 hover:text-blue-900 px-2 py-1 text-xs bg-blue-50 rounded"
                                >
                                  Mark Contacted
                                </button>
                                <button
                                  onClick={() => updateVisitStatus(request.user._id, request.property._id, 'completed')}
                                  className="text-green-600 hover:text-green-900 px-2 py-1 text-xs bg-green-50 rounded"
                                >
                                  Complete
                                </button>
                              </>
                            )}
                            {request.status === 'contacted' && (
                              <button
                                onClick={() => updateVisitStatus(request.user._id, request.property._id, 'completed')}
                                className="text-green-600 hover:text-green-900 px-2 py-1 text-xs bg-green-50 rounded"
                              >
                                Mark Completed
                              </button>
                            )}
                            {request.status !== 'cancelled' && request.status !== 'completed' && (
                              <button
                                onClick={() => updateVisitStatus(request.user._id, request.property._id, 'cancelled')}
                                className="text-red-600 hover:text-red-900 px-2 py-1 text-xs bg-red-50 rounded"
                              >
                                Cancel
                              </button>
                            )}
                            {/* Delete button - available for all statuses */}
                            <button
                              onClick={() => deleteVisitRequest(
                                request.user._id, 
                                request.property._id, 
                                request.user.name, 
                                request.property.title
                              )}
                              className="text-red-700 hover:text-red-900 px-2 py-1 text-xs bg-red-100 hover:bg-red-200 rounded border border-red-300 transition-colors duration-200"
                              title="Delete visit request permanently"
                            >
                              Delete
                            </button>
                          </>
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

export default ManageVisits;