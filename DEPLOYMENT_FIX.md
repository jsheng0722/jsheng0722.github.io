# GitHub Pages 部署问题修复指南

## 问题 1: 首页路径应该是 `/` 而不是 `/home`

### 已修复
- ✅ `src/components/Layout/Header/Header.js` - 将导航链接从 `/home` 改为 `/`
- ✅ `src/components/Desktop/Desktop.js` - 将快捷方式从 `/home` 改为 `/`

### 路由配置
- `/` - 首页（HomePage）
- `/home` - 仍然可用，但会重定向到首页

## 问题 2: 开发环境和生产环境内容不一致

### 可能的原因

1. **环境变量问题**
   - `process.env.PUBLIC_URL` 在开发环境为空，在生产环境为 `https://jsheng0722.github.io`
   - 检查所有使用 `process.env.PUBLIC_URL` 的地方

2. **构建缓存问题**
   - 清除构建缓存：删除 `build` 目录后重新构建
   - 清除浏览器缓存

3. **GitHub Pages 缓存**
   - GitHub Pages 可能有缓存，等待几分钟或强制刷新

### 检查清单

- [ ] 清除 `build` 目录
- [ ] 重新构建：`npm run build`
- [ ] 检查 `build` 目录中的文件
- [ ] 部署：`npm run deploy`
- [ ] 检查 `gh-pages` 分支的内容
- [ ] 清除浏览器缓存
- [ ] 检查 GitHub Pages 设置

### 验证步骤

1. **本地构建验证**：
   ```bash
   npm run build
   # 检查 build 目录中的文件
   # 特别是 index.html 和静态资源
   ```

2. **部署验证**：
   ```bash
   npm run deploy
   # 检查 gh-pages 分支
   git checkout gh-pages
   ls -la
   # 应该看到 build 目录的内容
   ```

3. **在线验证**：
   - 访问 `https://jsheng0722.github.io`
   - 检查浏览器控制台是否有错误
   - 检查网络请求是否成功

## 常见问题

### 问题：资源加载失败（404）

**原因**：`process.env.PUBLIC_URL` 在生产环境需要正确设置

**解决方案**：
- 确保 `package.json` 中的 `homepage` 字段正确
- 检查所有资源路径是否正确使用 `process.env.PUBLIC_URL`

### 问题：路由不工作

**原因**：GitHub Pages 不支持客户端路由

**解决方案**：
- 使用 HashRouter 代替 BrowserRouter（可选）
- 或者配置服务器重定向（GitHub Pages 不支持）

### 问题：样式丢失

**原因**：CSS 文件路径不正确

**解决方案**：
- 检查 `public/index.html` 中的 CSS 引用
- 确保构建后的 CSS 文件路径正确

## 当前配置

- **homepage**: `https://jsheng0722.github.io`
- **部署分支**: `gh-pages`
- **构建目录**: `build`
- **Jekyll**: 已禁用（`.nojekyll` 文件）
