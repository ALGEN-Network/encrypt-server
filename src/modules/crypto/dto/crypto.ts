import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class GetPublicKeyRequestDto {
    @IsNumber()
    @Min(1)
    blockNumber: number;

    @IsString()
    @IsOptional()
    version?: string;
}

export class DecryptRequestDto {
    @IsNumber()
    @Min(1)
    blockNumber: number;

    @IsString()
    cipherText: string;

    @IsString()
    @IsOptional()
    version?: string;
}
