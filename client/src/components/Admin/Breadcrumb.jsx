import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = ({ customBreadcrumbs = null, className = '' }) => {
  const location = useLocation();
  
  const getBreadcrumbs = () => {
    if (customBreadcrumbs) return customBreadcrumbs;

    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    const breadcrumbs = [
      { name: 'Dashboard', href: '/admin/dashboard', icon: <Home className="w-4 h-4" /> }
    ];

    // Add specific breadcrumbs based on path
    if (segments.includes('properties')) {
      breadcrumbs.push({ name: 'Properties', href: '/admin/properties' });
    }
    if (segments.includes('reviews')) {
      breadcrumbs.push({ name: 'Reviews', href: '/admin/reviews' });
    }
    if (segments.includes('blogs')) {
      breadcrumbs.push({ name: 'Blogs', href: '/admin/blogs' });
    }
    if (segments.includes('contacts')) {
      breadcrumbs.push({ name: 'Contacts', href: '/admin/contacts' });
    }
    if (segments.includes('users')) {
      breadcrumbs.push({ name: 'Users', href: '/admin/users' });
    }
    if (segments.includes('visits')) {
      breadcrumbs.push({ name: 'Visits', href: '/admin/visits' });
    }
    if (segments.includes('sub-admins')) {
      breadcrumbs.push({ name: 'Sub Admins', href: '/admin/sub-admins' });
    }
    if (segments.includes('create-admin')) {
      if (breadcrumbs[breadcrumbs.length - 1].name !== 'Sub Admins') {
        breadcrumbs.push({ name: 'Sub Admins', href: '/admin/sub-admins' });
      }
      breadcrumbs.push({ name: 'Create Admin', href: '/admin/create-admin' });
    }

    // Handle edit pages
    if (path.includes('/edit')) {
      breadcrumbs.push({ name: 'Edit', href: path });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <nav className={`flex items-center space-x-1 text-sm text-gray-600 mb-4 ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            )}
            {index === breadcrumbs.length - 1 ? (
              <span className="flex items-center font-medium text-gray-900">
                {crumb.icon && <span className="mr-1">{crumb.icon}</span>}
                {crumb.name}
              </span>
            ) : (
              <Link
                to={crumb.href}
                className="flex items-center hover:text-blue-600 transition-colors duration-200"
              >
                {crumb.icon && <span className="mr-1">{crumb.icon}</span>}
                {crumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;