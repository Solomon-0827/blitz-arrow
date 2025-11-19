# 🚀 GCP 完整部署指南

**部署策略：**
- 后端：GCP VM 上直接构建部署
- 前端：本地打包推送镜像，GCP VM 上拉取部署

---

## 📋 第一步：清除 GCP 环境（全新开始）

SSH 连接到 GCP VM：

```bash
ssh user@34.177.90.11
```

### 1. 停止并删除所有容器

```bash
# 停止所有运行的容器
docker stop $(docker ps -aq) 2>/dev/null || true

# 删除所有容器
docker rm -f ppanel-mysql ppanel-redis ppanel-server ppanel-admin ppanel-user 2>/dev/null || true

# 确认已清除
docker ps -a
```

### 2. 删除所有网络

```bash
# 删除项目网络
docker network rm ppanel-network 2>/dev/null || true

# 查看剩余网络
docker network ls
```

### 3. 清理旧镜像（可选，节省空间）

```bash
# 删除旧的项目镜像
docker rmi $(docker images "ppanel-*" -q) 2>/dev/null || true
docker rmi $(docker images "*ppanel*" -q) 2>/dev/null || true

# 清理未使用的镜像
docker image prune -a -f

# 查看剩余镜像
docker images
```

### 4. 清理 volumes（⚠️ 注意：会删除数据库数据！）

```bash
# 如果要完全重新开始，删除数据库数据
docker volume rm mysql_data redis_data 2>/dev/null || true

# 查看剩余 volumes
docker volume ls
```

### 5. 清理旧代码目录（可选）

```bash
# 如果想重新克隆代码
rm -rf ~/blitz-arrow ~/blitz-arrow-server
```

---

## 🔧 第二步：部署后端（在 GCP VM 上）

### 1. 克隆后端代码

```bash
cd ~
git clone YOUR_REPO_URL blitz-arrow-server
cd blitz-arrow-server
```

### 2. 一键部署后端

```bash
./scripts/deploy-from-source.sh
```

等待约 2-3 分钟，脚本会自动：
- 安装 Docker 和 Go（如果需要）
- 编译 Go 应用
- 构建 Docker 镜像
- 启动 MySQL + Redis + Server

### 3. 初始化数据库

访问 http://34.177.90.11:8080/init

填入以下信息：
- **MySQL 主机**: `mysql:3306`
- **MySQL 用户**: `ppanel`
- **MySQL 密码**: `ppanel_password`
- **MySQL 数据库**: `ppanel`
- **Redis 主机**: `redis:6379`
- **Redis 密码**: (留空)

### 4. 验证后端

```bash
# 检查容器状态
docker ps

# 应该看到 3 个容器正在运行：
# - ppanel-mysql
# - ppanel-redis
# - ppanel-server

# 测试 API
curl http://34.177.90.11:8080
```

---

## 🎨 第三步：本地打包前端镜像

### 1. 配置 Docker Hub 用户名

编辑 `scripts/build-and-push.sh`，修改第 10 行：

```bash
DOCKER_USERNAME="你的DockerHub用户名"  # 修改这里
```

### 2. 登录 Docker Hub

```bash
docker login
# 输入你的 Docker Hub 用户名和密码
```

### 3. 本地构建并推送镜像

在你的本地 Mac 上：

```bash
cd /Users/solomon/Documents/GitRoot/blitz-arrow

# 一键构建并推送
./scripts/build-and-push.sh
```

这个脚本会：
1. 配置环境变量（API URL = http://34.177.90.11:8080）
2. 安装依赖
3. 构建 Next.js 应用
4. 构建 AMD64 架构的 Docker 镜像（适配 GCP VM）
5. 推送到 Docker Hub

**预计时间：** 5-10 分钟

### 4. 验证镜像已推送

访问 Docker Hub 网站或执行：

```bash
docker search 你的用户名/ppanel
```

应该看到：
- `你的用户名/ppanel-admin:latest`
- `你的用户名/ppanel-user:latest`

---

## 🚀 第四步：GCP 上部署前端

### 1. 克隆前端代码（如果还没有）

```bash
ssh user@34.177.90.11
cd ~
git clone YOUR_REPO_URL blitz-arrow
cd blitz-arrow
```

### 2. 配置 Docker Hub 用户名

编辑 `scripts/deploy-from-registry.sh`，修改第 10 行：

```bash
DOCKER_USERNAME="你的DockerHub用户名"  # 与本地配置保持一致
```

### 3. 部署前端

```bash
./scripts/deploy-from-registry.sh
```

这个脚本会：
1. 从 Docker Hub 拉取镜像
2. 启动 Admin 和 User 容器
3. 自动连接到后端创建的网络

### 4. 验证部署

```bash
# 检查所有容器
docker ps

# 应该看到 5 个容器：
# - ppanel-mysql
# - ppanel-redis
# - ppanel-server
# - ppanel-admin
# - ppanel-user

# 查看前端日志
docker logs ppanel-admin --tail=20
docker logs ppanel-user --tail=20
```

---

## 🌐 第五步：访问测试

### 访问地址

- **Admin 管理后台**: http://34.177.90.11:3000
- **User 用户前端**: http://34.177.90.11:3001
- **API 后端**: http://34.177.90.11:8080

### 测试连接

```bash
# 测试后端
curl http://34.177.90.11:8080

# 测试前端
curl http://34.177.90.11:3000
curl http://34.177.90.11:3001
```

在浏览器中打开以上地址进行测试。

---

## 🔄 后续更新流程

### 更新后端

```bash
ssh user@34.177.90.11
cd ~/blitz-arrow-server
git pull
./scripts/deploy-from-source.sh
```

### 更新前端

**本地：**
```bash
cd /Users/solomon/Documents/GitRoot/blitz-arrow
git pull
./scripts/build-and-push.sh
```

**GCP VM：**
```bash
ssh user@34.177.90.11
cd ~/blitz-arrow
git pull
./scripts/deploy-from-registry.sh
```

---

## 📝 管理命令

### 查看状态

```bash
# 查看所有容器
docker ps

# 查看容器详细信息
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### 查看日志

```bash
# 后端
cd ~/blitz-arrow-server
docker compose -f deploy/docker-compose.prod.yml logs -f server

# 前端（从镜像仓库部署的）
cd ~/blitz-arrow
export IMAGE_ADMIN=你的用户名/ppanel-admin:latest
export IMAGE_USER=你的用户名/ppanel-user:latest
docker compose -f docker/docker-compose.yml logs -f
```

### 重启服务

```bash
# 重启后端
cd ~/blitz-arrow-server
docker compose -f deploy/docker-compose.prod.yml restart

# 重启前端
cd ~/blitz-arrow
docker compose -f docker/docker-compose.yml restart
```

### 停止服务

```bash
# 停止后端
cd ~/blitz-arrow-server
docker compose -f deploy/docker-compose.prod.yml down

# 停止前端
cd ~/blitz-arrow
docker compose -f docker/docker-compose.yml down
```

---

## 🛠️ 故障排查

### 问题 1：容器无法启动

```bash
# 查看容器日志
docker logs 容器名 --tail=100

# 检查容器状态
docker inspect 容器名
```

### 问题 2：网络连接问题

```bash
# 检查网络
docker network inspect ppanel-network

# 重新创建网络
docker network rm ppanel-network
docker network create ppanel-network
```

### 问题 3：前端无法连接后端

检查环境变量是否正确：
- 本地构建时 `build-and-push.sh` 中的 VM_IP
- 镜像中打包的 API URL

### 问题 4：镜像拉取失败

```bash
# 检查是否登录 Docker Hub
docker login

# 手动拉取测试
docker pull 你的用户名/ppanel-admin:latest
```

---

## 📊 配置文件说明

### 前端配置文件

- `docker/docker-compose.yml` - **统一配置文件**（通过环境变量区分镜像来源）
  - 本地构建：使用默认值 `ppanel-admin:local`
  - 镜像仓库：通过 `IMAGE_ADMIN` 和 `IMAGE_USER` 环境变量指定
- `scripts/build-and-push.sh` - 本地构建推送脚本
- `scripts/deploy-from-source.sh` - GCP 本地构建部署脚本
- `scripts/deploy-from-registry.sh` - GCP 镜像部署脚本

### 后端配置文件

- `deploy/docker-compose.prod.yml` - 生产环境配置
- `scripts/deploy-from-source.sh` - 部署脚本
- `etc/ppanel.yaml` - 应用配置

---

## 💡 重要提示

1. **数据持久化**: MySQL 和 Redis 数据存储在 Docker volumes 中
2. **网络配置**: 前端使用 `external: true` 复用后端创建的网络
3. **镜像架构**: 本地 Mac (ARM64) 构建 AMD64 镜像需要 Docker Buildx
4. **环境变量**: 前端 API URL 在构建时打包到镜像中
5. **部署顺序**: 必须先部署后端（创建网络），再部署前端

---

## ✅ 完成检查清单

- [ ] GCP 环境已清除
- [ ] 后端成功部署（3 个容器运行）
- [ ] 后端数据库已初始化
- [ ] 本地成功构建并推送前端镜像
- [ ] GCP 成功拉取并部署前端（2 个容器运行）
- [ ] Admin 后台可以访问
- [ ] User 前端可以访问
- [ ] 前后端可以正常通信

全部完成后，部署就成功了！🎉

