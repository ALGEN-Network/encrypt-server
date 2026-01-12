import fs from 'fs';
import { writeFile } from 'fs/promises';
import { LRU } from '../util/cache/lru';
import { Crypto } from '../service/crypto';
import { BLOCK_SIZE } from '../util/config/const';
import { Logger } from '@nestjs/common';

class CacheService {
    private cache: LRU<Crypto> = new LRU(10);
    private maxBlockNumber: number = 0;
    private logger = new Logger('CacheService');

    constructor() {}

    initializeCache() {
        if (!fs.existsSync('.data')) {
            fs.mkdirSync('.data');
        }
        if (!fs.existsSync('.data/block')) {
            fs.writeFileSync('.data/block', '');
        }
        const data = fs.readFileSync('.data/block', 'utf-8');

        let blockNumber = parseInt(data, 10);
        if (Number.isNaN(blockNumber)) {
            blockNumber = 1;
        }
        this.maxBlockNumber = blockNumber;
        // 前计算一个
        const preCrypto = new Crypto(blockNumber - BLOCK_SIZE);
        this.cache.put(preCrypto.getSeedId(), preCrypto.loadKeyPair());
        // 当前计算一个
        const currCrypto = new Crypto(blockNumber);
        this.cache.put(currCrypto.getSeedId(), currCrypto.loadKeyPair());
        // 后计算 1 个
        const nextCrypto1 = new Crypto(blockNumber + BLOCK_SIZE);
        this.cache.put(nextCrypto1.getSeedId(), nextCrypto1.loadKeyPair());
    }

    getCrypto(blockNumber: number): Crypto {
        if (blockNumber > this.maxBlockNumber) {
            this.maxBlockNumber = blockNumber;
            writeFile('.data/block', blockNumber.toString()).catch((err) => {
                this.logger.error('write block failed', err);
            });
        }
        setImmediate(() => {
            try {
                const nextCrypto = new Crypto(this.maxBlockNumber + BLOCK_SIZE);
                if (!this.cache.get(nextCrypto.getSeedId())) {
                    this.cache.put(
                        nextCrypto.getSeedId(),
                        nextCrypto.loadKeyPair(),
                    );
                }
            } catch (err) {
                this.logger.error('preload crypto failed', err);
            }
        });
        const crypto = new Crypto(blockNumber);
        const seedId = crypto.getSeedId();
        const cachedCrypto = this.cache.get(seedId);
        if (cachedCrypto) {
            return cachedCrypto;
        }
        const newCrypto = new Crypto(blockNumber);
        this.cache.put(seedId, newCrypto.loadKeyPair());
        return newCrypto;
    }
}

export const cacheService: CacheService = new CacheService();
