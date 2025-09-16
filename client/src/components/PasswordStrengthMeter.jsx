import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

const PasswordStrengthMeter = ({ 
  password, 
  validation, 
  showPassword, 
  onTogglePassword,
  className = "" 
}) => {
  if (!password) return null;

  const getStrengthColor = (score) => {
    const colors = {
      0: 'bg-red-500',
      1: 'bg-orange-500',
      2: 'bg-yellow-500',
      3: 'bg-blue-500',
      4: 'bg-green-500'
    };
    return colors[score] || 'bg-gray-300';
  };

  const getStrengthText = (score) => {
    const texts = {
      0: 'Very Weak',
      1: 'Weak',
      2: 'Fair',
      3: 'Good',
      4: 'Strong'
    };
    return texts[score] || 'Unknown';
  };

  const getStrengthTextColor = (score) => {
    const colors = {
      0: 'text-red-600',
      1: 'text-orange-600',
      2: 'text-yellow-600',
      3: 'text-blue-600',
      4: 'text-green-600'
    };
    return colors[score] || 'text-gray-600';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Password Strength Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Password Strength</span>
          <span className={`text-sm font-medium ${getStrengthTextColor(validation?.score || 0)}`}>
            {getStrengthText(validation?.score || 0)}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(validation?.score || 0)}`}
            style={{ width: `${((validation?.score || 0) + 1) * 20}%` }}
          />
        </div>
        
        {validation?.estimatedCrackTime && (
          <p className="text-xs text-gray-500">
            Estimated crack time: {validation.estimatedCrackTime}
          </p>
        )}
      </div>

      {/* Requirements Checklist */}
      {validation?.requirements && (
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements</h4>
          <div className="grid grid-cols-1 gap-1 text-xs">
            {validation.requirements.map((req, index) => (
              <div key={index} className="flex items-center space-x-2">
                {req.met ? (
                  <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                )}
                <span className={req.met ? 'text-green-700' : 'text-red-700'}>
                  {req.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Messages */}
      {validation?.errors && validation.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              {validation.errors.map((error, index) => (
                <p key={index} className="text-sm text-red-700">{error}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {validation?.warnings && validation.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              {validation.warnings.map((warning, index) => (
                <p key={index} className="text-sm text-yellow-700">{warning}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {validation?.isValid && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <p className="text-sm text-green-700 font-medium">
              Great! Your password meets all security requirements.
            </p>
          </div>
        </div>
      )}

      {/* Password Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Password Tips</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Use a mix of uppercase, lowercase, numbers, and symbols</li>
          <li>• Avoid common words, names, or keyboard patterns</li>
          <li>• Consider using a passphrase with random words</li>
          <li>• Use a unique password for each account</li>
          <li>• Consider using a password manager</li>
        </ul>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;