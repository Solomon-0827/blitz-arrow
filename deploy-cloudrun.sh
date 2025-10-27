#!/bin/bash

# =============================================
# Google Cloud Run 部署脚本
# =============================================
# 使用方法：
#   ./deploy-cloudrun.sh user     # 部署用户端
#   ./deploy-cloudrun.sh admin    # 部署管理端
#   ./deploy-cloudrun.sh all      # 部署两者
# =============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_ID="${GCP_PROJECT_ID:-your-project-id}"
REGION="${GCP_REGION:-asia-east1}"
API_URL="${NEXT_PUBLIC_API_URL:-https://api.yourdomain.com}"
USER_SITE_URL="${USER_SITE_URL:-https://user.yourdomain.com}"
ADMIN_SITE_URL="${ADMIN_SITE_URL:-https://admin.yourdomain.com}"
DEFAULT_LANGUAGE="${NEXT_PUBLIC_DEFAULT_LANGUAGE:-zh-CN}"
TELEMETRY_DISABLED="${NEXT_TELEMETRY_DISABLED:-1}"

# 函数：打印信息
print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

# 函数：检查环境
check_environment() {
    print_info "检查部署环境..."
    
    # 检查 gcloud CLI
    if ! command -v gcloud &> /dev/null; then
        print_error "未找到 gcloud CLI，请先安装：https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    
    # 检查 Docker
    if ! command -v docker &> /dev/null; then
        print_error "未找到 Docker，请先安装：https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    # 检查配置
    if [ "$PROJECT_ID" = "your-project-id" ]; then
        print_error "请设置环境变量 GCP_PROJECT_ID"
        print_info "例如：export GCP_PROJECT_ID=my-project-123"
        exit 1
    fi
    
    print_success "环境检查通过"
}

# 函数：部署用户端
deploy_user() {
    print_info "开始部署用户端应用..."
    
    # 使用自定义 Dockerfile 构建并部署
    gcloud run deploy ppanel-user-web \
        --source . \
        --dockerfile docker/ppanel-user-web/Dockerfile.cloudrun \
        --platform managed \
        --region "$REGION" \
        --project "$PROJECT_ID" \
        --allow-unauthenticated \
        --port 3000 \
        --memory 1Gi \
        --cpu 1 \
        --min-instances 0 \
        --max-instances 10 \
        --timeout 300 \
        --set-env-vars "NEXT_PUBLIC_API_URL=$API_URL" \
        --set-env-vars "NEXT_PUBLIC_SITE_URL=$USER_SITE_URL" \
        --set-env-vars "NEXT_TELEMETRY_DISABLED=$TELEMETRY_DISABLED"
    
    print_success "用户端部署完成！"
    
    # 获取服务 URL
    SERVICE_URL=$(gcloud run services describe ppanel-user-web \
        --region "$REGION" \
        --project "$PROJECT_ID" \
        --format='value(status.url)')
    
    print_info "用户端 URL: $SERVICE_URL"
}

# 函数：部署管理端
deploy_admin() {
    print_info "开始部署管理端应用..."
    
    # 使用自定义 Dockerfile 构建并部署
    gcloud run deploy ppanel-admin-web \
        --source . \
        --dockerfile docker/ppanel-admin-web/Dockerfile.cloudrun \
        --platform managed \
        --region "$REGION" \
        --project "$PROJECT_ID" \
        --allow-unauthenticated \
        --port 3000 \
        --memory 1Gi \
        --cpu 1 \
        --min-instances 0 \
        --max-instances 5 \
        --timeout 300 \
        --set-env-vars "NEXT_PUBLIC_API_URL=$API_URL" \
        --set-env-vars "NEXT_PUBLIC_SITE_URL=$ADMIN_SITE_URL" \
        --set-env-vars "NEXT_TELEMETRY_DISABLED=$TELEMETRY_DISABLED"
    
    print_success "管理端部署完成！"
    
    # 获取服务 URL
    SERVICE_URL=$(gcloud run services describe ppanel-admin-web \
        --region "$REGION" \
        --project "$PROJECT_ID" \
        --format='value(status.url)')
    
    print_info "管理端 URL: $SERVICE_URL"
}

# 函数：显示帮助
show_help() {
    echo "Google Cloud Run 部署脚本"
    echo ""
    echo "使用方法："
    echo "  $0 user      # 部署用户端"
    echo "  $0 admin     # 部署管理端"
    echo "  $0 all       # 部署两者"
    echo ""
    echo "环境变量："
    echo "  GCP_PROJECT_ID              Google Cloud 项目 ID（必需）"
    echo "  GCP_REGION                  部署区域（默认：asia-east1）"
    echo "  NEXT_PUBLIC_API_URL         后端 API 地址（必需）"
    echo "  USER_SITE_URL               用户端网站地址（必需）"
    echo "  ADMIN_SITE_URL              管理端网站地址（必需）"
    echo "  NEXT_PUBLIC_DEFAULT_LANGUAGE 默认语言（可选，默认：zh-CN）"
    echo "  NEXT_TELEMETRY_DISABLED     禁用遥测（可选，默认：1）"
    echo ""
    echo "示例："
    echo "  export GCP_PROJECT_ID=my-project-123"
    echo "  export NEXT_PUBLIC_API_URL=https://api.example.com"
    echo "  export USER_SITE_URL=https://user.example.com"
    echo "  $0 all"
}

# 主逻辑
main() {
    # 打印横幅
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Google Cloud Run 部署脚本"
    echo "  Blitz Arrow (PPanel)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # 解析命令
    case "${1:-}" in
        user)
            check_environment
            deploy_user
            ;;
        admin)
            check_environment
            deploy_admin
            ;;
        all)
            check_environment
            deploy_user
            echo ""
            deploy_admin
            ;;
        -h|--help|help)
            show_help
            ;;
        *)
            print_error "无效的命令：${1:-}"
            echo ""
            show_help
            exit 1
            ;;
    esac
    
    echo ""
    print_success "🎉 部署完成！"
    echo ""
}

# 运行主函数
main "$@"

