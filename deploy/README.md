# Deploy Scripts

本目录包含 GCP 虚拟机部署所需的脚本。

## 文件说明

- **1-setup-vm.sh**: 虚拟机初始化脚本
  - 安装 Docker
  - 配置防火墙
  - 创建必要的目录

## 使用方法

### 首次部署

```bash
# 在虚拟机上运行
cd ~/ppanel
./1-setup-vm.sh

# 重新登录后
cd ~/blitz-arrow
./scripts/deploy-from-source.sh
```

完整部署指南请参考项目根目录的 `DEPLOYMENT.md` 文件。
