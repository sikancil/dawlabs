import { Injectable } from '@nestjs/common';

export @Injectable()
class AppService {
  getHello() {
    return {
      message: 'Welcome to {{className}} API!',
      timestamp: new Date(),
      version: '1.0.0',
    };
  }

  processData(create{{className}}Dto) {
    console.log('Processing data:', create{{className}}Dto);

    return {
      success: true,
      data: create{{className}}Dto,
      processedAt: new Date(),
      message: 'Data processed successfully',
    };
  }

  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime(),
    };
  }
}
