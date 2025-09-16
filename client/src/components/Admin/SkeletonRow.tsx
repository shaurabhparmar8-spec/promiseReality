import React from 'react';

const SkeletonRow: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="flex items-start justify-between">
        {/* Left side - Admin info */}
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-4">
            {/* Avatar skeleton */}
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            
            {/* Name and contact skeleton */}
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          
          {/* Permissions skeleton */}
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-6 bg-gray-200 rounded-full"
                  style={{ width: `${Math.floor(Math.random() * 40) + 60}px` }}
                ></div>
              ))}
            </div>
          </div>
          
          {/* Created date skeleton */}
          <div className="mt-4">
            <div className="h-3 bg-gray-200 rounded w-28"></div>
          </div>
        </div>
        
        {/* Right side - Actions */}
        <div className="flex flex-col space-y-2 ml-6">
          <div className="h-9 bg-gray-200 rounded-lg w-32"></div>
          <div className="h-9 bg-gray-200 rounded-lg w-32"></div>
        </div>
      </div>
    </div>
  );
};

// Component for multiple skeleton rows
interface SkeletonRowsProps {
  count?: number;
}

export const SkeletonRows: React.FC<SkeletonRowsProps> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonRow key={index} />
      ))}
    </div>
  );
};

export default SkeletonRow;