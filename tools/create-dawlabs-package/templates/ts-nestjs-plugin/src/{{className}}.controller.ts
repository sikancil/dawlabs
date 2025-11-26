/**
 * {{className}} Plugin Controller
 */

import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { {{className}}Service } from './{{className}}.service';
import { {{className}}Response, {{className}}Config } from './interfaces';

@Controller('{{name}}')
export class {{className}}Controller {
  constructor(private readonly {{className}}Service: {{className}}Service) {}

  /**
   * Process data endpoint
   */
  @Post('process')
  @HttpCode(HttpStatus.OK)
  async processData(@Body() data: unknown): Promise<{{className}}Response> {
    return this.{{className}}Service.processData(data);
  }

  /**
   * Health check endpoint
   */
  @Get('health')
  async healthCheck(): Promise<{ status: string; healthy: boolean }> {
    const healthy = await this.{{className}}Service.healthCheck();
    return {
      status: healthy ? 'healthy' : 'unhealthy',
      healthy,
    };
  }

  /**
   * Get configuration endpoint
   */
  @Get('config')
  getConfig(): { config: {{className}}Config } {
    const config = this.{{className}}Service.getConfig();
    // Return config without sensitive data
    return { config };
  }

  /**
   * Test endpoint
   */
  @Get('test')
  test(): { message: string; timestamp: Date } {
    return {
      message: '{{name}} plugin is working',
      timestamp: new Date(),
    };
  }
}