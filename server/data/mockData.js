// Mock data for development when MongoDB is not available

const mockUsers = [

  {
    _id: '507f1f77bcf86cd799439010',
    name: 'Owner Admin',
    phone: '9876543209',
    email: 'owner@promiserealty.com',
    role: 'owner',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    permissions: {
      addProperty: true,
      editProperty: true,
      deleteProperty: true,
      writeReview: true,
      deleteReview: true,
      writeBlog: true,
      deleteBlog: true,
      viewMessages: true,
      deleteMessages: true,
      deleteUser: true,
      viewInquiries: true,
      manageSubAdmins: true,
      createAdmin: true
    }
  },
  {
    _id: '507f1f77bcf86cd799439015',
    name: 'Sub Admin',
    phone: '9876543213',
    email: 'subadmin@promiserealty.com',
    role: 'sub-admin',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    permissions: {
      addProperty: true,
      editProperty: false,
      deleteProperty: false,
      writeReview: true,
      deleteReview: false,
      writeBlog: false,
      deleteBlog: false,
      viewMessages: true,
      deleteMessages: false,
      deleteUser: false,
      viewInquiries: true
    }
  },
  {
    _id: '507f1f77bcf86cd799439012',
    name: 'Demo User',
    phone: '1234567890',
    email: 'user@promiserealty.com',
    role: 'user',
    isActive: true,
    createdAt: new Date('2024-01-02')
  },
  {
    _id: '507f1f77bcf86cd799439013',
    name: 'John Doe',
    phone: '9876543211',
    email: 'john@example.com',
    role: 'user',
    isActive: true,
    createdAt: new Date('2024-01-02')
  },
  {
    _id: '507f1f77bcf86cd799439014',
    name: 'Jane Smith',
    phone: '9876543212',
    email: 'jane@example.com',
    role: 'user',
    isActive: true,
    createdAt: new Date('2024-01-03')
  }
];

const mockProperties = [
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
      furnished: 'Fully Furnished'
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
      furnished: 'unfurnished'
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
    type: 'Commercial',
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
      furnished: 'Fully Furnished'
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

const mockReviews = [
  {
    _id: '507f1f77bcf86cd799439031',
    user: '507f1f77bcf86cd799439012',
    rating: 5,
    comment: 'Excellent service! The team helped me find my dream home in Mumbai. Very professional and responsive throughout the process.',
    reviewType: 'general',
    isApproved: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    _id: '507f1f77bcf86cd799439032',
    user: '507f1f77bcf86cd799439013',
    rating: 4,
    comment: 'Great experience with Promise Realty. They have a good selection of properties and the staff is knowledgeable.',
    reviewType: 'general',
    isApproved: true,
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-11')
  },
  {
    _id: '507f1f77bcf86cd799439033',
    user: '507f1f77bcf86cd799439012',
    rating: 5,
    comment: 'Highly recommend! They made the property buying process so smooth and hassle-free. Thank you team!',
    reviewType: 'general',
    isApproved: true,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  },
  {
    _id: '507f1f77bcf86cd799439034',
    user: '507f1f77bcf86cd799439013',
    rating: 4,
    comment: 'Professional service and good property options. The legal consultation was very helpful.',
    reviewType: 'service',
    isApproved: true,
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13')
  },
  {
    _id: '507f1f77bcf86cd799439035',
    user: '507f1f77bcf86cd799439012',
    rating: 5,
    comment: 'Amazing experience! Found the perfect apartment for my family. The team went above and beyond to help us.',
    reviewType: 'general',
    isApproved: true,
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14')
  }
];

// Mock blog data
const mockBlogs = [
  {
    _id: 'blog1',
    title: '10 Essential Tips for First-Time Home Buyers in India',
    slug: '10-essential-tips-first-time-home-buyers-india',
    content: `<p>Buying your first home is one of the most significant financial decisions you'll make in your lifetime. In India's dynamic real estate market, it's crucial to be well-informed before taking the plunge.</p>

<h2>1. Determine Your Budget</h2>
<p>Before you start house hunting, calculate how much you can afford. Consider your monthly income, existing EMIs, and other expenses. A good rule of thumb is that your home loan EMI shouldn't exceed 40% of your monthly income.</p>

<h2>2. Check Your Credit Score</h2>
<p>A good credit score (750 and above) can help you secure better interest rates on your home loan. Check your CIBIL score and improve it if necessary before applying for a loan.</p>

<h2>3. Research the Location</h2>
<p>Location is paramount in real estate. Consider factors like connectivity, infrastructure development, schools, hospitals, and future growth prospects of the area.</p>

<h2>4. Verify Legal Documents</h2>
<p>Ensure all property documents are in order. This includes title deeds, approved building plans, occupancy certificates, and NOCs from relevant authorities.</p>

<h2>5. Compare Home Loan Options</h2>
<p>Don't settle for the first loan offer. Compare interest rates, processing fees, and terms from multiple lenders to get the best deal.</p>

<p>Remember, patience is key when buying your first home. Take your time to research and make an informed decision.</p>`,
    excerpt: 'Discover the essential tips every first-time home buyer in India should know before making this life-changing investment.',
    author: {
      _id: 'user1',
      name: 'Admin User',
      email: 'admin@promiserealty.com'
    },
    category: 'Home Buying',
    tags: ['first-time buyers', 'home loan', 'real estate tips', 'property investment'],
    featuredImage: {
      url: '/images/blog/first-time-buyers.jpg',
      alt: 'First-time home buyers looking at property documents'
    },
    images: [],
    status: 'published',
    isFeatured: true,
    views: 1250,
    likes: 89,
    readTime: 8,
    seo: {
      metaTitle: '10 Essential Tips for First-Time Home Buyers in India',
      metaDescription: 'Complete guide for first-time home buyers in India. Learn about budgeting, credit scores, location research, and legal verification.',
      keywords: ['first-time home buyers', 'home buying tips', 'real estate India', 'property investment']
    },
    publishedAt: new Date('2024-01-15'),
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: 'blog2',
    title: 'Real Estate Market Trends in Mumbai 2024',
    slug: 'real-estate-market-trends-mumbai-2024',
    content: `<p>Mumbai's real estate market continues to evolve in 2024, with several key trends shaping the landscape for both buyers and investors.</p>

<h2>Price Trends</h2>
<p>Property prices in Mumbai have shown a steady upward trend, with premium locations like Bandra, Juhu, and Lower Parel leading the charge. The average price per square foot has increased by 8-12% compared to last year.</p>

<h2>Emerging Locations</h2>
<p>Areas like Thane, Navi Mumbai, and the Western suburbs are gaining popularity due to better connectivity and relatively affordable prices.</p>

<h2>Infrastructure Development</h2>
<p>The Mumbai Metro expansion and coastal road project are significantly impacting property values in connected areas.</p>

<h2>Investment Opportunities</h2>
<p>Commercial real estate, particularly in IT hubs like BKC and Powai, presents excellent investment opportunities with good rental yields.</p>`,
    excerpt: 'Comprehensive analysis of Mumbai real estate market trends, price movements, and investment opportunities in 2024.',
    author: {
      _id: 'user1',
      name: 'Admin User',
      email: 'admin@promiserealty.com'
    },
    category: 'Market Updates',
    tags: ['mumbai real estate', 'market trends', 'property prices', 'investment'],
    featuredImage: {
      url: '/images/blog/mumbai-skyline.jpg',
      alt: 'Mumbai skyline showing real estate development'
    },
    images: [],
    status: 'published',
    isFeatured: true,
    views: 980,
    likes: 67,
    readTime: 6,
    seo: {
      metaTitle: 'Mumbai Real Estate Market Trends 2024 - Complete Analysis',
      metaDescription: 'Latest Mumbai real estate trends, price analysis, emerging locations, and investment opportunities in 2024.',
      keywords: ['mumbai real estate', 'property trends 2024', 'mumbai property prices', 'real estate investment']
    },
    publishedAt: new Date('2024-02-01'),
    isActive: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    _id: 'blog3',
    title: 'Understanding RERA: A Complete Guide for Property Buyers',
    slug: 'understanding-rera-complete-guide-property-buyers',
    content: `<p>The Real Estate (Regulation and Development) Act, 2016, commonly known as RERA, has revolutionized the Indian real estate sector by bringing transparency and accountability.</p>

<h2>What is RERA?</h2>
<p>RERA is a landmark legislation that aims to protect the interests of home buyers and promote transparency in the real estate sector.</p>

<h2>Key Benefits for Buyers</h2>
<ul>
<li>Mandatory registration of real estate projects</li>
<li>Standardized sale agreements</li>
<li>Timely project completion</li>
<li>Quality assurance</li>
<li>Grievance redressal mechanism</li>
</ul>

<h2>How to Verify RERA Registration</h2>
<p>Always check the RERA registration number of any project you're considering. Visit your state's RERA website to verify the project details.</p>

<h2>Your Rights Under RERA</h2>
<p>As a buyer, you have the right to receive accurate project information, timely possession, and compensation for delays.</p>`,
    excerpt: 'Complete guide to RERA regulations, benefits for property buyers, and how to verify project registrations.',
    author: {
      _id: 'user1',
      name: 'Admin User',
      email: 'admin@promiserealty.com'
    },
    category: 'Legal Advice',
    tags: ['RERA', 'property law', 'buyer rights', 'real estate regulation'],
    featuredImage: {
      url: '/images/blog/rera-guide.jpg',
      alt: 'RERA registration documents and legal papers'
    },
    images: [],
    status: 'published',
    isFeatured: false,
    views: 756,
    likes: 45,
    readTime: 7,
    seo: {
      metaTitle: 'RERA Guide for Property Buyers - Rights and Benefits',
      metaDescription: 'Complete guide to RERA regulations, buyer rights, project verification, and legal protection in real estate.',
      keywords: ['RERA', 'property buyer rights', 'real estate law', 'RERA registration']
    },
    publishedAt: new Date('2024-01-28'),
    isActive: true,
    createdAt: new Date('2024-01-28'),
    updatedAt: new Date('2024-01-28')
  },
  {
    _id: 'blog4',
    title: 'Smart Investment Strategies for Real Estate in 2024',
    slug: 'smart-investment-strategies-real-estate-2024',
    content: `<p>Real estate remains one of the most preferred investment options in India. Here are smart strategies to maximize your returns in 2024.</p>

<h2>Diversification is Key</h2>
<p>Don't put all your money in one property type. Consider a mix of residential, commercial, and REITs for a balanced portfolio.</p>

<h2>Focus on Rental Yield</h2>
<p>Look for properties that offer good rental yields (6-8% annually). Areas with high rental demand include IT hubs, educational centers, and business districts.</p>

<h2>Emerging Markets</h2>
<p>Tier-2 cities like Pune, Hyderabad, and Chennai offer better value propositions compared to metros.</p>

<h2>Technology Integration</h2>
<p>Properties with smart home features and sustainable technologies are commanding premium prices and better rental yields.</p>

<h2>Long-term Perspective</h2>
<p>Real estate is a long-term investment. Plan for at least 5-7 years to see substantial appreciation.</p>`,
    excerpt: 'Discover smart real estate investment strategies for 2024, including diversification, rental yields, and emerging market opportunities.',
    author: {
      _id: 'user1',
      name: 'Admin User',
      email: 'admin@promiserealty.com'
    },
    category: 'Investment Guide',
    tags: ['real estate investment', 'investment strategies', 'rental yield', 'property portfolio'],
    featuredImage: {
      url: '/images/blog/investment-strategy.jpg',
      alt: 'Real estate investment planning with charts and graphs'
    },
    images: [],
    status: 'published',
    isFeatured: true,
    views: 1100,
    likes: 78,
    readTime: 9,
    seo: {
      metaTitle: 'Smart Real Estate Investment Strategies 2024',
      metaDescription: 'Expert real estate investment strategies for 2024. Learn about diversification, rental yields, and emerging market opportunities.',
      keywords: ['real estate investment', 'property investment strategies', 'rental yield', 'real estate portfolio']
    },
    publishedAt: new Date('2024-02-10'),
    isActive: true,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10')
  },
  {
    _id: 'blog5',
    title: 'How to Sell Your Property Quickly: Expert Tips',
    slug: 'how-to-sell-property-quickly-expert-tips',
    content: `<p>Selling a property can be challenging, but with the right approach, you can expedite the process and get the best price.</p>

<h2>Price it Right</h2>
<p>Research comparable properties in your area and price competitively. Overpricing can lead to longer listing times.</p>

<h2>Enhance Curb Appeal</h2>
<p>First impressions matter. Invest in minor repairs, fresh paint, and landscaping to make your property more attractive.</p>

<h2>Professional Photography</h2>
<p>High-quality photos can significantly impact buyer interest. Consider hiring a professional photographer.</p>

<h2>Stage Your Home</h2>
<p>Remove personal items and arrange furniture to showcase the property's potential. A well-staged home sells faster.</p>

<h2>Market Effectively</h2>
<p>Use multiple channels - online portals, social media, and local networks to reach maximum buyers.</p>

<h2>Be Flexible with Showings</h2>
<p>Accommodate potential buyers' schedules. The more people who see your property, the higher the chances of a quick sale.</p>`,
    excerpt: 'Expert tips to sell your property quickly and at the best price. Learn about pricing, staging, marketing, and negotiation strategies.',
    author: {
      _id: 'user1',
      name: 'Admin User',
      email: 'admin@promiserealty.com'
    },
    category: 'Selling Tips',
    tags: ['property selling', 'home staging', 'real estate marketing', 'quick sale'],
    featuredImage: {
      url: '/images/blog/selling-tips.jpg',
      alt: 'Beautiful staged home ready for sale'
    },
    images: [],
    status: 'published',
    isFeatured: false,
    views: 890,
    likes: 56,
    readTime: 6,
    seo: {
      metaTitle: 'How to Sell Your Property Quickly - Expert Tips',
      metaDescription: 'Expert tips to sell your property fast. Learn about pricing, staging, marketing strategies, and negotiation techniques.',
      keywords: ['sell property quickly', 'home selling tips', 'property marketing', 'real estate selling']
    },
    publishedAt: new Date('2024-01-20'),
    isActive: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  }
];

module.exports = {
  mockUsers,
  mockProperties,
  mockReviews,
  mockBlogs
};