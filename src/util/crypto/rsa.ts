import forge from 'node-forge';
import crypto from 'crypto';

export const generateRSAKeyPairFromSeed = (seed: Buffer, bits = 2048): forge.pki.rsa.KeyPair => {
    const prng = forge.random.createInstance();
    let counter = 0;
    const seedBuffer = seed;
    // @ts-ignore
    prng.getBytesSync = function (count: number): string {
        const result: number[] = [];
        while (result.length < count) {
            const hmac = crypto.createHmac('sha256', seedBuffer);
            hmac.update(
                Buffer.from([(counter >> 24) & 0xff, (counter >> 16) & 0xff, (counter >> 8) & 0xff, counter & 0xff]),
            );
            const hash = hmac.digest();
            for (let i = 0; i < hash.length && result.length < count; i++) {
                result.push(hash[i]);
            }
            counter++;
        }
        return Buffer.from(result).toString('binary');
    };

    const keypair = forge.pki.rsa.generateKeyPair({
        bits: bits,
        e: 0x10001, // 标准的 RSA 公钥指数 (65537)
        prng: prng,
        workers: -1, // 禁用 Web Workers，确保同步执行
    });
    return keypair;
};
