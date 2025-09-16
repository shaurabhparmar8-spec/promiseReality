const zxcvbn = require('zxcvbn');

class PasswordValidationService {
  constructor() {
    this.minLength = 10;
    this.maxLength = 128;
    
    // Common passwords and patterns to reject
    this.commonPasswords = new Set([
      'password', 'password123', '123456789', 'qwerty123',
      'admin123', 'welcome123', 'letmein123', 'password1',
      'promiserealty', 'promiserealty123'
    ]);
    
    this.patterns = {
      hasLowerCase: /[a-z]/,
      hasUpperCase: /[A-Z]/,
      hasNumbers: /\d/,
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      hasSequential: /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i,
      hasRepeating: /(.)\1{2,}/,
      hasKeyboardPattern: /(?:qwe|wer|ert|rty|tyu|yui|uio|iop|asd|sdf|dfg|fgh|ghj|hjk|jkl|zxc|xcv|cvb|vbn|bnm)/i
    };
  }

  validatePassword(password, userInfo = {}) {
    const result = {
      isValid: false,
      score: 0,
      feedback: [],
      requirements: {
        minLength: false,
        maxLength: false,
        hasLowerCase: false,
        hasUpperCase: false,
        hasNumbers: false,
        hasSpecialChar: false,
        notCommon: false,
        notPersonal: false,
        notSequential: false,
        notRepeating: false,
        notKeyboard: false
      }
    };

    if (!password) {
      result.feedback.push('Password is required');
      return result;
    }

    // Length checks
    result.requirements.minLength = password.length >= this.minLength;
    result.requirements.maxLength = password.length <= this.maxLength;

    if (!result.requirements.minLength) {
      result.feedback.push(`Password must be at least ${this.minLength} characters long`);
    }

    if (!result.requirements.maxLength) {
      result.feedback.push(`Password must not exceed ${this.maxLength} characters`);
    }

    // Character type checks
    result.requirements.hasLowerCase = this.patterns.hasLowerCase.test(password);
    result.requirements.hasUpperCase = this.patterns.hasUpperCase.test(password);
    result.requirements.hasNumbers = this.patterns.hasNumbers.test(password);
    result.requirements.hasSpecialChar = this.patterns.hasSpecialChar.test(password);

    if (!result.requirements.hasLowerCase) {
      result.feedback.push('Password must contain at least one lowercase letter');
    }

    if (!result.requirements.hasUpperCase) {
      result.feedback.push('Password must contain at least one uppercase letter');
    }

    if (!result.requirements.hasNumbers) {
      result.feedback.push('Password must contain at least one number');
    }

    if (!result.requirements.hasSpecialChar) {
      result.feedback.push('Password must contain at least one special character');
    }

    // Common password check
    result.requirements.notCommon = !this.commonPasswords.has(password.toLowerCase());
    if (!result.requirements.notCommon) {
      result.feedback.push('Password is too common. Please choose a more unique password');
    }

    // Personal information check
    result.requirements.notPersonal = this.checkPersonalInfo(password, userInfo);
    if (!result.requirements.notPersonal) {
      result.feedback.push('Password should not contain personal information');
    }

    // Pattern checks
    result.requirements.notSequential = !this.patterns.hasSequential.test(password);
    if (!result.requirements.notSequential) {
      result.feedback.push('Password should not contain sequential characters');
    }

    result.requirements.notRepeating = !this.patterns.hasRepeating.test(password);
    if (!result.requirements.notRepeating) {
      result.feedback.push('Password should not contain repeating characters');
    }

    result.requirements.notKeyboard = !this.patterns.hasKeyboardPattern.test(password);
    if (!result.requirements.notKeyboard) {
      result.feedback.push('Password should not contain keyboard patterns');
    }

    // Use zxcvbn for advanced analysis
    const zxcvbnResult = zxcvbn(password, this.getUserInputs(userInfo));
    result.score = zxcvbnResult.score;

    // Add zxcvbn feedback
    if (zxcvbnResult.feedback.warning) {
      result.feedback.push(zxcvbnResult.feedback.warning);
    }

    zxcvbnResult.feedback.suggestions.forEach(suggestion => {
      result.feedback.push(suggestion);
    });

    // Calculate overall validity
    const basicRequirements = [
      result.requirements.minLength,
      result.requirements.maxLength,
      result.requirements.hasLowerCase,
      result.requirements.hasUpperCase,
      result.requirements.hasNumbers,
      result.requirements.hasSpecialChar
    ];

    const securityRequirements = [
      result.requirements.notCommon,
      result.requirements.notPersonal,
      result.requirements.notSequential,
      result.requirements.notRepeating,
      result.requirements.notKeyboard
    ];

    const basicScore = basicRequirements.filter(Boolean).length;
    const securityScore = securityRequirements.filter(Boolean).length;

    // Require all basic requirements + most security requirements + good zxcvbn score
    result.isValid = basicScore === basicRequirements.length && 
                     securityScore >= 4 && 
                     result.score >= 2;

    return result;
  }

  checkPersonalInfo(password, userInfo) {
    const lowerPassword = password.toLowerCase();
    
    const personalData = [
      userInfo.name,
      userInfo.email,
      userInfo.phone,
      userInfo.firstName,
      userInfo.lastName,
      'promiserealty',
      'promise',
      'realty'
    ].filter(Boolean);

    for (const data of personalData) {
      if (data && lowerPassword.includes(data.toLowerCase())) {
        return false;
      }
    }

    return true;
  }

  getUserInputs(userInfo) {
    return [
      userInfo.name,
      userInfo.email,
      userInfo.phone,
      userInfo.firstName,
      userInfo.lastName,
      'promise',
      'realty',
      'promiserealty'
    ].filter(Boolean);
  }

  getPasswordStrengthText(score) {
    const strengthTexts = [
      'Very Weak',
      'Weak', 
      'Fair',
      'Good',
      'Strong'
    ];
    
    return strengthTexts[score] || 'Very Weak';
  }

  getPasswordStrengthColor(score) {
    const colors = [
      '#dc2626', // red
      '#ea580c', // orange
      '#ca8a04', // yellow
      '#16a34a', // green
      '#059669'  // emerald
    ];
    
    return colors[score] || colors[0];
  }

  generateSecurePassword(length = 16) {
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
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

module.exports = new PasswordValidationService();