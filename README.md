# 配置文件

project/config.{NODE_ENV}.yaml

```yaml
port: 8081

masterSecret: test-master-secret

# IP 白名单配置（为空或不配置则允许所有 IP）
# 支持精确 IP 和 CIDR 格式
ipWhitelist:
    - 127.0.0.1
    - ::1
    - 10.0.0.0/8 # 内网 10.x.x.x
    - 192.168.1.0/24 # 内网 192.168.1.x
```

# 启动脚本

```bash
./deploy.sh <tag> [env]
```
