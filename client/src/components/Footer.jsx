import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Youtube,
  Clock,
  ArrowRight,
  Heart
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Properties', path: '/properties' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Blog', path: '/blog' },
    { name: 'Reviews', path: '/reviews' }
  ];

  const propertyTypes = [
    { name: 'Villas', path: '/properties?type=Villa' },
    { name: 'Apartments', path: '/properties?type=Apartment' },
    { name: 'Duplexes', path: '/properties?type=Duplex' },
    { name: 'Plots', path: '/properties?type=Plot' },
    { name: 'Commercial', path: '/properties?type=Commercial' },
    { name: 'Houses', path: '/properties?type=House' }
  ];

  const services = [
    { name: 'Property Buying', path: '/services/buying' },
    { name: 'Property Selling', path: '/services/selling' },
    { name: 'Legal Consultation', path: '/services/legal' },
    { name: 'Property Valuation', path: '/services/valuation' },
    { name: 'Investment Advisory', path: '/services/investment' },
    { name: 'Property Management', path: '/services/management' }
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: 'https://www.facebook.com/share/19rQ5YzLuu/?mibextid=wwXIfr', color: 'hover:text-blue-600' },
    { name: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/anjana.solanki.925?igsh=MTVtZDJtcTI4eGJzNg==', color: 'hover:text-pink-600' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 py-12">
        <div className="container-custom">
          <div className="text-center">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Stay Updated with Latest Properties
            </h3>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Subscribe to our newsletter and be the first to know about new properties, 
              market insights, and exclusive deals.
            </p>
            <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 sm:gap-0">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg sm:rounded-l-lg sm:rounded-r-none text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="bg-white text-primary-600 hover:bg-gray-100 px-6 py-3 rounded-lg sm:rounded-l-none sm:rounded-r-lg font-medium transition-colors duration-200 flex items-center justify-center">
                <span>Subscribe</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-16">
        <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold font-heading">Promise Realty</span>
              </div>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                Your trusted partner in finding the perfect property. With over 15 years of experience 
                and 5000+ satisfied clients, we make your property dreams come true.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <span className="text-gray-300">
                    Om Residency, Gotri, Vadodara, Gujarat
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <span className="text-gray-300">9558270610 / 9537635111</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <span className="text-gray-300">info@promiserealty.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <span className="text-gray-300">Mon - Sat: 9:00 AM - 7:00 PM</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-300 hover:text-primary-400 transition-colors duration-200 flex items-center group"
                    >
                      <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Property Types */}
            <div>
              <h4 className="text-lg font-bold mb-6">Property Types</h4>
              <ul className="space-y-3">
                {propertyTypes.map((type) => (
                  <li key={type.name}>
                    <Link
                      to={type.path}
                      className="text-gray-300 hover:text-primary-400 transition-colors duration-200 flex items-center group"
                    >
                      <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      <span>{type.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-bold mb-6">Our Services</h4>
              <ul className="space-y-3">
                {services.map((service) => (
                  <li key={service.name}>
                    <Link
                      to={service.path}
                      className="text-gray-300 hover:text-primary-400 transition-colors duration-200 flex items-center group"
                    >
                      <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      <span>{service.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Social Links & Stats */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              {/* Social Links */}
              <div className="mb-6 lg:mb-0">
                <h4 className="text-lg font-bold mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-all duration-200 ${social.color} hover:scale-110`}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 text-center">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-primary-400">5000+</div>
                  <div className="text-xs sm:text-sm text-gray-400">Happy Clients</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-primary-400">1000+</div>
                  <div className="text-xs sm:text-sm text-gray-400">Properties Sold</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-primary-400">15+</div>
                  <div className="text-xs sm:text-sm text-gray-400">Years Experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-800 py-6">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between text-center md:text-left">
            <div className="text-gray-400 mb-4 md:mb-0">
              <p>
                © {currentYear} Promise Realty. All rights reserved. | 
                <Link to="/privacy" className="hover:text-primary-400 ml-1">Privacy Policy</Link> | 
                <Link to="/terms" className="hover:text-primary-400 ml-1">Terms of Service</Link>
              </p>
            </div>
            <div className="flex items-center justify-center md:justify-end text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 mx-1 fill-current" />
              <span>by Promise Realty Team</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;