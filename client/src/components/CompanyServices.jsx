import React, { useEffect, useRef } from 'react';
import { Home, DollarSign, FileText, Scale, Users, Shield, Phone, MapPin } from 'lucide-react';
import { staggerAnimation } from '../styles/animations';

const CompanyServices = () => {
  const sectionRef = useRef(null);

  const services = [
    {
      icon: Home,
      title: 'Property Buying',
      description: 'Find your dream home with our extensive property listings and expert guidance throughout the buying process.',
      features: ['Property Search', 'Market Analysis', 'Negotiation Support', 'Documentation Help']
    },
    {
      icon: DollarSign,
      title: 'Property Selling',
      description: 'Get the best value for your property with our professional marketing and sales expertise.',
      features: ['Property Valuation', 'Marketing Strategy', 'Buyer Screening', 'Quick Sales']
    },
    {
      icon: FileText,
      title: 'Legal Consultation',
      description: 'Navigate property laws and regulations with confidence through our legal advisory services.',
      features: ['Document Verification', 'Legal Compliance', 'Contract Review', 'Title Clearance']
    },
    {
      icon: Scale,
      title: 'Property Valuation',
      description: 'Get accurate property valuations based on current market trends and comprehensive analysis.',
      features: ['Market Research', 'Comparative Analysis', 'Investment Advice', 'Valuation Reports']
    },
    {
      icon: Users,
      title: 'Investment Advisory',
      description: 'Make informed investment decisions with our expert analysis and market insights.',
      features: ['ROI Analysis', 'Market Trends', 'Portfolio Planning', 'Risk Assessment']
    },
    {
      icon: Shield,
      title: 'Property Management',
      description: 'Comprehensive property management services to maximize your investment returns.',
      features: ['Tenant Management', 'Maintenance Services', 'Rent Collection', 'Property Care']
    },
    {
      icon: Phone,
      title: '24/7 Support',
      description: 'Round-the-clock customer support to assist you with all your property-related queries.',
      features: ['Instant Response', 'Expert Guidance', 'Emergency Support', 'Multi-channel Support']
    },
    {
      icon: MapPin,
      title: 'Location Analysis',
      description: 'Detailed location analysis to help you choose the perfect neighborhood for your needs.',
      features: ['Neighborhood Insights', 'Amenity Mapping', 'Growth Potential', 'Connectivity Analysis']
    }
  ];

  useEffect(() => {
    if (sectionRef.current) {
      const cards = sectionRef.current.querySelectorAll('.service-card');
      staggerAnimation(cards, { stagger: 0.1 });
    }
  }, []);

  return (
    <section ref={sectionRef} className="section-padding bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-gray-900 mb-6">
            Our Services
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From buying and selling to legal consultation and property management, 
            we provide comprehensive real estate services to meet all your property needs.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="service-card group bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 hover:-translate-y-2"
              >
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-200">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-500">
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Hover Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 sm:p-12 text-white">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Contact our expert team today and let us help you find the perfect property solution 
              tailored to your needs and budget.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors duration-200">
                Get Free Consultation
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-medium transition-all duration-200">
                Call Now: +91 98765 43210
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { number: '5000+', label: 'Happy Clients' },
            { number: '1000+', label: 'Properties Sold' },
            { number: '50+', label: 'Cities Covered' },
            { number: '15+', label: 'Years Experience' }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary-600 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompanyServices;