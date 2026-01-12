import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { initializeConfig, APPConfig, sysEnv } from './util/config/config';
import { cacheService } from './service/cache';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    logger.log('NODE_ENV = ' + sysEnv());
    await initializeConfig();
    logger.log('load config:', JSON.stringify(APPConfig, null, 2));
    logger.log('initialize cache');
    cacheService.initializeCache();
    logger.log('initialize cache completed');
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );
    await app.listen(APPConfig.port ?? 3000);
}
void bootstrap();
