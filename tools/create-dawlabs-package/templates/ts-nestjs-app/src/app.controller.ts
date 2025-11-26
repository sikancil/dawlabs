import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { Create{{className}}Dto } from './dto/create-{{className}}.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): { message: string; timestamp: Date; version: string } {
    return this.appService.getHello();
  }

  @Post('process')
  @HttpCode(HttpStatus.OK)
  async processData(@Body() create{{className}}Dto: Create{{className}}Dto) {
    return this.appService.processData(create{{className}}Dto);
  }

  @Get('health')
  getHealth(): { status: string; timestamp: Date; uptime: number } {
    return this.appService.getHealth();
  }

  @Get('version')
  getVersion(): { name: string; version: string; description: string } {
    return {
      name: '{{packageName}}',
      version: '0.0.1',
      description: '{{description}}',
    };
  }
}