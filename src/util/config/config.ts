import YAML from 'yaml';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs';
import _ from 'lodash';
export const sysEnv = (): string => {
    if (!process.env.NODE_ENV) {
        return 'development';
    }
    return process.env.NODE_ENV;
};

type Config = {
    port: number;
    masterSecret: string;
    ipWhitelist?: string[]; // IP 白名单，支持精确 IP 和 CIDR 格式
};

export let APPConfig: Config = {} as Config;

export const initializeConfig = async () => {
    const env = sysEnv();
    const files = await glob(
        path.join(__dirname, `../../../config.${env}.*.{yaml,yml}`),
    );

    APPConfig = [path.join(__dirname, `../../../config.${env}.yaml`), ...files]
        .map((file: string) => fs.readFileSync(file, 'utf8'))
        .map((content: string) => YAML.parse(content) as Config)
        .reduce((prev: Config, curr: Config) => {
            return _.merge(prev, curr);
        });

    // 配置校验
    validateConfig(APPConfig);
};

function validateConfig(config: Config): void {
    if (!config.masterSecret || config.masterSecret.trim() === '') {
        throw new Error('Configuration error: masterSecret is required');
    }
}
