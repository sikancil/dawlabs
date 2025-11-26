/**
 * {{className}} Plugin Controller
 */

import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { {{className}}Service } from './{{className}}.service.js';
import { {{className}}Response } from './interfaces';

export @Controller('{{name}}')
class {{className}}Controller {
  constructor({{className}}Service) {
    this.{{camelCase}}Service = {{className}}Service;
  }

  /**
   * Process data endpoint
   * @param {Object} data - Request body data
   * @returns {Promise<Object>} Processing response
   */
  @Post('process')
  @HttpCode(HttpStatus.OK)
  async processData(data) {
    return this.{{camelCase}}Service.processData(data);
  }

  /**
   * Health check endpoint
   * @returns {Promise<Object>} Health status
   */
  @Get('health')
  async healthCheck() {
    const healthy = await this.{{camelCase}}Service.healthCheck();
    return {
      status: healthy ? 'healthy' : 'unhealthy',
      healthy,
    };
  }

  /**
   * Get configuration endpoint
   * @returns {Object} Configuration object
   */
  @Get('config')
  getConfig() {
    const config = this.{{camelCase}}Service.getConfig();
    // Remove sensitive data from config
    const { config: safeConfig } = config;
    return { config: safeConfig || {} };
  }

  /**
   * Test endpoint
   * @returns {Object} Test response
   */
  @Get('test')
  test() {
    return {
      message: '{{name}} plugin is working',
      timestamp: new Date(),
    };
  }
}