import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import session from 'express-session';
import methodOverride from 'method-override';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const hbs = require('hbs');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // View engine setup - Handlebars
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  // Register Handlebars partials
  hbs.registerPartials(join(__dirname, '..', 'views', 'partials'));

  // Register Handlebars helpers
  hbs.registerHelper('eq', function (a: any, b: any) {
    return a == b;
  });
  hbs.registerHelper('formatDate', function (date: Date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  });
  hbs.registerHelper('formatCurrency', function (amount: number) {
    if (!amount) return 'Rp 0';
    return 'Rp ' + Number(amount).toLocaleString('id-ID');
  });
  hbs.registerHelper('range', function (start: number, end: number, options: any) {
    let result = '';
    for (let i = start; i <= end; i++) {
      result += options.fn(i);
    }
    return result;
  });
  hbs.registerHelper('add', function (a: number, b: number) {
    return a + b;
  });
  hbs.registerHelper('subtract', function (a: number, b: number) {
    return a - b;
  });
  hbs.registerHelper('gt', function (a: number, b: number) {
    return a > b;
  });
  hbs.registerHelper('lt', function (a: number, b: number) {
    return a < b;
  });
  hbs.registerHelper('multiply', function (a: number, b: number) {
    return a * b;
  });
  hbs.registerHelper('json', function (context: any) {
    return JSON.stringify(context);
  });

  // Static assets
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Session middleware
  app.use(
    session({
      secret: 'dot-indonesia-admin-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000, // 1 hour
      },
    }),
  );

  // Method override for PUT/DELETE from forms
  app.use(methodOverride('_method'));

  // Flash messages middleware (simple custom implementation)
  app.use((req: any, _res: any, next: any) => {
    if (!req.session.flash) {
      req.session.flash = {};
    }
    req.flash = function (type?: string, message?: string) {
      if (type && message) {
        req.session.flash[type] = message;
      } else if (type) {
        const msg = req.session.flash[type];
        delete req.session.flash[type];
        return msg;
      }
      return req.session.flash;
    };
    next();
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3001);
  console.log(`Application is running on: http://127.0.0.1:${process.env.PORT ?? 3001}`);
}
bootstrap();
