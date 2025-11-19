# 🔄 GCP VM 重启后启动指南

VM IP: **34.177.90.11**

---

## ⚡ 快速启动（最简单）

```bash
# SSH 连接
ssh user@34.177.90.11

# 检查所有容器状态（应该自动启动）
docker ps

# 如果容器都在运行，说明自动启动成功！
# 如果有容器未启动，参考下面的手动启动流程
```

---

## 🔍 自动启动检查

所有容器都配置了 `restart: always`，Docker 服务启动后应该自动启动所有容器。

### 验证 Docker 服务状态

```bash
# 检查 Docker 服务
sudo systemctl status docker

# 如果未运行，启动 Docker
sudo systemctl start docker

# 设置开机自启
sudo systemctl enable docker
```

### 验证容器状态

```bash
# 查看所有容器（包括停止的）
docker ps -a

# 应该看到以下 5 个容器：
# - ppanel-mysql      (健康检查通过后才启动下游)
# - ppanel-redis      (健康检查通过后才启动下游)
# - ppanel-server     (依赖 MySQL 和 Redis)
# - ppanel-admin      (前端管理后台)
# - ppanel-user       (前端用户界面)
```

---

## 🚀 手动启动流程

### 方案 1：使用部署脚本（推荐）

```bash
# 1. 启动后端服务
cd ~/blitz-arrow-server
./scripts/deploy-from-source.sh

# 2. 等待后端完全启动（约 30-40 秒）
sleep 40

# 3. 启动前端服务
cd ~/blitz-arrow
./scripts/deploy-from-source.sh
```

### 方案 2：使用 docker-compose

```bash
# 1. 启动后端
docker compose -f /tmp/docker-compose-server.yml up -d

# 2. 等待后端启动
sleep 40

# 3. 启动前端
docker compose -f /tmp/docker-compose-local.yml up -d
```

### 方案 3：直接启动容器

```bash
# 按顺序启动（确保依赖关系）
docker start ppanel-mysql
docker start ppanel-redis
sleep 10
docker start ppanel-server
sleep 5
docker start ppanel-admin
docker start ppanel-user
```

---

## 📊 状态检查命令

```bash
# 查看容器状态（表格格式）
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 查看特定容器日志
docker logs ppanel-server --tail=50 -f
docker logs ppanel-admin --tail=50 -f
docker logs ppanel-user --tail=50 -f

# 检查数据库连接
docker exec ppanel-mysql mysqladmin ping -h localhost

# 检查 Redis 连接
docker exec ppanel-redis redis-cli ping

# 查看网络
docker network ls | grep ppanel
```

---

## 🌐 访问测试

```bash
# 测试后端 API
curl http://34.177.90.11:8080

# 在浏览器访问：
# Admin: http://34.177.90.11:3000
# User:  http://34.177.90.11:3001
# API:   http://34.177.90.11:8080
```

---

## 🛠️ 常见问题排查

### 问题 1：容器启动失败

```bash
# 查看容器日志
docker logs ppanel-server --tail=100

# 检查容器退出原因
docker inspect ppanel-server | grep -A 10 "State"

# 重启单个容器
docker restart ppanel-server
```

### 问题 2：网络连接问题

```bash
# 检查网络
docker network inspect ppanel-network

# 如果网络有问题，重新创建（需要先停止容器）
docker stop ppanel-admin ppanel-user ppanel-server ppanel-mysql ppanel-redis
docker network rm ppanel-network
docker network create ppanel-network

# 然后重新启动服务
cd ~/blitz-arrow-server && ./scripts/deploy-from-source.sh
cd ~/blitz-arrow && ./scripts/deploy-from-source.sh
```

### 问题 3：数据库连接失败

```bash
# 检查 MySQL 容器
docker logs ppanel-mysql --tail=50

# 进入 MySQL 容器测试
docker exec -it ppanel-mysql mysql -uppanel -pppanel_password ppanel

# 如果 MySQL 正在初始化，等待更长时间
docker logs ppanel-mysql -f
```

### 问题 4：端口被占用

```bash
# 检查端口占用
sudo netstat -tlnp | grep -E '3000|3001|8080'

# 或使用 ss 命令
sudo ss -tlnp | grep -E '3000|3001|8080'

# 如果有冲突，停止旧容器
docker stop $(docker ps -aq)
```

---

## 🔄 重新部署（更新代码）

```bash
# 1. 拉取最新代码（前端）
cd ~/blitz-arrow
git stash  # 暂存本地修改（如 bun.lockb）
git pull

# 2. 拉取最新代码（后端）
cd ~/blitz-arrow-server
git pull

# 3. 重新部署后端
cd ~/blitz-arrow-server
./scripts/deploy-from-source.sh

# 4. 重新部署前端
cd ~/blitz-arrow
./scripts/deploy-from-source.sh
```

---

## 💾 数据持久化

所有数据存储在 Docker volumes 中，重启不会丢失：

```bash
# 查看 volumes
docker volume ls | grep ppanel

# 查看 volume 详情
docker volume inspect mysql_data
docker volume inspect redis_data

# 备份数据（可选）
docker run --rm \
  -v mysql_data:/source \
  -v ~/backups:/backup \
  alpine tar czf /backup/mysql-$(date +%Y%m%d).tar.gz -C /source .
```

---

## 🔧 配置文件位置

- **后端配置**: `~/blitz-arrow-server/etc/ppanel.yaml`
- **后端 docker-compose**: `/tmp/docker-compose-server.yml`
- **前端 docker-compose**: `/tmp/docker-compose-local.yml`
- **前端环境变量**: 
  - `~/blitz-arrow/apps/admin/.env.local`
  - `~/blitz-arrow/apps/user/.env.local`

> ⚠️ 注意：`/tmp` 目录中的文件可能在系统重启后被清除，但部署脚本会自动重新生成。

---

## 📝 管理命令速查

```bash
# 查看所有容器
docker ps -a

# 启动所有容器
docker start ppanel-mysql ppanel-redis ppanel-server ppanel-admin ppanel-user

# 停止所有容器
docker stop ppanel-mysql ppanel-redis ppanel-server ppanel-admin ppanel-user

# 重启所有容器
docker restart ppanel-mysql ppanel-redis ppanel-server ppanel-admin ppanel-user

# 查看实时日志（后端）
docker compose -f /tmp/docker-compose-server.yml logs -f

# 查看实时日志（前端）
docker compose -f /tmp/docker-compose-local.yml logs -f

# 清理未使用的资源
docker system prune -f
```

---

## 🎯 启动顺序重要性

容器必须按以下顺序启动（已通过 `depends_on` 和 `healthcheck` 配置）：

1. **MySQL** → 等待健康检查通过
2. **Redis** → 等待健康检查通过
3. **Server**（后端 API）→ 等待启动完成
4. **Admin + User**（前端）→ 最后启动

这就是为什么使用部署脚本最可靠！

---

## 📞 紧急恢复

如果一切都乱了，完全重新部署：

```bash
# 停止并删除所有容器
docker stop $(docker ps -aq)
docker rm ppanel-mysql ppanel-redis ppanel-server ppanel-admin ppanel-user

# 删除网络（保留 volumes，不会丢失数据）
docker network rm ppanel-network

# 重新部署（会自动创建网络和启动容器）
cd ~/blitz-arrow-server && ./scripts/deploy-from-source.sh
sleep 40
cd ~/blitz-arrow && ./scripts/deploy-from-source.sh
```

---

## ✅ 完整启动检查清单

- [ ] Docker 服务正在运行
- [ ] 5 个容器都在运行
- [ ] MySQL 健康检查通过
- [ ] Redis 健康检查通过
- [ ] 后端 API 可以访问 (curl http://34.177.90.11:8080)
- [ ] Admin 可以访问 (http://34.177.90.11:3000)
- [ ] User 可以访问 (http://34.177.90.11:3001)
- [ ] 所有容器日志没有错误

---

📚 相关文档：
- 后端部署指南：`../blitz-arrow-server/快速部署-GCP.md`
- 前端部署指南：`快速部署-GCP.md`
- 完整部署指南：`../blitz-arrow-server/完整部署指南.md`

