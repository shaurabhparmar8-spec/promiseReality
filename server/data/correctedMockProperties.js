const correctedMockProperties = [
  {
    _id: '507f1f77bcf86cd799439021',
    title: 'Luxury Villa in Bandra West',
    description: 'Stunning 4BHK villa with modern amenities, private garden, and sea view. Perfect for families looking for luxury living in the heart of Mumbai.',
    type: 'Villa',
    location: {
      area: 'Bandra West',
      address: '123 Hill Road, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050'
    },
    price: {
      amount: 85000000,
      priceType: 'sale'
    },
    specifications: {
      bedrooms: 4,
      bathrooms: 4,
      area: { value: 3500, unit: 'sqft' },
      parking: 2,
      furnished: 'Fully-Furnished'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        alt: 'Villa exterior view',
        isPrimary: true
      }
    ],
    amenities: ['Swimming Pool', 'Gym', 'Garden', 'Security', 'Parking', 'Power Backup'],
    features: ['Sea View', 'Vastu Compliant', 'Corner Plot', 'Gated Community'],
    isFeatured: true,
    views: 245,
    createdBy: '507f1f77bcf86cd799439011',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    _id: '507f1f77bcf86cd799439022',
    title: 'Modern 3BHK Apartment in Koramangala',
    description: 'Contemporary apartment with premium finishes, balcony, and excellent connectivity. Ideal for professionals and small families.',
    type: 'Apartment',
    location: {
      area: 'Koramangala',
      address: '456 Inner Ring Road, Koramangala',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560034'
    },
    price: {
      amount: 12500000,
      priceType: 'sale'
    },
    specifications: {
      bedrooms: 3,
      bathrooms: 3,
      area: { value: 1800, unit: 'sqft' },
      parking: 1,
      furnished: 'Semi-Furnished'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        alt: 'Apartment living room',
        isPrimary: true
      }
    ],
    amenities: ['Gym', 'Clubhouse', 'Swimming Pool', 'Children Play Area', 'Security'],
    features: ['East Facing', 'High Floor', 'Premium Location'],
    isFeatured: true,
    views: 189,
    createdBy: '507f1f77bcf86cd799439011',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    _id: '507f1f77bcf86cd799439023',
    title: 'Spacious Duplex in Gurgaon',
    description: 'Beautiful duplex with terrace garden, modern kitchen, and ample natural light. Perfect for large families seeking comfort and space.',
    type: 'Duplex',
    location: {
      area: 'Golf Course Road',
      address: '789 Sector 54, Golf Course Road',
      city: 'Gurgaon',
      state: 'Haryana',
      pincode: '122002'
    },
    price: {
      amount: 45000,
      priceType: 'rent',
      rentPeriod: 'monthly'
    },
    specifications: {
      bedrooms: 4,
      bathrooms: 4,
      area: { value: 2800, unit: 'sqft' },
      parking: 2,
      furnished: 'Fully-Furnished'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        alt: 'Duplex interior',
        isPrimary: true
      }
    ],
    amenities: ['Terrace Garden', 'Modular Kitchen', 'AC', 'Parking', 'Security'],
    features: ['Duplex', 'Terrace Access', 'Premium Locality'],
    isFeatured: true,
    views: 156,
    createdBy: '507f1f77bcf86cd799439011',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  },
  {
    _id: '507f1f77bcf86cd799439024',
    title: 'Prime Commercial Plot in Pune',
    description: 'Excellent commercial plot in prime location with high appreciation potential. Perfect for business development or investment.',
    type: 'Plot',
    location: {
      area: 'Hinjewadi Phase 1',
      address: 'Survey No. 123, Hinjewadi Phase 1',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411057'
    },
    price: {
      amount: 25000000,
      priceType: 'sale'
    },
    specifications: {
      bedrooms: 0,
      bathrooms: 0,
      area: { value: 5000, unit: 'sqft' },
      parking: 0,
      furnished: 'Unfurnished'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        alt: 'Commercial plot',
        isPrimary: true
      }
    ],
    amenities: ['Road Facing', 'Clear Title', 'Approved Layout'],
    features: ['Corner Plot', 'Commercial Zone', 'High Appreciation'],
    isFeatured: false,
    views: 98,
    createdBy: '507f1f77bcf86cd799439011',
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04')
  },
  {
    _id: '507f1f77bcf86cd799439025',
    title: 'Cozy 2BHK House in Jaipur',
    description: 'Charming house with traditional architecture and modern amenities. Great for families looking for affordable housing.',
    type: 'House',
    location: {
      area: 'Malviya Nagar',
      address: 'C-45 Malviya Nagar',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302017'
    },
    price: {
      amount: 6500000,
      priceType: 'sale'
    },
    specifications: {
      bedrooms: 2,
      bathrooms: 2,
      area: { value: 1200, unit: 'sqft' },
      parking: 1,
      furnished: 'Unfurnished'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        alt: 'House exterior',
        isPrimary: true
      }
    ],
    amenities: ['Garden', 'Parking', 'Security', 'Water Supply'],
    features: ['Independent House', 'Good Ventilation', 'Peaceful Area'],
    isFeatured: false,
    views: 67,
    createdBy: '507f1f77bcf86cd799439011',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  },
  {
    _id: '507f1f77bcf86cd799439026',
    title: 'Premium Office Space in Noida',
    description: 'Modern office space with excellent infrastructure and connectivity. Perfect for businesses looking to establish in NCR.',
    type: 'Plot',
    location: {
      area: 'Sector 62',
      address: 'Tower A, Sector 62',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201309'
    },
    price: {
      amount: 85000,
      priceType: 'rent',
      rentPeriod: 'monthly'
    },
    specifications: {
      bedrooms: 0,
      bathrooms: 2,
      area: { value: 2500, unit: 'sqft' },
      parking: 4,
      furnished: 'Fully-Furnished'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        alt: 'Office space',
        isPrimary: true
      }
    ],
    amenities: ['AC', 'Elevator', 'Parking', 'Security', 'Power Backup', 'Cafeteria'],
    features: ['IT Park', 'Metro Connectivity', 'Premium Location'],
    isFeatured: true,
    views: 234,
    createdBy: '507f1f77bcf86cd799439011',
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-06')
  }
];

module.exports = {
  correctedMockProperties
};
