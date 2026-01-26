# 清理 gh-pages 相关配置指南

## 📋 需要清理的内容

### 1. package.json 中的 deploy 脚本和 gh-pages 包

**当前配置**：
```json
"scripts": {
  "deploy": "gh-pages -d build"  // 会推送到 gh-pages 分支
},
"devDependencies": {
  "gh-pages": "^6.1.1"  // 不再需要
}
```

**清理方案**：
- 移除 `deploy` 脚本（或重命名为 `deploy-legacy` 作为备用）
- 移除 `gh-pages` 包（如果确定不再使用）

### 2. 旧脚本文件（可选）

以下脚本文件是旧部署方式使用的，可以删除：
- `scripts/fix-gh-pages.js`
- `scripts/fix-gh-pages-deployment.js`

### 3. 文档中的旧说明（可选）

以下文档包含旧的 gh-pages 部署说明，可以更新或删除：
- `GITHUB_PAGES_404_FIX.md`
- `GITHUB_PAGES_FIX.md`

## ✅ 确认：只需要 main 分支

**是的，使用 GitHub Actions 部署时，只需要 main 分支！**

### 为什么只需要 main 分支？

1. **GitHub Actions 工作流**：
   - 监听 `main` 分支的推送
   - 在 Actions 服务器上构建
   - 将构建产物上传为 artifact
   - 直接部署到 GitHub Pages

2. **不需要 gh-pages 分支**：
   - GitHub Actions 使用 artifact 部署
   - 不依赖任何分支
   - 所有内容都在 artifact 中

3. **工作流程**：
   ```
   main 分支 (源代码)
      ↓
   GitHub Actions 构建
      ↓
   Upload artifact (构建文件)
      ↓
   Deploy to GitHub Pages (直接部署)
   ```

## 🛠️ 清理步骤

### 步骤 1: 更新 package.json

移除或重命名 deploy 脚本，移除 gh-pages 包：

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "generate-architecture": "node scripts/generate-architecture.js",
    "predeploy": "npm run generate-architecture && npm run build"
    // 移除 "deploy": "gh-pages -d build"
  },
  "devDependencies": {
    "@babel/plugin-proposal-private-property-in-object": "^7.21.0",
    "@tailwindcss/typography": "^0.5.19"
    // 移除 "gh-pages": "^6.1.1"
  }
}
```

### 步骤 2: 删除 gh-pages 分支

在 GitHub 仓库中：
1. 进入 **Settings** → **Branches**
2. 找到 `gh-pages` 分支
3. 删除它

或使用命令：
```bash
git push origin --delete gh-pages
```

### 步骤 3: 删除旧脚本（可选）

```bash
# 删除不再需要的脚本
rm scripts/fix-gh-pages.js
rm scripts/fix-gh-pages-deployment.js
```

### 步骤 4: 验证清理

确认：
- [ ] `package.json` 中已移除 `deploy` 脚本
- [ ] `package.json` 中已移除 `gh-pages` 包
- [ ] `gh-pages` 分支已删除
- [ ] GitHub Pages Source 设置为 "GitHub Actions"
- [ ] GitHub Actions 工作流正常运行

## 📋 清理后的配置

### 保留的内容

- ✅ `main` 分支（源代码）
- ✅ `.github/workflows/deploy.yml`（GitHub Actions 工作流）
- ✅ `package.json` 中的其他脚本（start, build, test, generate-architecture）

### 移除的内容

- ❌ `gh-pages` 分支
- ❌ `package.json` 中的 `deploy` 脚本
- ❌ `package.json` 中的 `gh-pages` 包
- ❌ 旧的部署脚本（可选）

## ⚠️ 注意事项

### 如果以后需要备用部署方式

如果将来需要保留 `gh-pages` 作为备用：

1. **保留 deploy 脚本**（但重命名）：
   ```json
   "deploy-legacy": "gh-pages -d build"
   ```

2. **保留 gh-pages 包**：
   ```json
   "gh-pages": "^6.1.1"
   ```

3. **不要创建 gh-pages 分支**：
   - 只有在需要时才运行 `npm run deploy-legacy`
   - 使用后可以删除分支

### 架构可视化中的 gh-pages 节点

`src/pages/Architecture/ArchitectureMindMap.js` 中有一个显示 'gh-pages' 的节点，这是架构可视化的一部分，不影响部署，可以保留。

---

**最后更新**: 2025-01-25  
**状态**: ✅ 清理指南完成
