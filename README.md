# PPanel Web

<div align="center">

**[English](#english)** | **[中文](#中文)**

</div>

---

## English

### 📖 About

PPanel Web is a modern web application built with Next.js, TypeScript, and TailwindCSS. This is a monorepo project containing two applications:

- **User Web** - User-facing application
- **Admin Web** - Administrative dashboard

### 🛠️ Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript 5
- **Styling**: TailwindCSS
- **Package Manager**: Bun 1.1.43
- **Build Tool**: Turbo
- **Internationalization**: next-intl (24 languages supported)

### 🔧 Git Setup

If you're setting up this project for Git version control:

**Quick initialization:**
```bash
# Automated setup
./scripts/git-init.sh

# Or manual setup
git add .
git commit -m "chore: initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: >= 20
- **Bun**: >= 1.1.43

To install Bun:
```bash
curl -fsSL https://bun.sh/install | bash
```

### 🚀 Getting Started

#### 1. Install Dependencies

```bash
cd /path/to/ppanel-web
bun install
```

#### 2. Development

Start both applications simultaneously:
```bash
bun dev
```

This will start:
- **Admin Web**: http://localhost:3000
- **User Web**: http://localhost:3001

Or start individual applications:
```bash
# Admin Web only
cd apps/admin
bun dev

# User Web only
cd apps/user
bun dev
```

#### 3. Production Build

Build all applications:
```bash
bun build
```

Build individual applications:
```bash
# Build Admin Web
cd apps/admin
bun run build

# Build User Web
cd apps/user
bun run build
```

#### 4. Start Production Server

After building, start the production server:
```bash
# Admin Web
cd apps/admin
bun start

# User Web
cd apps/user
bun start
```

### 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start development server for all apps |
| `bun build` | Build all applications for production |
| `bun lint` | Run linter on all packages |
| `bun prettier` | Format code with Prettier |
| `bun clean` | Clean build outputs and dependencies |
| `bun locale` | Generate locale files |
| `bun openapi` | Generate OpenAPI types |
| `bun update:deps` | Update dependencies |
| `bun update:shadcn` | Update shadcn/ui components |

### 📁 Project Structure

```
ppanel-web/
├── apps/
│   ├── admin/          # Admin dashboard application
│   └── user/           # User-facing application
├── packages/
│   ├── ui/             # Shared UI components
│   ├── eslint-config/  # Shared ESLint configuration
│   ├── prettier-config/# Shared Prettier configuration
│   └── typescript-config/ # Shared TypeScript configuration
├── scripts/            # Utility scripts
└── docker/             # Docker configuration files
```

### ⚙️ Configuration

#### Backend API

⚠️ **Important**: This is a **frontend-only** project that requires a separate backend API server.

The default backend API address is hardcoded as `http://192.168.72.128:8080`. You need to:
1. Set up your own PPanel backend server, or
2. Configure the API URL to point to your backend server

#### Environment Variables

Create `.env.local` files in the respective application directories:

**apps/admin/.env.local**
```env
# Backend API URL (Required)
NEXT_PUBLIC_API_URL=http://your-backend-server:8080

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# CDN URL (Optional)
# NEXT_PUBLIC_CDN_URL=https://your-cdn.com

# Default user email (Optional)
# NEXT_PUBLIC_DEFAULT_USER_EMAIL=admin@example.com
```

**apps/user/.env.local**
```env
# Backend API URL (Required)
NEXT_PUBLIC_API_URL=http://your-backend-server:8080

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3001

# CDN URL (Optional)
# NEXT_PUBLIC_CDN_URL=https://your-cdn.com
```

**Note**: Replace `your-backend-server:8080` with your actual backend API address.

### 🚢 Deployment

#### Docker Deployment

Build Docker images:
```bash
# Build Admin Web
docker build -f docker/ppanel-admin-web/Dockerfile -t ppanel-admin-web .

# Build User Web
docker build -f docker/ppanel-user-web/Dockerfile -t ppanel-user-web .
```

Or use Docker Compose:
```bash
cd docker
docker-compose up -d
```

#### Google Cloud Run Deployment

This project is configured to deploy two separate Cloud Run services:
- **User Web Service** (`ppanel-user-web`) - User-facing application
- **Admin Web Service** (`ppanel-admin-web`) - Administrative dashboard

**Method 1: Using deployment script (Recommended)**

```bash
# 1. Set required environment variables
export GCP_PROJECT_ID=your-project-id
export NEXT_PUBLIC_API_URL=https://api.yourdomain.com
export USER_SITE_URL=https://user.yourdomain.com
export ADMIN_SITE_URL=https://admin.yourdomain.com

# 2. Deploy both applications
./deploy-cloudrun.sh all

# Or deploy individually
./deploy-cloudrun.sh user   # User web only
./deploy-cloudrun.sh admin  # Admin web only
```

**Method 2: Using gcloud CLI directly**

Deploy user web:
```bash
gcloud run deploy ppanel-user-web \
  --source . \
  --dockerfile docker/ppanel-user-web/Dockerfile.cloudrun \
  --region asia-east1 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
  --set-env-vars NEXT_PUBLIC_SITE_URL=https://user.yourdomain.com
```

Deploy admin web:
```bash
gcloud run deploy ppanel-admin-web \
  --source . \
  --dockerfile docker/ppanel-admin-web/Dockerfile.cloudrun \
  --region asia-east1 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
  --set-env-vars NEXT_PUBLIC_SITE_URL=https://admin.yourdomain.com
```

**Method 3: Using Cloud Build (CI/CD)**

1. Set up Cloud Build trigger connected to your repository
2. Configure environment variables in Cloud Build
3. Each push will automatically build and deploy both services

**Environment Variables**

Required:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_SITE_URL` - Frontend site URL

Optional (with defaults):
- `NEXT_PUBLIC_DEFAULT_LANGUAGE` - Default language (default: `zh-CN`)
- `NEXT_TELEMETRY_DISABLED` - Disable telemetry (default: `1`)

See `env.example` for all available environment variables.

**After Deployment**

Each service will get a unique Cloud Run URL:
- User Web: `https://ppanel-user-web-[hash]-[region].run.app`
- Admin Web: `https://ppanel-admin-web-[hash]-[region].run.app`

You can map custom domains to these services using:
```bash
gcloud run domain-mappings create --service ppanel-user-web --domain user.yourdomain.com
gcloud run domain-mappings create --service ppanel-admin-web --domain admin.yourdomain.com
```

### ⚠️ Important Notes

1. **Backend Required**: This is a **frontend-only** project. You need to set up a separate PPanel backend server. The frontend will connect to `http://192.168.72.128:8080` by default.
2. **Package Manager**: This project uses Bun as the package manager. Do not use npm or yarn.
3. **Node Version**: Ensure Node.js version is >= 20
4. **Install at Root**: Always run `bun install` at the project root, not in individual app directories. The monorepo structure will automatically handle all workspace dependencies.
5. **Environment Files**: Configure environment variables (especially `NEXT_PUBLIC_API_URL`) before running the application
6. **Port Conflicts**: Make sure ports 3000 (admin) and 3001 (user) are available
7. **Turbo Cache**: First build might take longer; subsequent builds will be faster with Turbo cache
8. **Missing Dependencies**: If you encounter "Cannot find module" errors, run `bun install` at the root directory again

### 📜 License

This project is licensed under the GUN License.

---

## 中文

### 📖 关于项目

PPanel Web 是一个使用 Next.js、TypeScript 和 TailwindCSS 构建的现代化 Web 应用。这是一个 Monorepo 项目，包含两个应用程序：

- **用户端** - 面向用户的应用程序
- **管理端** - 管理后台控制面板

### 🛠️ 技术栈

- **框架**: Next.js 15
- **语言**: TypeScript 5
- **样式**: TailwindCSS
- **包管理器**: Bun 1.1.43
- **构建工具**: Turbo
- **国际化**: next-intl（支持 24 种语言）

### 🔧 Git 配置

如果你需要为此项目设置 Git 版本控制：

**快速初始化：**
```bash
# 自动化设置
./scripts/git-init.sh

# 或手动设置
git add .
git commit -m "chore: 初始化提交"
git remote add origin <你的仓库地址>
git push -u origin main
```

### 📋 环境要求

开始之前，请确保已安装以下软件：

- **Node.js**: >= 20
- **Bun**: >= 1.1.43

安装 Bun：
```bash
curl -fsSL https://bun.sh/install | bash
```

### 🚀 快速开始

#### 1. 安装依赖

```bash
cd /path/to/ppanel-web
bun install
```

#### 2. 开发模式

同时启动所有应用：
```bash
bun dev
```

这将启动：
- **管理端**: http://localhost:3000
- **用户端**: http://localhost:3001

或单独启动某个应用：
```bash
# 仅启动管理端
cd apps/admin
bun dev

# 仅启动用户端
cd apps/user
bun dev
```

#### 3. 生产构建

构建所有应用：
```bash
bun build
```

单独构建某个应用：
```bash
# 构建管理端
cd apps/admin
bun run build

# 构建用户端
cd apps/user
bun run build
```

#### 4. 启动生产服务器

构建完成后，启动生产服务器：
```bash
# 管理端
cd apps/admin
bun start

# 用户端
cd apps/user
bun start
```

### 📝 可用命令

| 命令 | 说明 |
|------|------|
| `bun dev` | 启动所有应用的开发服务器 |
| `bun build` | 构建所有应用的生产版本 |
| `bun lint` | 对所有包运行代码检查 |
| `bun prettier` | 使用 Prettier 格式化代码 |
| `bun clean` | 清理构建输出和依赖 |
| `bun locale` | 生成国际化文件 |
| `bun openapi` | 生成 OpenAPI 类型定义 |
| `bun update:deps` | 更新依赖 |
| `bun update:shadcn` | 更新 shadcn/ui 组件 |

### 📁 项目结构

```
ppanel-web/
├── apps/
│   ├── admin/          # 管理后台应用
│   └── user/           # 用户端应用
├── packages/
│   ├── ui/             # 共享 UI 组件
│   ├── eslint-config/  # 共享 ESLint 配置
│   ├── prettier-config/# 共享 Prettier 配置
│   └── typescript-config/ # 共享 TypeScript 配置
├── scripts/            # 工具脚本
└── docker/             # Docker 配置文件
```

### ⚙️ 配置说明

#### 后端 API

⚠️ **重要提示**：这是一个**纯前端**项目，需要单独的后端 API 服务器。

默认的后端 API 地址硬编码为 `http://192.168.72.128:8080`。你需要：
1. 搭建自己的 PPanel 后端服务器，或
2. 配置 API URL 指向你的后端服务器

#### 环境变量

在相应的应用目录中创建 `.env.local` 文件：

**apps/admin/.env.local**
```env
# 后端 API 地址（必需）
NEXT_PUBLIC_API_URL=http://你的后端服务器:8080

# 站点地址
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# CDN 地址（可选）
# NEXT_PUBLIC_CDN_URL=https://你的CDN.com

# 默认用户邮箱（可选）
# NEXT_PUBLIC_DEFAULT_USER_EMAIL=admin@example.com
```

**apps/user/.env.local**
```env
# 后端 API 地址（必需）
NEXT_PUBLIC_API_URL=http://你的后端服务器:8080

# 站点地址
NEXT_PUBLIC_SITE_URL=http://localhost:3001

# CDN 地址（可选）
# NEXT_PUBLIC_CDN_URL=https://你的CDN.com
```

**注意**：将 `你的后端服务器:8080` 替换为你实际的后端 API 地址。

### 🚢 部署

#### Docker 部署

构建 Docker 镜像：
```bash
# 构建管理端
docker build -f docker/ppanel-admin-web/Dockerfile -t ppanel-admin-web .

# 构建用户端
docker build -f docker/ppanel-user-web/Dockerfile -t ppanel-user-web .
```

或使用 Docker Compose：
```bash
cd docker
docker-compose up -d
```

#### Google Cloud Run 部署

本项目配置为部署两个独立的 Cloud Run 服务：
- **用户端服务** (`ppanel-user-web`) - 面向用户的应用
- **管理端服务** (`ppanel-admin-web`) - 管理后台

**方法 1：使用部署脚本（推荐）**

```bash
# 1. 设置必需的环境变量
export GCP_PROJECT_ID=你的项目ID
export NEXT_PUBLIC_API_URL=https://api.yourdomain.com
export USER_SITE_URL=https://user.yourdomain.com
export ADMIN_SITE_URL=https://admin.yourdomain.com

# 2. 部署两个应用
./deploy-cloudrun.sh all

# 或单独部署
./deploy-cloudrun.sh user   # 仅用户端
./deploy-cloudrun.sh admin  # 仅管理端
```

**方法 2：直接使用 gcloud CLI**

部署用户端：
```bash
gcloud run deploy ppanel-user-web \
  --source . \
  --dockerfile docker/ppanel-user-web/Dockerfile.cloudrun \
  --region asia-east1 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
  --set-env-vars NEXT_PUBLIC_SITE_URL=https://user.yourdomain.com
```

部署管理端：
```bash
gcloud run deploy ppanel-admin-web \
  --source . \
  --dockerfile docker/ppanel-admin-web/Dockerfile.cloudrun \
  --region asia-east1 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
  --set-env-vars NEXT_PUBLIC_SITE_URL=https://admin.yourdomain.com
```

**方法 3：使用 Cloud Build（CI/CD）**

1. 设置连接到仓库的 Cloud Build 触发器
2. 在 Cloud Build 中配置环境变量
3. 每次推送将自动构建和部署两个服务

**环境变量**

必需：
- `NEXT_PUBLIC_API_URL` - 后端 API 地址
- `NEXT_PUBLIC_SITE_URL` - 前端站点地址

可选（有默认值）：
- `NEXT_PUBLIC_DEFAULT_LANGUAGE` - 默认语言（默认：`zh-CN`）
- `NEXT_TELEMETRY_DISABLED` - 禁用遥测（默认：`1`）

查看 `env.example` 了解所有可用的环境变量。

**部署后**

每个服务将获得一个唯一的 Cloud Run URL：
- 用户端：`https://ppanel-user-web-[hash]-[region].run.app`
- 管理端：`https://ppanel-admin-web-[hash]-[region].run.app`

你可以使用以下命令映射自定义域名：
```bash
gcloud run domain-mappings create --service ppanel-user-web --domain user.yourdomain.com
gcloud run domain-mappings create --service ppanel-admin-web --domain admin.yourdomain.com
```

### ⚠️ 注意事项

1. **需要后端**：这是一个**纯前端**项目。你需要单独搭建 PPanel 后端服务器。前端默认连接到 `http://192.168.72.128:8080`
2. **包管理器**：本项目使用 Bun 作为包管理器，请勿使用 npm 或 yarn
3. **Node 版本**：确保 Node.js 版本 >= 20
4. **在根目录安装**：始终在项目根目录运行 `bun install`，不要在单个应用目录下运行。Monorepo 结构会自动处理所有工作区依赖
5. **环境文件**：运行应用前请先配置环境变量（特别是 `NEXT_PUBLIC_API_URL`）
6. **端口冲突**：确保 3000（管理端）和 3001（用户端）端口可用
7. **Turbo 缓存**：首次构建可能较慢，后续构建会通过 Turbo 缓存加速
8. **依赖缺失**：如果遇到 "Cannot find module" 错误，请在根目录重新运行 `bun install`

### 📜 许可证

本项目使用 GUN 许可证。

