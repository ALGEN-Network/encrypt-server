import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { DecryptRequestDto, GetPublicKeyRequestDto } from './dto/crypto';

@Controller()
export class CryptoController {
    constructor(private readonly cryptoService: CryptoService) {}

    @Get('/publickey')
    getPublickey(@Query() dto: GetPublicKeyRequestDto): { publicKey: string } {
        return { publicKey: this.cryptoService.getPublicKey(dto.blockNumber) };
    }

    @Post('/decrypt')
    decrypt(@Body() dto: DecryptRequestDto): { text: string } {
        return {
            text: this.cryptoService.decrypt(dto.blockNumber, dto.cipherText),
        };
    }
}
