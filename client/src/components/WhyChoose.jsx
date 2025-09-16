import React, { useEffect, useRef } from 'react';
import { Shield, Award, Users, Clock, MapPin, TrendingUp, Heart, CheckCircle } from 'lucide-react';
import { slideFromLeft, slideFromRight, counterAnimation } from '../styles/animations';

const WhyChoose = () => {
  const sectionRef = useRef(null);
  const leftContentRef = useRef(null);
  const rightContentRef = useRef(null);

  const reasons = [
    {
      icon: Shield,
      title: 'Verified Properties',
      description: 'All our properties are thoroughly verified and legally compliant to ensure your investment is secure.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Award,
      title: 'Award Winning Service',
      description: 'Recognized as the best real estate service provider with multiple industry awards and certifications.',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Our team of experienced professionals provides personalized guidance throughout your property journey.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Clock,
      title: 'Quick Processing',
      description: 'Streamlined processes and digital solutions ensure faster property transactions and documentation.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: MapPin,
      title: 'Prime Locations',
      description: 'Curated properties in the most sought-after locations with excellent connectivity and amenities.',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: TrendingUp,
      title: 'Best ROI',
      description: 'Properties selected for their high appreciation potential and excellent return on investment.',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  const stats = [
    { number: 5000, suffix: '+', label: 'Satisfied Clients', icon: Heart },
    { number: 1000, suffix: '+', label: 'Properties Sold', icon: CheckCircle },
    { number: 50, suffix: '+', label: 'Cities Covered', icon: MapPin },
    { number: 15, suffix: '+', label: 'Years Experience', icon: Award }
  ];

  useEffect(() => {
    if (leftContentRef.current && rightContentRef.current) {
      slideFromLeft(leftContentRef.current);
      slideFromRight(rightContentRef.current);
      
      // Animate counters
      const counters = sectionRef.current.querySelectorAll('.counter');
      counters.forEach((counter, index) => {
        const stat = stats[index];
        counterAnimation(counter, stat.number, {
          scrollTrigger: {
            trigger: counter,
            start: "top 80%"
          }
        });
      });
    }
  }, []);

  return (
    <section ref={sectionRef} className="section-padding bg-gradient-to-br from-gray-50 to-white">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-gray-900 mb-6">
            Why Choose Promise Realty?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            With years of experience and thousands of satisfied clients, we've built a reputation 
            for excellence in the real estate industry. Here's what sets us apart.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content - Reasons */}
          <div ref={leftContentRef} className="space-y-8">
            {reasons.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <div key={index} className="flex items-start space-x-4 group">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-14 h-14 bg-gradient-to-r ${reason.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
                      {reason.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {reason.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Content - Stats & Image */}
          <div ref={rightContentRef} className="space-y-8">
            {/* Hero Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Promise Realty Team"
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              
              {/* Floating Stats Card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-6">
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Icon className="w-5 h-5 text-primary-600 mr-2" />
                          <span className="text-2xl font-bold text-gray-900">
                            <span className="counter">0</span>{stat.suffix}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 font-medium">
                          {stat.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h4 className="text-lg font-bold text-gray-900 mb-4">
                Trusted & Certified
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">RERA Certified</div>
                    <div className="text-sm text-gray-600">Licensed & Regulated</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Secure Transactions</div>
                    <div className="text-sm text-gray-600">100% Safe & Legal</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Industry Awards</div>
                    <div className="text-sm text-gray-600">Excellence Recognition</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Expert Team</div>
                    <div className="text-sm text-gray-600">Qualified Professionals</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-4 bg-white rounded-full px-8 py-4 shadow-lg border border-gray-200">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-sm"
                >
                  {i}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="font-bold text-gray-900">Join 5000+ Happy Clients</div>
              <div className="text-sm text-gray-600">Start your property journey today</div>
            </div>
            <button className="btn-primary px-6 py-2">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;