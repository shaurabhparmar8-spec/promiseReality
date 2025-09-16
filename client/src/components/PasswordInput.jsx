import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, RefreshCw } from 'lucide-react';
import PasswordStrengthMeter from './PasswordStrengthMeter';

const PasswordInput = ({
  label = "Password",
  placeholder = "Enter password",
  value,
  onChange,
  onValidation,
  showStrengthMeter = false,
  showGenerator = false,
  required = false,
  disabled = false,
  className = "",
  error = null,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [validation, setValidation] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  // Debounced validation
  useEffect(() => {
    if (!value || !showStrengthMeter) {
      setValidation(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsValidating(true);
      try {
        // Call validation API or use client-side validation
        const result = await validatePassword(value);
        setValidation(result);
        if (onValidation) {
          onValidation(result);
        }
      } catch (error) {
        console.error('Password validation error:', error);
      } finally {
        setIsValidating(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value, showStrengthMeter, onValidation]);

  const validatePassword = async (password) => {
    // Client-side validation logic
    const requirements = [
      {
        text: "At least 10 characters long",
        met: password.length >= 10
      },
      {
        text: "Contains lowercase letter",
        met: /[a-z]/.test(password)
      },
      {
        text: "Contains uppercase letter",
        met: /[A-Z]/.test(password)
      },
      {
        text: "Contains number",
        met: /\d/.test(password)
      },
      {
        text: "Contains special character",
        met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
      }
    ];

    const score = calculatePasswordScore(password, requirements);
    const errors = requirements.filter(req => !req.met).map(req => req.text);
    const warnings = [];

    // Add specific warnings
    if (password.length < 12) {
      warnings.push("Consider using at least 12 characters for better security");
    }
    
    if (/(.)\1{2,}/.test(password)) {
      warnings.push("Avoid repeating characters");
    }
    
    if (/123456|qwerty|password/i.test(password)) {
      warnings.push("Avoid common patterns");
    }

    return {
      isValid: requirements.every(req => req.met) && score >= 2,
      score,
      requirements,
      errors,
      warnings,
      estimatedCrackTime: getEstimatedCrackTime(score)
    };
  };

  const calculatePasswordScore = (password, requirements) => {
    let score = 0;
    
    // Basic requirements
    if (requirements.every(req => req.met)) score += 2;
    
    // Length bonus
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    
    // Complexity bonus
    const hasVariety = /[a-z]/.test(password) && 
                      /[A-Z]/.test(password) && 
                      /\d/.test(password) && 
                      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    if (hasVariety && password.length >= 12) score += 1;
    
    return Math.min(score, 4);
  };

  const getEstimatedCrackTime = (score) => {
    const times = {
      0: "less than a second",
      1: "minutes",
      2: "hours",
      3: "days",
      4: "centuries"
    };
    return times[score] || "unknown";
  };

  const generateSecurePassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';
    
    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < 16; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    const shuffled = password.split('').sort(() => Math.random() - 0.5).join('');
    onChange({ target: { value: shuffled } });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`block w-full pl-10 pr-20 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
            error ? 'border-red-300' : 'border-gray-300'
          } ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          {...props}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
          {/* Password Generator */}
          {showGenerator && (
            <button
              type="button"
              onClick={generateSecurePassword}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Generate secure password"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          
          {/* Show/Hide Password */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Password Strength Meter */}
      {showStrengthMeter && value && (
        <div className="mt-3">
          {isValidating ? (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Checking password strength...</span>
            </div>
          ) : (
            <PasswordStrengthMeter
              password={value}
              validation={validation}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default PasswordInput;