import React, { useEffect } from 'react';
import { fadeIn, slideFromLeft, slideFromRight, staggerAnimation, textReveal, counterAnimation } from '../../styles/animations';

const AboutPage = () => {
  useEffect(() => {
    // Initialize animations after component mounts
    setTimeout(() => {
      // Hero section animations
      textReveal('.hero-title');
      fadeIn('.hero-subtitle', { delay: 0.3 });
      
      // Company intro animations
      slideFromLeft('.company-intro-text');
      slideFromRight('.company-intro-image');
      
      // Mission vision animations
      staggerAnimation(document.querySelectorAll('.mission-vision-card'));
      
      // Team animations
      staggerAnimation(document.querySelectorAll('.team-member'));
      
      // Timeline animations
      staggerAnimation(document.querySelectorAll('.timeline-item'));
      
      // Stats counter animations
      document.querySelectorAll('.counter').forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        counterAnimation(counter, target);
      });
      
      // Values animations
      staggerAnimation(document.querySelectorAll('.value-card'));
    }, 100);
  }, []);

  const teamMembers = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      role: 'Founder & CEO',
      image: '/images/team/ceo.jpg',
      description: '15+ years in real estate development and investment',
      social: {
        linkedin: '#',
        twitter: '#'
      }
    },
    {
      id: 2,
      name: 'Priya Sharma',
      role: 'Head of Sales',
      image: '/images/team/sales-head.jpg',
      description: 'Expert in luxury property sales and client relations',
      social: {
        linkedin: '#',
        twitter: '#'
      }
    },
    {
      id: 3,
      name: 'Amit Patel',
      role: 'Property Consultant',
      image: '/images/team/consultant.jpg',
      description: 'Specialized in commercial and residential consulting',
      social: {
        linkedin: '#',
        twitter: '#'
      }
    },
    {
      id: 4,
      name: 'Sneha Gupta',
      role: 'Legal Advisor',
      image: '/images/team/legal.jpg',
      description: 'Real estate law expert with 10+ years experience',
      social: {
        linkedin: '#',
        twitter: '#'
      }
    }
  ];

  const timelineEvents = [
    {
      year: '2018',
      title: 'Company Founded',
      description: 'Started Promise Realty with a vision to transform real estate experience'
    },
    {
      year: '2019',
      title: 'First 100 Properties',
      description: 'Successfully sold our first 100 properties across Mumbai and Pune'
    },
    {
      year: '2020',
      title: 'Digital Transformation',
      description: 'Launched online platform and virtual property tours'
    },
    {
      year: '2021',
      title: 'Expansion',
      description: 'Expanded operations to Delhi, Bangalore, and Hyderabad'
    },
    {
      year: '2022',
      title: '1000+ Happy Customers',
      description: 'Reached milestone of 1000+ satisfied customers'
    },
    {
      year: '2023',
      title: 'Award Recognition',
      description: 'Received "Best Real Estate Service Provider" award'
    },
    {
      year: '2024',
      title: 'Future Ready',
      description: 'Implementing AI and blockchain technology for better service'
    }
  ];

  const companyValues = [
    {
      icon: '🎯',
      title: 'Transparency',
      description: 'Complete transparency in all our dealings and processes'
    },
    {
      icon: '🤝',
      title: 'Trust',
      description: 'Building lasting relationships based on trust and reliability'
    },
    {
      icon: '⭐',
      title: 'Excellence',
      description: 'Committed to delivering excellence in every service'
    },
    {
      icon: '💡',
      title: 'Innovation',
      description: 'Embracing technology and innovation for better solutions'
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="hero-title text-4xl md:text-6xl font-bold mb-6">
              About Promise Realty
            </h1>
            <p className="hero-subtitle text-xl md:text-2xl text-blue-100 leading-relaxed">
              Your trusted partner in finding the perfect property. 
              We turn your real estate dreams into reality with expertise, 
              integrity, and personalized service.
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white opacity-10 rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white opacity-5 rounded-full"></div>
      </section>

      {/* Company Introduction */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="company-intro-text">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Building Dreams Since 2018
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Promise Realty was founded with a simple yet powerful vision: to make 
                real estate transactions transparent, efficient, and stress-free. Over the 
                years, we have grown from a small startup to one of India's most trusted 
                real estate service providers.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our team of experienced professionals combines deep market knowledge 
                with cutting-edge technology to deliver exceptional results for our clients. 
                Whether you're buying your first home, investing in commercial property, 
                or selling your current property, we're here to guide you every step of the way.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="counter text-3xl font-bold text-blue-600" data-target="1500">0</div>
                  <div className="text-gray-600 text-sm">Properties Sold</div>
                </div>
                <div className="text-center">
                  <div className="counter text-3xl font-bold text-blue-600" data-target="2000">0</div>
                  <div className="text-gray-600 text-sm">Happy Clients</div>
                </div>
                <div className="text-center">
                  <div className="counter text-3xl font-bold text-blue-600" data-target="15">0</div>
                  <div className="text-gray-600 text-sm">Cities</div>
                </div>
                <div className="text-center">
                  <div className="counter text-3xl font-bold text-blue-600" data-target="6">0</div>
                  <div className="text-gray-600 text-sm">Years Experience</div>
                </div>
              </div>
            </div>
            
            <div className="company-intro-image">
              <div className="relative">
                <img
                  src="/images/about/company-building.jpg"
                  alt="Promise Realty Office"
                  className="rounded-2xl shadow-2xl w-full"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute -bottom-6 -left-6 bg-blue-600 text-white p-6 rounded-xl shadow-lg">
                  <div className="text-2xl font-bold">6+</div>
                  <div className="text-sm">Years of Excellence</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Mission & Vision
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Driven by purpose, guided by values, and committed to excellence
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="mission-vision-card bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To revolutionize the real estate industry by providing transparent, 
                efficient, and customer-centric services. We strive to make property 
                transactions seamless and stress-free while building long-lasting 
                relationships with our clients based on trust and integrity.
              </p>
            </div>
            
            <div className="mission-vision-card bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To become India's most trusted and innovative real estate platform, 
                where technology meets personalized service. We envision a future 
                where every property transaction is transparent, efficient, and 
                delivers exceptional value to all stakeholders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {companyValues.map((value, index) => (
              <div key={index} className="value-card text-center">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Expert Team
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Experienced professionals dedicated to your success
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="team-member bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      e.target.src = `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm mb-4">{member.description}</p>
                  
                  <div className="flex space-x-3">
                    <a
                      href={member.social.linkedin}
                      className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                    <a
                      href={member.social.twitter}
                      className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Milestones that shaped our success story
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200"></div>
            
            <div className="space-y-12">
              {timelineEvents.map((event, index) => (
                <div key={index} className={`timeline-item flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                      <div className="text-blue-600 font-bold text-lg mb-2">{event.year}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                      <p className="text-gray-600">{event.description}</p>
                    </div>
                  </div>
                  
                  {/* Timeline dot */}
                  <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg z-10"></div>
                  
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Real Estate Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Let our experienced team help you find the perfect property or get the best value for your current one.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              Contact Us Today
            </a>
            <a
              href="/properties"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200"
            >
              View Properties
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;