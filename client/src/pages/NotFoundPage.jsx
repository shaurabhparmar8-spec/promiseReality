import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, Building } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            <div className="text-9xl font-bold text-primary-200 select-none">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Building className="w-16 h-16 text-primary-400" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Sorry, we couldn't find the page you're looking for. 
            The property you're searching for might have been moved or doesn't exist.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <Link
            to="/"
            className="btn-primary px-6 py-3 inline-flex items-center space-x-2 w-full sm:w-auto justify-center"
          >
            <Home className="w-5 h-5" />
            <span>Go Home</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="btn-outline px-6 py-3 inline-flex items-center space-x-2 w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Search Suggestion */}
        <div className="mt-12 p-6 bg-white rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Looking for something specific?
          </h3>
          <div className="flex">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search properties..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <Link
              to="/properties"
              className="btn-primary px-6 py-3 rounded-l-none"
            >
              Search
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8">
          <p className="text-sm text-gray-500 mb-4">Or try these popular pages:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/properties"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              All Properties
            </Link>
            <Link
              to="/about"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Contact
            </Link>
            <Link
              to="/blog"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;