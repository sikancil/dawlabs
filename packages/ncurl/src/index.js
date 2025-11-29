/**
 * nCurl - LLM-Optimized HTTP Client with Intelligent Request Processing
 *
 * @context Core HTTP client library in the DAWLabs monorepo optimized for AI/LLM interactions
 * @purpose Provides intelligent HTTP request capabilities with automatic inference and LLM-friendly output formatting
 * @integration Used across DAWLabs tools and CLI commands for HTTP operations with smart defaults
 * @workflow Intelligently processes HTTP requests with automatic method detection, content handling, and error resolution
 *
 * Key Features:
 * - Intelligent HTTP method detection based on URL patterns and data presence
 * - LLM-friendly automatic JSON parsing and content-type handling
 * - Smart protocol assumption (HTTPS by default for LLM convenience)
 * - Comprehensive error handling with actionable suggestions
 * - Verbose mode for debugging and request inspection
 * - Built-in timeout and redirect management
 *
 * LLM Optimization:
 * - Reduces cognitive load by making smart assumptions
 * - Provides helpful error messages with actionable suggestions
 * - Automatically handles JSON serialization/deserialization
 * - Follows common LLM usage patterns and expectations
 *
 * Integration Points:
 * - Used by CLI tools for API interactions
 * - Integrated into build and deployment workflows
 * - Provides foundation for other HTTP-based utilities
 *
 * @example
 * import { main } from './index.js';
 *
 * // Simple GET request
 * await main({ url: 'https://api.example.com/users' });
 *
 * // POST with JSON data
 * await main({
 *   url: 'https://api.example.com/users',
 *   json: true,
 *   data: { name: 'John', email: 'john@example.com' }
 * });
 *
 * // Verbose debugging
 * await main({
 *   url: 'https://api.example.com/data',
 *   verbose: true
 * });
 */

import { request } from 'undici';

/**
 * @typedef {Object} HTTPOptions
 * @property {string} [method='GET'] - HTTP method
 * @property {string} [url] - Target URL
 * @property {Object} [headers={}] - HTTP headers
 * @property {string|Object} [data] - Request body data
 * @property {boolean} [verbose=false] - Enable verbose output
 * @property {boolean} [json=false] - Automatically handle JSON content-type
 * @property {string} [output] - Output file path
 * @property {boolean} [followRedirects=true] - Follow HTTP redirects
 * @property {number} [timeout=30000] - Request timeout in milliseconds
 */

/**
 * Intelligent HTTP method detection based on LLM cognitive patterns
 * @param {string} url - Target URL
 * @param {HTTPOptions} options - Command options
 * @returns {string} Inferred HTTP method
 */
function inferMethod(url, options = {}) {
  if (options.method) {
    return options.method.toUpperCase();
  }

  // LLM Pattern: If data is provided, assume POST unless specified
  if (options.data) {
    return 'POST';
  }

  // LLM Pattern: Common API endpoints often imply actions
  const actionPatterns = [
    /\/(create|new|add)$/i,
    /\/(delete|remove)$/i,
    /\/(update|edit|modify)$/i,
    /\/(submit|send|post)$/i,
  ];

  const urlLower = url.toLowerCase();
  for (const pattern of actionPatterns) {
    if (pattern.test(urlLower)) {
      if (pattern.source.includes('delete') || pattern.source.includes('remove')) {
        return 'DELETE';
      }
      if (
        pattern.source.includes('update') ||
        pattern.source.includes('edit') ||
        pattern.source.includes('modify')
      ) {
        return 'PUT';
      }
      return 'POST';
    }
  }

  // Default LLM assumption: GET
  return 'GET';
}

/**
 * Intelligent content-type detection and header management
 * @param {HTTPOptions} options - Command options
 * @returns {Object} Inferred headers
 */
function inferHeaders(options = {}) {
  const headers = {};

  // Process header array from commander
  if (options.header && Array.isArray(options.header)) {
    options.header.forEach(header => {
      const [key, ...valueParts] = header.split(':');
      if (key && valueParts.length > 0) {
        headers[key.trim()] = valueParts.join(':').trim();
      }
    });
  }

  // Add any additional headers object
  if (options.headers && typeof options.headers === 'object') {
    Object.assign(headers, options.headers);
  }

  // LLM Pattern: If JSON flag is set or data is an object
  if (options.json || (options.data && typeof options.data === 'object')) {
    if (!headers['content-type']) {
      headers['content-type'] = 'application/json';
    }
    if (!headers['accept']) {
      headers['accept'] = 'application/json';
    }
  }

  // LLM Pattern: User-Agent assumption with dynamic version
  if (!headers['user-agent']) {
    const packageVersion = '0.0.1'; // Will be updated during build
    headers['user-agent'] = `ncurl/${packageVersion}`;
  }

  return headers;
}

/**
 * Smart URL validation and LLM-friendly error messages
 * @param {string} url - URL to validate
 * @throws {Error} User-friendly error with LLM guidance
 */
function validateURL(url) {
  if (!url) {
    throw new Error('URL is required. Example: ncurl https://api.example.com/data');
  }

  // LLM Pattern: Add protocol if missing (common LLM assumption)
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
    console.log(`[ncurl] Assuming HTTPS protocol: ${url}`);
  }

  try {
    new URL(url);
  } catch {
    throw new Error(`Invalid URL format. Please use: https://example.com or http://example.com`);
  }

  return url;
}

/**
 * Intelligent request execution with LLM-friendly output
 * @param {HTTPOptions} options - Command options
 * @returns {Promise<Object>} Response data
 */
export async function executeRequest(options = {}) {
  try {
    const url = validateURL(options.url);
    const method = inferMethod(url, options);
    const headers = inferHeaders(options);

    // Prepare request body
    let body;
    if (options.data) {
      if (options.json && typeof options.data === 'string') {
        // If JSON flag is set and data is string, parse it first
        try {
          const parsed = JSON.parse(options.data);
          body = JSON.stringify(parsed);
        } catch {
          body = options.data; // Keep as string if parsing fails
        }
      } else if (typeof options.data === 'string') {
        body = options.data;
      } else if (typeof options.data === 'object') {
        body = JSON.stringify(options.data);
      }
    }

    const requestOptions = {
      method,
      headers,
      body,
      headersTimeout: options.timeout ? parseInt(options.timeout) : 30000,
      bodyTimeout: options.timeout ? parseInt(options.timeout) : 30000,
      followRedirects: options.followRedirects !== false,
    };

    if (options.verbose) {
      console.log(`[ncurl] Request: ${method} ${url}`);
      console.log(`[ncurl] Headers:`, headers);
      if (body) {
        console.log(`[ncurl] Body:`, body);
      }
    }

    const response = await request(url, requestOptions);
    const responseBody = await response.body.text();

    // Smart response handling
    let responseData = responseBody;
    const contentType = response.headers['content-type'] || '';

    // LLM Pattern: Auto-parse JSON if response suggests it
    if (contentType.includes('application/json') && responseBody) {
      try {
        responseData = JSON.parse(responseBody);
      } catch {
        // Keep as text if parsing fails
      }
    }

    const result = {
      status: response.statusCode,
      statusText: response.statusMessage,
      headers: response.headers,
      data: responseData,
      url: response.url,
    };

    if (options.verbose) {
      console.log(`[ncurl] Response: ${response.statusCode} ${response.statusMessage}`);
      console.log(`[ncurl] Response Headers:`, response.headers);
    }

    return result;
  } catch (error) {
    // LLM-friendly error messages with helpful suggestions
    const errorMessage = error.message;
    let suggestion = '';

    if (error.code === 'ENOTFOUND') {
      suggestion = 'Check the domain name and your internet connection';
    } else if (error.code === 'ECONNREFUSED') {
      suggestion = 'The server is not accepting connections - check if the service is running';
    } else if (error.code === 'ETIMEDOUT') {
      suggestion = 'Request timed out - try increasing timeout with --timeout';
    } else if (error.code === 'ECONNRESET') {
      suggestion = 'Connection was reset - the server may be overloaded';
    }

    const fullError = suggestion ? `${errorMessage}\n[suggestion] ${suggestion}` : errorMessage;
    throw new Error(fullError);
  }
}

/**
 * Main nCurl functionality
 * @param {HTTPOptions} options - Command options
 */
export async function main(options = {}) {
  try {
    // If no URL provided, show helpful usage (LLM-friendly)
    if (!options.url && options.args && options.args.length > 0) {
      options.url = options.args[0];
    }

    if (!options.url) {
      console.log('ncurl - A curl clone optimized for LLM cognitive patterns\n');
      console.log('Usage: ncurl [options] <url>');
      console.log('Examples:');
      console.log('  ncurl https://api.example.com/users');
      console.log('  ncurl post https://api.example.com/users --json \'{"name":"John"}\'');
      console.log('  ncurl https://api.example.com/data --verbose');
      console.log('');
      console.log('LLM-friendly features:');
      console.log('• Automatic method detection from data presence');
      console.log('• Smart content-type handling');
      console.log('• JSON auto-parsing responses');
      console.log('• Protocol assumption (https://)');
      return;
    }

    const result = await executeRequest(options);

    // Smart output formatting
    if (options.output) {
      const fs = await import('fs');
      if (typeof result.data === 'object') {
        await fs.promises.writeFile(options.output, JSON.stringify(result.data, null, 2));
      } else {
        await fs.promises.writeFile(options.output, result.data);
      }
      if (options.verbose || !options.silent) {
        console.log(`Response saved to: ${options.output}`);
      }
    } else {
      // Pretty-print JSON responses
      if (typeof result.data === 'object') {
        console.log(JSON.stringify(result.data, null, 2));
      } else {
        console.log(result.data);
      }
    }
  } catch (error) {
    console.error(`[ncurl] Error: ${error.message}`);
    process.exit(1);
  }
}

export default main;
