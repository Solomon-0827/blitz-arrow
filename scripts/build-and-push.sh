#!/bin/bash
#
# 在本地构建多架构 Docker 镜像并推送到 Docker Hub
# 适用于 Mac (ARM64) 构建支持 AMD64 的镜像
#

set -e

# 配置
DOCKER_USERNAME="huyedong"  # 修改为你的 Docker Hub 用户名
IMAGE_PREFIX="${DOCKER_USERNAME}/ppanel"
VERSION="latest"

echo "========================================="
echo "  构建并推送 Docker 镜像到 Docker Hub"
echo "========================================="
echo ""

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行"
    exit 1
fi

# 登录 Docker Hub
echo "🔐 登录 Docker Hub..."
echo "提示：如果没有登录，请先运行 'docker login'"
echo ""

# 检查是否已登录
if ! docker info | grep -q "Username"; then
    docker login
fi

echo "========================================="
echo "第一步：构建 Next.js 应用"
echo "========================================="
echo ""

# 清理旧的构建产物
echo "🧹 清理旧的构建产物..."
rm -rf apps/admin/.next apps/user/.next 2>/dev/null || true

# 安装依赖
echo "📦 安装依赖..."
bun install --frozen-lockfile

# 构建应用
echo "🔨 构建 Next.js 应用..."
bun run build

# 检查构建产物
if [ ! -d "apps/admin/.next/standalone" ]; then
    echo "❌ Admin 构建失败"
    exit 1
fi

if [ ! -d "apps/user/.next/standalone" ]; then
    echo "❌ User 构建失败"
    exit 1
fi

echo "✓ 应用构建成功"
echo ""

echo "========================================="
echo "第二步：构建并推送 Docker 镜像"
echo "========================================="
echo ""

# 设置 buildx（如果还没有）
echo "🔧 设置 Docker Buildx..."
docker buildx create --use --name ppanel-builder 2>/dev/null || docker buildx use ppanel-builder || true

# 构建并推送 Admin 镜像（支持多架构）
echo "🐳 构建并推送 Admin 镜像 (AMD64)..."
docker buildx build \
  --platform linux/amd64 \
  --tag ${IMAGE_PREFIX}-admin:${VERSION} \
  --tag ${IMAGE_PREFIX}-admin:$(date +%Y%m%d) \
  --file docker/ppanel-admin-web/Dockerfile \
  --push \
  .

# 构建并推送 User 镜像（支持多架构）
echo "🐳 构建并推送 User 镜像 (AMD64)..."
docker buildx build \
  --platform linux/amd64 \
  --tag ${IMAGE_PREFIX}-user:${VERSION} \
  --tag ${IMAGE_PREFIX}-user:$(date +%Y%m%d) \
  --file docker/ppanel-user-web/Dockerfile \
  --push \
  .

echo ""
echo "========================================="
echo "✅ 构建并推送完成！"
echo "========================================="
echo ""
echo "📦 推送的镜像："
echo "   ${IMAGE_PREFIX}-admin:${VERSION}"
echo "   ${IMAGE_PREFIX}-user:${VERSION}"
echo ""
echo "🚀 下一步：在虚拟机上运行部署脚本"
echo "   ssh 连接到虚拟机"
echo "   cd ~/blitz-arrow"
echo "   git pull"
echo "   ./scripts/deploy-from-registry.sh"
echo ""

