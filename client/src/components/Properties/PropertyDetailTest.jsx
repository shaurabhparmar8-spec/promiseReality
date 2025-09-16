import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PropertyDetailTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Property Detail Test Page
          </h1>
          <p className="text-gray-600 mb-4">
            This is a test page to verify routing is working.
          </p>
          <p className="text-lg font-medium text-blue-600 mb-6">
            Property ID: {id}
          </p>
          <button
            onClick={() => navigate('/properties')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Properties
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailTest;