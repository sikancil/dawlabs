import { Injectable } from '@nestjs/common';
import { Create{{className}}Dto } from './dto/create-{{className}}.dto';

@Injectable()
export class AppService {
  getHello(): { message: string; timestamp: Date; version: string } {
    return {
      message: 'Welcome to {{className}} API!',
      timestamp: new Date(),
      version: '1.0.0',
    };
  }

  processData(create{{className}}Dto: Create{{className}}Dto) {
    console.log('Processing data:', create{{className}}Dto);

    return {
      success: true,
      data: create{{className}}Dto,
      processedAt: new Date(),
      message: 'Data processed successfully',
    };
  }

  getHealth(): { status: string; timestamp: Date; uptime: number } {
    return {
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime(),
    };
  }
}