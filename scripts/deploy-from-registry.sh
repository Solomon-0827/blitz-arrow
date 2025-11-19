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
echo "步骤 1：部署应用"
echo "========================================="
echo ""

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

PROJECT_ROOT=$(pwd)
COMPOSE_FILE="${PROJECT_ROOT}/docker/docker-compose.yml"

if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ 配置文件不存在: $COMPOSE_FILE"
    exit 1
fi

echo "✓ 使用配置文件: docker/docker-compose.yml"
echo "   镜像来源: Docker Hub (${IMAGE_PREFIX}-admin:${VERSION}, ${IMAGE_PREFIX}-user:${VERSION})"
echo ""

# 设置环境变量供 docker-compose 使用
export IMAGE_ADMIN="${IMAGE_PREFIX}-admin:${VERSION}"
export IMAGE_USER="${IMAGE_PREFIX}-user:${VERSION}"

# 停止旧容器
echo "🛑 停止旧容器..."
docker compose -f "$COMPOSE_FILE" down 2>/dev/null || true

# 强制删除可能残留的容器
echo "🧹 清理残留容器..."
docker rm -f ppanel-admin ppanel-user 2>/dev/null || true

# 清理可能存在的网络冲突
echo "🔧 检查网络配置..."
if docker network inspect ppanel-network >/dev/null 2>&1; then
    echo "   网络 ppanel-network 已存在，将复用"
else
    echo "   创建网络 ppanel-network"
    docker network create ppanel-network 2>/dev/null || true
fi

# 拉取最新镜像
echo "📥 拉取最新镜像..."
docker compose -f "$COMPOSE_FILE" pull

# 启动新容器
echo "🚀 启动应用..."
docker compose -f "$COMPOSE_FILE" up -d

# 等待容器启动
echo "⏳ 等待容器启动..."
sleep 5

# 显示状态
echo ""
echo "========================================="
echo "📊 容器状态"
echo "========================================="
docker compose -f "$COMPOSE_FILE" ps

# 显示日志
echo ""
echo "========================================="
echo "📝 最近日志"
echo "========================================="
docker compose -f "$COMPOSE_FILE" logs --tail=20

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
echo "   查看日志: docker compose -f docker/docker-compose.yml logs -f"
echo "   重启应用: docker compose -f docker/docker-compose.yml restart"
echo "   停止应用: docker compose -f docker/docker-compose.yml down"
echo ""

