# 🚀 PPanel GCP 部署指南

## 部署架构

本项目使用 **源代码直接部署** 方案：

- ✅ 所有操作在 GCP 虚拟机完成
- ✅ 不需要 Docker Hub
- ✅ 原生 AMD64 架构
- ✅ 一键部署脚本

---

## 📋 部署步骤

### 前提条件

- GCP 虚拟机（Debian 12，已配置）
- 代码已推送到 Git 仓库

### 第一步：连接到 GCP 虚拟机

1. 打开 [GCP 控制台](https://console.cloud.google.com/compute/instances)
2. 找到您的虚拟机
3. 点击 **SSH** 按钮

### 第二步：初始化环境（仅首次需要）

```bash
cd ~/ppanel
./1-setup-vm.sh
```

**完成后输入 `exit` 退出，然后重新连接 SSH**

### 第三步：克隆代码

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git blitz-arrow
cd blitz-arrow
```

### 第四步：一键部署

```bash
./scripts/deploy-from-source.sh
```

⏳ **等待 10-15 分钟**，脚本会自动完成：

1. 安装 Bun
2. 安装依赖
3. 构建应用
4. 创建 Docker 镜像
5. 启动容器

### 第五步：配置防火墙

在 GCP 控制台：

1. **VPC 网络** → **防火墙规则** → **创建防火墙规则**
2. 配置：
   - 名称：`allow-ppanel`
   - 目标：网络中的所有实例
   - 来源 IPv4 范围：`0.0.0.0/0`
   - 协议和端口：TCP - `3000,3001`
3. 点击 **创建**

### 第六步：访问应用 🎉

```
Admin 管理后台: http://YOUR_VM_IP:3000
User  用户前端: http://YOUR_VM_IP:3001
```

---

## 🔄 更新应用

```bash
cd ~/blitz-arrow
git pull
./scripts/deploy-from-source.sh
```

---

## 📝 管理命令

```bash
# 查看容器状态
docker compose -f /tmp/docker-compose-local.yml ps

# 查看日志
docker compose -f /tmp/docker-compose-local.yml logs -f

# 重启应用
docker compose -f /tmp/docker-compose-local.yml restart

# 停止应用
docker compose -f /tmp/docker-compose-local.yml down
```

---

## 🐛 故障排查

### 构建失败

```bash
cd ~/blitz-arrow
rm -rf node_modules apps/*/node_modules apps/*/.next
./scripts/deploy-from-source.sh
```

### 端口被占用

```bash
docker compose -f /tmp/docker-compose-local.yml down
sudo netstat -tlnp | grep -E '3000|3001'
```

### 清理磁盘空间

```bash
docker system prune -a
```

---

## 📁 项目结构

```
blitz-arrow/
├── apps/
│   ├── admin/          # 管理后台应用
│   └── user/           # 用户前端应用
├── packages/
│   └── ui/             # 共享 UI 组件
├── docker/
│   ├── ppanel-admin-web/Dockerfile
│   └── ppanel-user-web/Dockerfile
├── deploy/
│   └── 1-setup-vm.sh   # 虚拟机初始化脚本
├── scripts/
│   └── deploy-from-source.sh  # 一键部署脚本
└── DEPLOYMENT.md       # 本文档
```

---

## 🔧 技术栈

- **前端框架**: Next.js 15
- **运行时**: Bun
- **容器化**: Docker + Docker Compose
- **UI 库**: React 19 + Tailwind CSS + shadcn/ui
- **状态管理**: Zustand
- **数据请求**: TanStack Query

---

## 📞 支持

如有问题，请检查：

1. 防火墙规则是否正确配置
2. Docker 容器是否正常运行
3. 日志中是否有错误信息

详细文档请参考：`虚拟机部署指南.md`
