import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import passport from 'passport';
// import "reflect-metadata";
 import * as dotenv from 'dotenv';
import { JwtAuthGuard } from './auth/guards/jwt.guard';
// import { initializeFirebase } from './notification/config/firebase-init';
// import { initializeFirebase } from './notification/config/firebase.config';
import './notification/config/firebase-init';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // Swagger implementation
  
  // initializeFirebase();
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.use(passport.initialize());
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Chat App')
    .setDescription(`A ChatApp's API`)
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-doc', app, document);

  const port = process.env.PORT_LOCAL || 3000; 

  await app.listen(port);

  const logger = new Logger();

  logger.log(`😼======================================================== 😼`);

  logger.log(`Environment Variable`, 'NestApplication');

  logger.log(`😼======================================================== 😼`);

  logger.log(
    `HTTP Server running on http://localhost:${port} ✌`,
    'NestApplication',
  );

  logger.log(
    `Database URI: ${process.env.MONGODB_LOCAL_URL} ✌`,
    'NestApplication',
  );

  logger.log(`😼 ======================================================== 😼`);

  const figlet = require('figlet');

  figlet('I N V O I C E T R A D E S', function (err, data) {
    if (err) {
      console.log('Something went wrong...');
      console.dir(err);
      return;
    }
    console.log(data);
  });
}
bootstrap();
