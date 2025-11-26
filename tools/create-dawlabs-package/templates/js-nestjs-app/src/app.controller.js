import { Controller, Get, Post, Body } from '@nestjs/common';

export
@Controller()
class AppController {
  constructor(appService) {
    this.appService = appService;
  }

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Post('process')
  async processData() {
    return this.appService.processData();
  }

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('version')
  getVersion() {
    return {
      name: '{{packageName}}',
      version: '0.0.1',
      description: '{{description}}',
    };
  }
}
