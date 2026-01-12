import { generateRSAKeyPairFromSeed } from '../util/crypto/rsa';
import { APPConfig } from '../util/config/config';
import crypto from 'crypto';
import forge from 'node-forge';
import { BLOCK_SIZE, RSA_BITS } from '../util/config/const';

export class Crypto {
    private KeyPair: forge.pki.rsa.KeyPair;

    constructor(private blockNumber: number) {}

    loadKeyPair(): Crypto {
        const seed = this.getSeed();
        const keyPair = generateRSAKeyPairFromSeed(seed, RSA_BITS);
        this.KeyPair = keyPair;
        return this;
    }

    getPublicKey(): string {
        const publicKeyPem = forge.pki.publicKeyToPem(this.KeyPair.publicKey);
        return publicKeyPem;
    }

    getSeed(): Buffer {
        const seed = crypto.hkdfSync(
            'sha256',
            Buffer.from(APPConfig.masterSecret),
            Buffer.from(this.getSeedId().toString()),
            Buffer.from('seed'),
            32,
        );
        return Buffer.from(seed);
    }

    getSeedId(): number {
        if (this.blockNumber < 0) {
            this.blockNumber = 1;
        }
        return Math.trunc(this.blockNumber / BLOCK_SIZE);
    }

    encrypt(message: string): string {
        const encrypted = this.KeyPair.publicKey.encrypt(
            forge.util.encodeUtf8(message),
            'RSA-OAEP',
            {
                md: forge.md.sha256.create(),
            },
        );
        return forge.util.encode64(encrypted);
    }

    decrypt(ciphertext: string): string {
        const encrypted = forge.util.decode64(ciphertext);
        const decrypted = this.KeyPair.privateKey.decrypt(
            encrypted,
            'RSA-OAEP',
            {
                md: forge.md.sha256.create(),
            },
        );
        return forge.util.decodeUtf8(decrypted);
    }
}
