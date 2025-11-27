/**
 * {{className}} Plugin Interfaces
 */

// Service configuration interface
export interface {{className}}Config {
  /**
   * Enable/disable logging
   */
  enableLogging?: boolean;

  /**
   * Custom service options
   */
  options?: Record<string, unknown>;

  /**
   * External service URLs
   */
  services?: {
    api?: string;
    auth?: string;
  };
}

// Response interface
export interface {{className}}Response<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

// Event interface
export interface {{className}}Event {
  type: string;
  payload: Record<string, unknown>;
  timestamp: Date;
  source: string;
}

// Re-export shared types
// Shared types can be defined here as needed