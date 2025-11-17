#!/bin/bash
#
# 虚拟机初始化脚本 - 安装 Docker 和必要工具
# 在 GCP 虚拟机上运行此脚本
#

set -e

echo "========================================="
echo "  PPanel 虚拟机环境初始化"
echo "========================================="
echo ""

# 更新系统
echo "📦 更新系统软件包..."
sudo apt-get update
sudo apt-get upgrade -y

# 安装必要工具
echo "🔧 安装必要工具..."
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    vim \
    htop \
    ufw

# 安装 Docker
echo "🐳 安装 Docker..."
if ! command -v docker &> /dev/null; then
    # 添加 Docker 官方 GPG 密钥
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    # 设置 Docker 仓库
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # 安装 Docker Engine
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # 将当前用户添加到 docker 组
    sudo usermod -aG docker $USER
    
    echo "✅ Docker 安装完成"
else
    echo "✅ Docker 已安装"
fi

# 启动 Docker 服务
echo "🚀 启动 Docker 服务..."
sudo systemctl enable docker
sudo systemctl start docker

# 配置防火墙
echo "🔒 配置防火墙..."
sudo ufw --force enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Admin
sudo ufw allow 3001/tcp  # User
sudo ufw reload

# 创建应用目录
echo "📁 创建应用目录..."
mkdir -p ~/ppanel
cd ~/ppanel

# 显示 Docker 版本
echo ""
echo "========================================="
echo "✅ 环境初始化完成！"
echo "========================================="
echo ""
docker --version
docker compose version
echo ""
echo "📝 注意：请先登出再登录以使 Docker 组权限生效"
echo "   运行命令: exit"
echo "   然后重新连接 SSH"
echo ""

