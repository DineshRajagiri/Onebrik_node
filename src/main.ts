import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import passport from 'passport';
import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import * as express from 'express';
import { join } from 'path';

dotenv.config();

// Remove __v from all Mongoose documents globally
mongoose.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const logger = new Logger('Bootstrap');

  app.use(
    '/uploads',
    express.static(join(__dirname, '..', 'uploads')),
  );
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

  const port = process.env.PORT || process.env.PORT_LOCAL || 3000;
  await app.listen(port, '0.0.0.0');

  logger.log(`😼======================================================== 😼`);
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`, 'NestApplication');
  logger.log(`😼======================================================== 😼`);
  logger.log('Database connected successfully', 'NestApplication');
  logger.log(`Database URI: ${process.env.MONGODB_LOCAL_URL} ✌`, 'NestApplication');
  logger.log(`😼======================================================== 😼`);
  logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
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
