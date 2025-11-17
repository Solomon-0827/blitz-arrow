#!/bin/bash
#
# 在虚拟机上从 Docker Hub 拉取镜像并部署
# 快速部署，不需要在虚拟机上构建
#

set -e

# 配置
DOCKER_USERNAME="huyedong"  # 修改为你的 Docker Hub 用户名
IMAGE_PREFIX="${DOCKER_USERNAME}/ppanel"
VERSION="latest"

echo "========================================="
echo "  从 Docker Hub 部署 PPanel"
echo "========================================="
echo ""

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先运行 ./deploy/1-setup-vm.sh"
    exit 1
fi

# 拉取最新代码
if [ -d ".git" ]; then
    echo "🔄 拉取最新代码..."
    git pull || echo "警告：git pull 失败，继续使用本地代码"
    echo ""
fi

echo "========================================="
echo "步骤 1：拉取 Docker 镜像"
echo "========================================="
echo ""

# 拉取 Admin 镜像
echo "📥 拉取 Admin 镜像..."
docker pull ${IMAGE_PREFIX}-admin:${VERSION}

# 拉取 User 镜像
echo "📥 拉取 User 镜像..."
docker pull ${IMAGE_PREFIX}-user:${VERSION}

echo "✓ 镜像拉取成功"
echo ""

echo "========================================="
echo "步骤 2：部署应用"
echo "========================================="
echo ""

# 创建 docker-compose 配置
cat > /tmp/docker-compose-registry.yml << EOF
version: '3.8'

services:
  admin:
    image: ${IMAGE_PREFIX}-admin:${VERSION}
    container_name: ppanel-admin
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.ppanel.dev
      - PORT=3000
      - HOSTNAME=0.0.0.0
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  user:
    image: ${IMAGE_PREFIX}-user:${VERSION}
    container_name: ppanel-user
    restart: always
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.ppanel.dev
      - PORT=3000
      - HOSTNAME=0.0.0.0
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  default:
    name: ppanel-network
EOF

# 停止旧容器
echo "🛑 停止旧容器..."
docker compose -f /tmp/docker-compose-registry.yml down 2>/dev/null || true

# 启动新容器
echo "🚀 启动应用..."
docker compose -f /tmp/docker-compose-registry.yml up -d

# 等待容器启动
echo "⏳ 等待容器启动..."
sleep 5

# 显示状态
echo ""
echo "========================================="
echo "📊 容器状态"
echo "========================================="
docker compose -f /tmp/docker-compose-registry.yml ps

# 显示日志
echo ""
echo "========================================="
echo "📝 最近日志"
echo "========================================="
docker compose -f /tmp/docker-compose-registry.yml logs --tail=20

echo ""
echo "========================================="
echo "✅ 部署完成！"
echo "========================================="
echo ""
echo "🌐 访问地址："
echo "   Admin 管理后台: http://$(curl -s ifconfig.me):3000"
echo "   User  用户前端: http://$(curl -s ifconfig.me):3001"
echo ""
echo "📝 管理命令："
echo "   查看日志: docker compose -f /tmp/docker-compose-registry.yml logs -f"
echo "   重启应用: docker compose -f /tmp/docker-compose-registry.yml restart"
echo "   停止应用: docker compose -f /tmp/docker-compose-registry.yml down"
echo ""

