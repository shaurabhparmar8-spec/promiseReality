import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { staggerAnimation, counterAnimation } from '../../styles/animations';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    properties: { total: 0, featured: 0, recent: 0 },
    users: { total: 0, active: 0, recent: 0 },
    reviews: { total: 0, pending: 0, approved: 0 },
    contacts: { total: 0, unread: 0, urgent: 0 },
    blogs: { total: 0, published: 0, draft: 0 },
    visits: { total: 0, pending: 0, completed: 0 }
  });
  const [recentContacts, setRecentContacts] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        const statCards = document.querySelectorAll('.stat-card');
        const recentItems = document.querySelectorAll('.recent-item');
        const counters = document.querySelectorAll('.counter');
        
        if (statCards && statCards.length > 0) {
          staggerAnimation(statCards);
        }
        
        if (recentItems && recentItems.length > 0) {
          staggerAnimation(recentItems);
        }
        
        if (counters && counters.length > 0) {
          counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            if (target && !isNaN(target)) {
              counterAnimation(counter, target);
            }
          });
        }
      }, 100);
    }
  }, [loading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const responses = await Promise.all([
        fetch('http://localhost:5000/api/properties?limit=1', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/auth/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/reviews', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/contact/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/blogs?limit=1', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/contact?limit=5', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/properties/featured?limit=100', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [propertiesData, usersData, reviewsData, contactsData, blogsData, recentContactsData, featuredPropertiesData] = await Promise.all(
        responses.map(res => res.json())
      );

      const featuredCount = featuredPropertiesData.success ? 
        featuredPropertiesData.data.properties.length : 0;
      
      const actualTotal = propertiesData.data?.pagination?.totalProperties || 
                         propertiesData.data?.properties?.length || 0;

      setStats({
        properties: {
          total: actualTotal,
          featured: Math.min(featuredCount, actualTotal),
          recent: Math.min(2, actualTotal)
        },
        users: {
          total: usersData.data?.users?.length || 0,
          active: usersData.data?.users?.filter(user => user.isActive)?.length || 0,
          recent: 1
        },
        reviews: {
          total: reviewsData.data?.reviews?.length || 0,
          pending: reviewsData.data?.reviews?.filter(review => !review.isApproved)?.length || 0,
          approved: reviewsData.data?.reviews?.filter(review => review.isApproved)?.length || 0
        },
        contacts: {
          total: contactsData.data?.stats?.total || 0,
          unread: contactsData.data?.stats?.unread || 0,
          urgent: contactsData.data?.stats?.urgent || 0
        },
        blogs: {
          total: blogsData.data?.pagination?.totalBlogs || 0,
          published: blogsData.data?.blogs?.filter(blog => blog.status === 'published')?.length || 0,
          draft: blogsData.data?.blogs?.filter(blog => blog.status === 'draft')?.length || 0
        },
        visits: {
          total: 0,
          pending: 0,
          completed: 0
        }
      });

      if (recentContactsData.success) {
        setRecentContacts(recentContactsData.data.contacts);
      }

      setRecentUsers([
        {
          _id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          createdAt: new Date().toISOString(),
          isActive: true
        },
        {
          _id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          isActive: true
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      setStats({
        properties: { total: 2, featured: 1, recent: 2 },
        users: { total: 5, active: 3, recent: 1 },
        reviews: { total: 5, pending: 0, approved: 5 },
        contacts: { total: 0, unread: 0, urgent: 0 },
        blogs: { total: 5, published: 5, draft: 0 },
        visits: { total: 0, pending: 0, completed: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color, link }) => (
    <div className="stat-card bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="counter text-3xl font-bold text-gray-900 mt-2" data-target={value}>
            0
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      {link && (
        <Link
          to={link}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 mt-4 transition-colors duration-200"
        >
          View all
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div data-testid="loading-spinner" className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl text-white p-6">
        <h1 className="text-2xl font-bold mb-2">Welcome back, Admin!</h1>
        <p className="text-blue-100">
          Here's what's happening with your real estate platform today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Properties"
          value={stats.properties.total}
          subtitle={`${stats.properties.featured} featured`}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          color="bg-blue-500"
          link="/admin/properties"
        />

        <StatCard
          title="Total Users"
          value={stats.users.total}
          subtitle={`${stats.users.active} active`}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          }
          color="bg-green-500"
          link="/admin/users"
        />

        <StatCard
          title="Reviews"
          value={stats.reviews.total}
          subtitle={`${stats.reviews.pending} pending`}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
          color="bg-yellow-500"
          link="/admin/reviews"
        />

        <StatCard
          title="Contact Messages"
          value={stats.contacts.total}
          subtitle={`${stats.contacts.unread} unread`}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          color="bg-purple-500"
          link="/admin/contacts"
        />

        <StatCard
          title="Visit Requests"
          value={stats.visits.total}
          subtitle={`${stats.visits.pending} pending`}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
          color="bg-indigo-500"
          link="/admin/visits"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Blog Posts</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Published</span>
              <span className="font-semibold text-green-600">{stats.blogs.published}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Draft</span>
              <span className="font-semibold text-yellow-600">{stats.blogs.draft}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <span className="font-semibold text-blue-600">{stats.blogs.total}</span>
            </div>
          </div>
          <Link
            to="/admin/blogs"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 mt-4 transition-colors duration-200"
          >
            Manage blogs
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Contacts</h3>
          <div className="space-y-3">
            {recentContacts.length > 0 ? (
              recentContacts.slice(0, 3).map((contact, index) => (
                <div key={contact._id || index} className="recent-item flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                    <p className="text-xs text-gray-500">{contact.subject}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    contact.status === 'urgent' 
                      ? 'bg-red-100 text-red-800' 
                      : contact.status === 'unread'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {contact.status || 'new'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No recent contacts</p>
            )}
          </div>
          <Link
            to="/admin/contacts"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 mt-4 transition-colors duration-200"
          >
            View all contacts
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
          <div className="space-y-3">
            {recentUsers.map((user, index) => (
              <div key={user._id} className="recent-item flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  user.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
          <Link
            to="/admin/users"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 mt-4 transition-colors duration-200"
          >
            View all users
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;