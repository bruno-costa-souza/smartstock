import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { mkdirSync } from 'fs';
import helmet from 'helmet';
import { AppModule } from './app.module';

function validateSecrets() {
  const jwtSecret = process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!jwtSecret || !refreshSecret) {
    throw new Error('JWT_SECRET e JWT_REFRESH_SECRET são obrigatórios');
  }

  if (process.env.NODE_ENV === 'production') {
    if (jwtSecret.length < 32 || refreshSecret.length < 32) {
      throw new Error('JWT secrets devem ter no mínimo 32 caracteres em produção');
    }
  }
}

async function bootstrap() {
  validateSecrets();

  const uploadsDir = join(process.cwd(), 'uploads');
  mkdirSync(uploadsDir, { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Necessário atrás de um proxy reverso (Railway, Vercel, etc.) para que
  // req.ip reflita o IP real do cliente (via X-Forwarded-For) em vez do
  // proxy — sem isso o rate limiting por IP fica incorreto.
  app.set('trust proxy', 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.useStaticAssets(uploadsDir, {
    prefix: '/uploads',
    setHeaders: (res) => res.setHeader('Content-Disposition', 'inline'),
  });

  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.devtunnels.ms')) {
        callback(null, true);
      } else {
        callback(new Error(`CORS bloqueado: ${origin}`));
      }
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Papelaria API')
      .setDescription('API de gerenciamento de estoque e catálogo de papelaria')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('vitrine', 'Catálogo público de produtos')
      .addTag('auth', 'Autenticação')
      .addTag('produtos', 'Gerenciamento de produtos (admin)')
      .addTag('estoque', 'Controle de estoque (admin)')
      .build();

    SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, config));
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Papelaria API rodando na porta ${port}`);
  console.log(`Swagger: http://localhost:${port}/api`);
}

bootstrap();
