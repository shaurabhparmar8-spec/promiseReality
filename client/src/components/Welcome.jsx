import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Search, MapPin, Home } from 'lucide-react';

const Welcome = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const navigate = useNavigate();

  const scrollToNext = () => {
    const nextSection = document.querySelector('#featured-properties');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Build search parameters
    const searchParams = new URLSearchParams();
    
    if (searchQuery.trim()) {
      searchParams.set('search', searchQuery.trim());
    }
    
    if (selectedCity && selectedCity !== 'All Cities') {
      searchParams.set('city', selectedCity);
    }
    
    // Navigate to properties page with search parameters
    const queryString = searchParams.toString();
    navigate(`/properties${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-primary-800/80 to-secondary-900/90 z-10" />
        <img
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1973&q=80"
          alt="Promise Realty"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-20 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Main Title */}
        <div className="mb-6">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold font-heading text-white leading-tight mb-4">
            Welcome to Promise Realty
          </h1>
          <span className="block text-2xl sm:text-3xl lg:text-4xl font-semibold text-secondary-300">
            Your Trusted Real Estate Partner
          </span>
        </div>

        {/* Subtitle */}
        <div className="mb-8 max-w-3xl mx-auto">
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 leading-relaxed">
            Discover premium villas, apartments, duplexes, and plots with Promise Realty. 
            Trusted by 5000+ clients for finding their perfect home.
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-white mb-2">5000+</div>
            <div className="text-gray-300">Happy Clients</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-white mb-2">1000+</div>
            <div className="text-gray-300">Properties Sold</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-white mb-2">50+</div>
            <div className="text-gray-300">Locations</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by location, property type..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select 
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">All Cities</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Pune">Pune</option>
                  <option value="Vadodara">Vadodara</option>
                  <option value="Ahmedabad">Ahmedabad</option>
                </select>
              </div>
              <button type="submit" className="btn-primary px-8 py-3 flex items-center justify-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>
            </form>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <button 
            onClick={scrollToNext}
            className="btn-primary px-8 py-4 text-lg flex items-center space-x-2 group"
          >
            <Home className="w-5 h-5" />
            <span>Explore Properties</span>
          </button>
          <button className="btn-outline px-8 py-4 text-lg text-white border-white hover:bg-white hover:text-primary-600">
            Contact Agent
          </button>
        </div>

        {/* Scroll Indicator */}
        <div 
          className="cursor-pointer"
          onClick={scrollToNext}
        >
          <div className="flex flex-col items-center text-white/80 hover:text-white transition-colors duration-200">
            <span className="text-sm mb-2">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce" />
            </div>
            <ChevronDown className="w-6 h-6 mt-2 animate-bounce" />
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent z-15" />
    </section>
  );
};

export default Welcome;