import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import passport from 'passport';
// import "reflect-metadata";
 import * as dotenv from 'dotenv';
//import { JwtAuthGuard } from './auth/guards/jwt.guard';
// import { initializeFirebase } from './notification/config/firebase-init';
// import { initializeFirebase } from './notification/config/firebase.config';
//import './notification/config/firebase-init';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // Swagger implementation
  
  // initializeFirebase();
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.use(passport.initialize());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Chat App')
    .setDescription(`A ChatApp's API`)
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-doc', app, document);

  const port = process.env.PORT || process.env.PORT_LOCAL || 3000; 

  await app.listen(port, '0.0.0.0');

  const logger = new Logger();

  logger.log(`😼======================================================== 😼`);

  logger.log(`Environment Variable`, 'NestApplication');

  logger.log(`😼======================================================== 😼`);

  logger.log('Database connected successfully', 'NestApplication');

  logger.log(
    `Database URI: ${process.env.MONGODB_LOCAL_URL} ✌`,
    'NestApplication',
  );

  logger.log(`😼 ======================================================== 😼`);

  const figlet = require('figlet');

  figlet('O N E B R I K', function (err, data) {
    if (err) {
      console.log('Something went wrong...');
      console.dir(err);
      return;
    }
    console.log(data);
  });
}
bootstrap();
