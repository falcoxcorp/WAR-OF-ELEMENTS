import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ApiError, API_ERROR_CODES } from './types';

// Enhanced error handling middleware
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('API Error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  let statusCode = 500;
  let errorCode = API_ERROR_CODES.INTERNAL_ERROR;
  let message = 'Internal server error';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    errorCode = API_ERROR_CODES.INVALID_PARAMETERS;
    message = error.message;
  } else if (error.message?.includes('invalid address')) {
    statusCode = 400;
    errorCode = API_ERROR_CODES.INVALID_ADDRESS;
    message = 'Invalid Ethereum address format';
  } else if (error.message?.includes('not found')) {
    statusCode = 404;
    errorCode = API_ERROR_CODES.GAME_NOT_FOUND;
    message = 'Resource not found';
  }

  const response: ApiResponse<null> = {
    success: false,
    error: message,
    timestamp: Date.now(),
    version: process.env.API_VERSION || '1.0.0'
  };

  res.status(statusCode).json(response);
};

// Request validation middleware
export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query);
    if (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: `Validation error: ${error.details[0].message}`,
        timestamp: Date.now(),
        version: process.env.API_VERSION || '1.0.0'
      };
      return res.status(400).json(response);
    }
    next();
  };
};

// API key authentication middleware
export const authenticateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  const validApiKey = process.env.API_KEY;

  if (!validApiKey) {
    // If no API key is configured, allow all requests
    return next();
  }

  if (!apiKey || apiKey !== validApiKey) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Invalid or missing API key',
      timestamp: Date.now(),
      version: process.env.API_VERSION || '1.0.0'
    };
    return res.status(401).json(response);
  }

  next();
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });

  next();
};

// CORS middleware with dynamic origins
export const corsHandler = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];

  if (allowedOrigins.includes('*') || (origin && allowedOrigins.includes(origin))) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
};

// Cache control middleware
export const cacheControl = (maxAge: number = 30) => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.set('Cache-Control', `public, max-age=${maxAge}`);
    next();
  };
};

// Response time middleware
export const responseTime = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const milliseconds = seconds * 1000 + nanoseconds / 1000000;
    res.set('X-Response-Time', `${milliseconds.toFixed(2)}ms`);
  });

  next();
};

// Health check middleware
export const healthCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Add any health checks here (database connectivity, external services, etc.)
    next();
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Service unavailable',
      timestamp: Date.now(),
      version: process.env.API_VERSION || '1.0.0'
    };
    res.status(503).json(response);
  }
};