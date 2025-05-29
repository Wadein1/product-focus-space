
import DOMPurify from 'dompurify';

// Input sanitization utilities
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters and scripts
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
};

export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  
  // Basic email validation and sanitization
  const sanitized = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailRegex.test(sanitized) ? sanitized : '';
};

export const sanitizeUrl = (url: string): string => {
  if (!url || typeof url !== 'string') return '';
  
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }
    return urlObj.toString();
  } catch {
    return '';
  }
};

// Rate limiting utility for client-side protection
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    // Add current attempt
    validAttempts.push(now);
    this.attempts.set(identifier, validAttempts);
    
    return true;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// Session security utilities
export const generateSecureToken = (): string => {
  return crypto.randomUUID();
};

export const isTokenExpired = (timestamp: string, maxAgeMs: number): boolean => {
  const tokenTime = new Date(timestamp).getTime();
  const now = Date.now();
  return (now - tokenTime) > maxAgeMs;
};
