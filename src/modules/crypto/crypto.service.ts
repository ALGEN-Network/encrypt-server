import { Injectable } from '@nestjs/common';
import { cacheService } from '../../service/cache';

@Injectable()
export class CryptoService {
    getPublicKey(blockNumber: number): string {
        const crypto = cacheService.getCrypto(blockNumber);
        return crypto.getPublicKey();
    }

    encrypt(blockNumber: number, message: string): string {
        const crypto = cacheService.getCrypto(blockNumber);
        return crypto.encrypt(message);
    }
    decrypt(blockNumber: number, ciphertext: string): string {
        const crypto = cacheService.getCrypto(blockNumber);
        return crypto.decrypt(ciphertext);
    }
}
