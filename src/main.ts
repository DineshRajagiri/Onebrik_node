import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import passport from 'passport';
import * as dotenv from 'dotenv';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const logger = new Logger('Bootstrap');

  // Global configuration
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  app.use(passport.initialize());
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger configuration with error isolation - Documentation errors won't affect the main app
  try {
    logger.log('Setting up Swagger documentation...', 'Documentation');
    
    const config = new DocumentBuilder()
      .setTitle('OneBrik API')
      .setDescription('OneBrik E-commerce Platform API Documentation')
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth'
      )
      .addServer('http://localhost:3000', 'Development Server')
      .addServer('https://api.onebrik.com', 'Production Server')
      .addTag('Authentication', 'User and admin authentication endpoints')
      .addTag('Users Management', 'User, admin, vendor, and delivery partner management')
      .addTag('Inventory Management', 'Product, category, and inventory management')
      .addTag('Permission Management', 'Role-based access control and permissions')
      .addTag('Customer Operations', 'Customer-facing operations like cart, orders, addresses')
      .build();

    // Create document with manual documentation only - no auto-generation
    const document = SwaggerModule.createDocument(app, config, {
      ignoreGlobalPrefix: false,
      deepScanRoutes: false, // Disable auto-scanning of routes
      include: [], // Only include manually documented modules
      extraModels: [], // Don't include any DTO models
      operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    });
    
    SwaggerModule.setup('api-doc', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
      customSiteTitle: 'OneBrik API Documentation',
      customfavIcon: '/favicon.ico',
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { color: #3b82f6 }
      `,
    });

    logger.log('✅ Swagger documentation setup completed successfully', 'Documentation');
  } catch (error) {
    logger.error('❌ Failed to setup Swagger documentation. Application will continue without documentation.', 'Documentation');
    logger.error(`Documentation Error: ${error.message}`, 'Documentation');
    logger.warn('⚠️  API endpoints will work normally, only documentation is unavailable', 'Documentation');
  }

  const port = process.env.PORT || process.env.PORT_LOCAL || 3000;
  await app.listen(port, '0.0.0.0');
  
  logger.log(`😼======================================================== 😼`);
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`, 'NestApplication');
  logger.log(`😼======================================================== 😼`);
  logger.log('Database connected successfully', 'NestApplication');
  logger.log(`Database URI: ${process.env.MONGODB_LOCAL_URL} ✌`, 'NestApplication');
  logger.log(`😼======================================================== 😼`);
  logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api-doc (if available)`);
  logger.log(`😼======================================================== 😼`);

  const figlet = require('figlet');
  figlet('O N E B R I K', (err: any, data: any) => {
    if (err) {
      console.log('Something went wrong...');
      console.dir(err);
      return;
    }
    console.log(data);
  });
}

bootstrap();
