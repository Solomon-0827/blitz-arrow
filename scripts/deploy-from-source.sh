#!/bin/bash
#
# 在虚拟机上从源代码构建并部署
# 这个脚本会：
# 1. 拉取最新代码
# 2. 安装依赖并构建应用
# 3. 构建 Docker 镜像
# 4. 启动容器
#

set -e

echo "========================================="
echo "  PPanel 从源代码构建并部署"
echo "========================================="
echo ""

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

PROJECT_ROOT=$(pwd)

# 检查并安装 Docker
if ! docker info > /dev/null 2>&1; then
    echo "📦 Docker 未安装，正在安装..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✓ Docker 安装完成"
    echo "⚠️  请退出并重新登录以使 Docker 组权限生效，然后重新运行此脚本"
    exit 0
fi

echo "✓ Docker 已安装"

# 检查并安装 Bun
if ! command -v bun &> /dev/null; then
    echo "📦 Bun 未安装，正在安装..."
    curl -fsSL https://bun.sh/install | bash
    
    # 配置环境变量
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
    
    # 添加到 bashrc
    if ! grep -q "BUN_INSTALL" ~/.bashrc; then
        echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
        echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
    fi
    
    # 验证安装
    if ! command -v bun &> /dev/null; then
        echo "❌ Bun 安装失败，请手动安装"
        exit 1
    fi
    echo "✓ Bun 安装完成"
fi

echo "✓ Bun 版本: $(bun --version)"
echo ""

# 如果是 Git 仓库，拉取最新代码
if [ -d ".git" ]; then
    echo "🔄 拉取最新代码..."
    git pull || echo "警告：git pull 失败，继续使用本地代码"
    echo ""
fi

echo "========================================="
echo "第一步：配置环境变量"
echo "========================================="
echo ""

VM_IP="34.177.90.11"

# 配置 Admin 环境变量
echo "📝 配置 Admin 环境变量..."
cat > apps/admin/.env.local << EOF
# PPanel Admin 环境配置
# 自动生成于: $(date)

NEXT_PUBLIC_API_URL=http://${VM_IP}:8080
NEXT_PUBLIC_SITE_URL=http://${VM_IP}:3000
EOF

# 配置 User 环境变量
echo "📝 配置 User 环境变量..."
cat > apps/user/.env.local << EOF
# PPanel User 环境配置
# 自动生成于: $(date)

NEXT_PUBLIC_API_URL=http://${VM_IP}:8080
NEXT_PUBLIC_SITE_URL=http://${VM_IP}:3001
EOF

echo "✓ 环境变量配置完成"
echo "   后端 API: http://${VM_IP}:8080"
echo "   Admin: http://${VM_IP}:3000"
echo "   User: http://${VM_IP}:3001"
echo ""

echo "========================================="
echo "第二步：安装依赖并构建应用"
echo "========================================="
echo ""

# 清理旧的构建产物
echo "🧹 清理旧的构建产物..."
rm -rf apps/admin/.next apps/user/.next 2>/dev/null || true

# 安装依赖
echo "📦 安装依赖..."
bun install

# 构建应用
echo "🔨 构建 Next.js 应用..."
bun run build

# 检查构建产物
if [ ! -d "apps/admin/.next/standalone" ]; then
    echo "❌ Admin 构建失败：缺少 standalone 输出"
    exit 1
fi

if [ ! -d "apps/user/.next/standalone" ]; then
    echo "❌ User 构建失败：缺少 standalone 输出"
    exit 1
fi

echo "✓ 应用构建成功"
echo ""

echo "========================================="
echo "第二步：构建 Docker 镜像"
echo "========================================="
echo ""

# 构建 Admin 镜像
echo "🐳 构建 Admin 镜像..."
docker build \
  -t ppanel-admin:local \
  -f docker/ppanel-admin-web/Dockerfile \
  .

# 构建 User 镜像
echo "🐳 构建 User 镜像..."
docker build \
  -t ppanel-user:local \
  -f docker/ppanel-user-web/Dockerfile \
  .

echo "✓ Docker 镜像构建成功"
echo ""

# 清理旧镜像，只保留最新的 2 个
echo "🧹 清理旧镜像（保留最新 2 个）..."

# 清理 Admin 镜像
OLD_ADMIN_IMAGES=$(docker images "ppanel-admin" --format "{{.ID}} {{.CreatedAt}}" | \
  sort -k2 -r | \
  awk 'NR>2 {print $1}')
if [ -n "$OLD_ADMIN_IMAGES" ]; then
    for img_id in $OLD_ADMIN_IMAGES; do
        echo "   删除旧 Admin 镜像: $img_id"
        docker rmi -f $img_id 2>/dev/null || true
    done
fi

# 清理 User 镜像
OLD_USER_IMAGES=$(docker images "ppanel-user" --format "{{.ID}} {{.CreatedAt}}" | \
  sort -k2 -r | \
  awk 'NR>2 {print $1}')
if [ -n "$OLD_USER_IMAGES" ]; then
    for img_id in $OLD_USER_IMAGES; do
        echo "   删除旧 User 镜像: $img_id"
        docker rmi -f $img_id 2>/dev/null || true
    done
fi

# 清理悬空镜像
docker image prune -f >/dev/null 2>&1 || true
echo "   ✓ 清理完成"
echo ""

echo "========================================="
echo "第三步：部署应用"
echo "========================================="
echo ""

# 使用项目中的 docker-compose 配置文件
COMPOSE_FILE="${PROJECT_ROOT}/docker/docker-compose.yml"

if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ 配置文件不存在: $COMPOSE_FILE"
    exit 1
fi

echo "✓ 使用配置文件: docker/docker-compose.yml"
echo "   镜像来源: 本地构建 (ppanel-admin:local, ppanel-user:local)"
echo ""

# 停止旧容器
echo "🛑 停止旧容器..."
docker compose -f "$COMPOSE_FILE" down 2>/dev/null || true

# 强制删除可能残留的容器
echo "🧹 清理残留容器..."
docker rm -f ppanel-admin ppanel-user 2>/dev/null || true

# 检查网络是否存在（应该由后端服务创建）
echo "🔧 检查网络配置..."
if docker network inspect ppanel-network >/dev/null 2>&1; then
    echo "   ✓ 网络 ppanel-network 已存在（后端创建）"
else
    echo "   ⚠️  网络 ppanel-network 不存在，正在创建..."
    echo "   （通常此网络应该由后端服务创建）"
    docker network create ppanel-network 2>/dev/null || {
        echo "   ❌ 创建网络失败，请先部署后端服务"
        exit 1
    }
    echo "   ✓ 网络创建成功"
fi

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
echo "   更新应用: cd $PROJECT_ROOT && ./scripts/deploy-from-source.sh"
echo ""

