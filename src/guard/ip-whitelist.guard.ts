import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { APPConfig } from '../util/config/config';

@Injectable()
export class IpWhitelistGuard implements CanActivate {
    private readonly logger = new Logger('IpWhitelistGuard');

    canActivate(context: ExecutionContext): boolean {
        const whitelist: string[] = APPConfig.ipWhitelist ?? [];

        // 如果白名单为空或未配置，则允许所有请求
        if (whitelist.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const clientIp = this.getClientIp(request);

        this.logger.debug(`Client IP: ${clientIp}`);

        if (this.isIpAllowed(clientIp, whitelist)) {
            return true;
        }

        this.logger.warn(`Blocked request from IP: ${clientIp}`);
        throw new ForbiddenException(`Access denied: IP ${clientIp} is not in the whitelist`);
    }

    /**
     * 获取客户端真实 IP
     * 支持代理场景（X-Forwarded-For, X-Real-IP）
     */
    private getClientIp(request: Request): string {
        const xForwardedFor = request.headers['x-forwarded-for'];
        if (xForwardedFor) {
            // X-Forwarded-For 可能包含多个 IP，取第一个（真实客户端 IP）
            const ips = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor.split(',')[0];
            return ips.trim();
        }

        const xRealIp = request.headers['x-real-ip'];

        if (xRealIp) {
            return Array.isArray(xRealIp) ? xRealIp[0] : xRealIp;
        }

        // 处理 IPv6 映射的 IPv4 地址
        let ip = request.ip || request.socket.remoteAddress || '';
        if (ip.startsWith('::ffff:')) {
            ip = ip.substring(7);
        }

        return ip;
    }

    /**
     * 检查 IP 是否在白名单中
     * 支持精确匹配和 CIDR 格式
     */
    private isIpAllowed(clientIp: string, whitelist: string[]): boolean {
        for (const allowed of whitelist) {
            // 精确匹配
            if (clientIp === allowed) {
                return true;
            }

            // CIDR 匹配
            if (allowed.includes('/')) {
                if (this.isIpInCidr(clientIp, allowed)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 检查 IP 是否在 CIDR 范围内
     */
    private isIpInCidr(ip: string, cidr: string): boolean {
        try {
            const [range, bits] = cidr.split('/');
            const mask = parseInt(bits, 10);

            if (this.isIPv4(ip) && this.isIPv4(range)) {
                return this.ipv4InCidr(ip, range, mask);
            }

            // IPv6 暂不支持 CIDR，仅支持精确匹配
            return false;
        } catch {
            return false;
        }
    }

    private isIPv4(ip: string): boolean {
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
        return ipv4Regex.test(ip);
    }

    private ipv4InCidr(ip: string, range: string, mask: number): boolean {
        const ipNum = this.ipv4ToNumber(ip);
        const rangeNum = this.ipv4ToNumber(range);
        // 转换为无符号整数
        const maskNum = ~(2 ** (32 - mask) - 1) >>> 0;

        return (ipNum & maskNum) === (rangeNum & maskNum);
    }

    private ipv4ToNumber(ip: string): number {
        const parts = ip.split('.').map(Number);
        // 转换为无符号整数
        return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
    }
}
