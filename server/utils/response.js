/**
 * Standardized API Response Utility
 * Ensures consistent response format across all endpoints
 */

class ApiResponse {
  constructor(success, message, data = null, meta = null) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.meta = meta;
    this.timestamp = new Date().toISOString();
  }

  static success(message, data = null, meta = null) {
    return new ApiResponse(true, message, data, meta);
  }

  static error(message, data = null, meta = null) {
    return new ApiResponse(false, message, data, meta);
  }

  toJSON() {
    return {
      success: this.success,
      message: this.message,
      data: this.data,
      meta: this.meta,
      timestamp: this.timestamp
    };
  }
}

// HTTP Status Codes with standardized responses
const httpStatus = {
  // Success responses
  OK: (res, message = 'Request successful', data = null, meta = null) => {
    return res.status(200).json(ApiResponse.success(message, data, meta).toJSON());
  },

  CREATED: (res, message = 'Resource created successfully', data = null, meta = null) => {
    return res.status(201).json(ApiResponse.success(message, data, meta).toJSON());
  },

  ACCEPTED: (res, message = 'Request accepted', data = null, meta = null) => {
    return res.status(202).json(ApiResponse.success(message, data, meta).toJSON());
  },

  NO_CONTENT: (res, message = 'No content') => {
    return res.status(204).json(ApiResponse.success(message).toJSON());
  },

  // Client error responses
  BAD_REQUEST: (res, message = 'Bad request', errors = null) => {
    return res.status(400).json(ApiResponse.error(message, null, { errors }).toJSON());
  },

  UNAUTHORIZED: (res, message = 'Unauthorized access') => {
    return res.status(401).json(ApiResponse.error(message).toJSON());
  },

  FORBIDDEN: (res, message = 'Access forbidden') => {
    return res.status(403).json(ApiResponse.error(message).toJSON());
  },

  NOT_FOUND: (res, message = 'Resource not found') => {
    return res.status(404).json(ApiResponse.error(message).toJSON());
  },

  CONFLICT: (res, message = 'Resource conflict', data = null) => {
    return res.status(409).json(ApiResponse.error(message, data).toJSON());
  },

  VALIDATION_ERROR: (res, message = 'Validation failed', errors = null) => {
    return res.status(422).json(ApiResponse.error(message, null, { errors }).toJSON());
  },

  TOO_MANY_REQUESTS: (res, message = 'Too many requests', retryAfter = null) => {
    const meta = retryAfter ? { retryAfter } : null;
    return res.status(429).json(ApiResponse.error(message, null, meta).toJSON());
  },

  // Server error responses
  INTERNAL_SERVER_ERROR: (res, message = 'Internal server error', error = null) => {
    const data = process.env.NODE_ENV === 'development' ? { error: error?.message } : null;
    return res.status(500).json(ApiResponse.error(message, data).toJSON());
  },

  NOT_IMPLEMENTED: (res, message = 'Feature not implemented') => {
    return res.status(501).json(ApiResponse.error(message).toJSON());
  },

  SERVICE_UNAVAILABLE: (res, message = 'Service temporarily unavailable', retryAfter = null) => {
    const meta = retryAfter ? { retryAfter } : null;
    return res.status(503).json(ApiResponse.error(message, null, meta).toJSON());
  }
};

// Pagination metadata helper
const paginationMeta = (page, limit, total, totalPages) => {
  return {
    pagination: {
      currentPage: page,
      itemsPerPage: limit,
      totalItems: total,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

module.exports = {
  ApiResponse,
  httpStatus,
  paginationMeta
};
