/**
 * {{className}} Plugin Interfaces
 *
 * @typedef {Object} {{className}}Config
 * @property {boolean} [enableLogging=true] - Enable/disable logging
 * @property {Object} [options={}] - Custom service options
 * @property {Object} [services={}] - External service URLs
 * @property {string} [services.api] - API service URL
 * @property {string} [services.auth] - Auth service URL
 */

// Response interface
/**
 * @typedef {Object} {{className}}Response
 * @template T
 * @property {boolean} success - Operation success status
 * @property {T} [data] - Response data
 * @property {string} [error] - Error message if failed
 * @property {Date} timestamp - Response timestamp
 */

// Event interface
/**
 * @typedef {Object} {{className}}Event
 * @property {string} type - Event type
 * @property {Object} payload - Event payload
 * @property {Date} timestamp - Event timestamp
 * @property {string} source - Event source
 */

// Re-export shared types
// Note: Shared types are available via // Shared types can be defined here as needed package
// Uncomment the line below if you want to re-export shared types
// // Shared types can be defined here as needed

// Export interfaces for TypeScript compatibility (if needed)
export const {{className}}Config = {};
export const {{className}}Response = {};
export const {{className}}Event = {};