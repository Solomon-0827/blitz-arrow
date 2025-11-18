# ⚡ 前端快速部署 - GCP

VM IP: **34.177.90.11**

---

## ⚠️ 前提条件

后端必须先部署完成！

---

## 🚀 部署步骤

```bash
# 1. SSH 连接虚拟机
ssh user@34.177.90.11

# 2. 克隆代码
cd ~
git clone YOUR_REPO_URL blitz-arrow
cd blitz-arrow

# 3. 一键部署（15-20 分钟，自动配置环境变量）
chmod +x scripts/deploy-from-source.sh
./scripts/deploy-from-source.sh
```

---

## 🌐 访问地址

- **Admin**: http://34.177.90.11:3000
- **User**: http://34.177.90.11:3001

---

## 📝 环境变量

自动配置为：

```bash
# apps/admin/.env.local
NEXT_PUBLIC_API_URL=http://34.177.90.11:8080
NEXT_PUBLIC_SITE_URL=http://34.177.90.11:3000

# apps/user/.env.local
NEXT_PUBLIC_API_URL=http://34.177.90.11:8080
NEXT_PUBLIC_SITE_URL=http://34.177.90.11:3001
```

---

## 🔄 更新

```bash
cd ~/blitz-arrow
git pull
./scripts/deploy-from-source.sh
```

---

详细文档：`../blitz-arrow-server/完整部署指南.md`
