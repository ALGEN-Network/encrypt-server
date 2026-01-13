import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CryptoModule } from './crypto/crypto.module';
import { IpWhitelistGuard } from '../guard/ip-whitelist.guard';

@Module({
    imports: [CryptoModule],
    controllers: [],
    providers: [
        {
            provide: APP_GUARD,
            useClass: IpWhitelistGuard,
        },
    ],
})
export class AppModule {}
