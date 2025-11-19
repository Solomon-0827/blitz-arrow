# ⚡ GCP 快速部署指南

VM IP: **34.177.90.11**

---

## 🚀 部署步骤

### 1. SSH 连接

```bash
ssh user@34.177.90.11
```

### 2. 部署后端

```bash
cd ~
git clone YOUR_REPO_URL blitz-arrow-server
cd blitz-arrow-server
./scripts/deploy-from-source.sh
```

**首次部署需要初始化：**
访问 http://34.177.90.11:8080/init 完成初始化
- MySQL 主机: `mysql:3306`
- MySQL 用户: `ppanel` 密码: `ppanel_password`
- MySQL 数据库: `ppanel`
- Redis: `redis:6379` (无密码)

### 3. 部署前端

```bash
cd ~
git clone YOUR_REPO_URL blitz-arrow
cd blitz-arrow
./scripts/deploy-from-source.sh
```

---

## 🌐 访问地址

- **Admin**: http://34.177.90.11:3000
- **User**: http://34.177.90.11:3001
- **API**: http://34.177.90.11:8080

---

## 🔥 防火墙配置

```bash
gcloud compute firewall-rules create allow-ppanel-all \
  --allow tcp:3000,tcp:3001,tcp:8080 \
  --direction INGRESS
```

---

## 📝 管理命令

### 查看状态
```bash
docker ps
```

### 查看日志
```bash
# 后端
cd ~/blitz-arrow-server
docker compose -f deploy/docker-compose.prod.yml logs -f server

# 前端
cd ~/blitz-arrow
docker compose -f docker/docker-compose.yml logs -f
```

### 重启服务
```bash
# 后端
cd ~/blitz-arrow-server
docker compose -f deploy/docker-compose.prod.yml restart

# 前端
cd ~/blitz-arrow
docker compose -f docker/docker-compose.yml restart
```

### 更新代码
```bash
# 后端
cd ~/blitz-arrow-server
git pull
./scripts/deploy-from-source.sh

# 前端
cd ~/blitz-arrow
git stash  # 暂存本地修改
git pull
./scripts/deploy-from-source.sh
```

---

## 🔄 重启后恢复

GCP VM 重启后，Docker 服务会自动启动所有容器（配置了 `restart: always`）。

**检查服务状态：**
```bash
docker ps
```

**如果容器未启动：**
```bash
# 启动后端
cd ~/blitz-arrow-server
docker compose -f deploy/docker-compose.prod.yml up -d

# 启动前端
cd ~/blitz-arrow
docker compose -f docker/docker-compose.yml up -d
```

---

## 🛠️ 故障排查

### 查看容器日志
```bash
docker logs ppanel-server
docker logs ppanel-admin
docker logs ppanel-user
```

### 检查数据库
```bash
docker exec ppanel-mysql mysqladmin ping -h localhost
```

### 检查 Redis
```bash
docker exec ppanel-redis redis-cli ping
```

### 完全重新部署
```bash
# 停止并删除所有容器
docker stop ppanel-mysql ppanel-redis ppanel-server ppanel-admin ppanel-user
docker rm ppanel-mysql ppanel-redis ppanel-server ppanel-admin ppanel-user
docker network rm ppanel-network

# 重新部署
cd ~/blitz-arrow-server && ./scripts/deploy-from-source.sh
cd ~/blitz-arrow && ./scripts/deploy-from-source.sh
```
