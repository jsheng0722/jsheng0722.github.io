# GitHub Actions 构建失败故障排除

## 🔍 构建失败常见原因

### 1. ESLint 错误

即使设置了 `CI: false`，某些 ESLint 错误仍可能导致构建失败。

**检查方法**：
- 在 Actions 日志中查找 ESLint 错误
- 查看具体的错误文件和行号

**解决方法**：
- 修复 ESLint 错误
- 或临时禁用特定规则

### 2. 代码语法错误

JavaScript/JSX 语法错误会导致构建失败。

**检查方法**：
- 查看 Actions 日志中的语法错误信息
- 本地运行 `npm run build` 测试

**解决方法**：
- 修复语法错误
- 确保所有导入的模块存在

### 3. 依赖问题

依赖安装或版本冲突可能导致构建失败。

**检查方法**：
- 查看 "Install dependencies" 步骤的日志
- 检查是否有依赖警告或错误

**解决方法**：
- 更新 `package-lock.json`
- 清理并重新安装依赖

### 4. 内存不足

大型项目构建时可能内存不足。

**解决方法**：
- 设置 `GENERATE_SOURCEMAP: false`（已添加）
- 设置 `INLINE_RUNTIME_CHUNK: false`（已添加）

### 5. 环境变量问题

缺少必需的环境变量可能导致构建失败。

**检查方法**：
- 查看构建日志中是否有环境变量相关错误
- 检查 GitHub Secrets 是否配置

## 🛠️ 诊断步骤

### 步骤 1: 查看完整的错误日志

1. 进入 GitHub 仓库的 **Actions** 标签页
2. 点击失败的工作流运行
3. 展开 "Build React app" 步骤
4. 查看完整的错误信息

### 步骤 2: 本地测试构建

在本地运行构建，查看是否有相同错误：

```bash
# 清理并重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 生成架构数据
npm run generate-architecture

# 构建项目
npm run build
```

### 步骤 3: 检查常见错误

#### ESLint 错误

如果看到 ESLint 错误：
```
Failed to compile.
./src/...
Line X: 'variable' is assigned a value but never used
```

**解决方法**：
- 修复错误（移除未使用的变量）
- 或添加 ESLint 忽略注释

#### 导入错误

如果看到导入错误：
```
Cannot find module: 'xxx'
```

**解决方法**：
- 检查导入路径是否正确
- 确认文件是否存在
- 检查大小写是否匹配

#### 语法错误

如果看到语法错误：
```
SyntaxError: Unexpected token
```

**解决方法**：
- 检查语法错误的位置
- 修复语法问题

## 🔧 改进的 Workflow 配置

已更新 workflow 配置，添加了：

1. **`GENERATE_SOURCEMAP: false`** - 禁用 source map 生成，减少内存使用
2. **`INLINE_RUNTIME_CHUNK: false`** - 优化构建输出
3. **`continue-on-error: false`** - 确保错误被正确报告

## 📋 快速修复清单

如果构建失败：

- [ ] 查看 Actions 日志中的完整错误信息
- [ ] 在本地运行 `npm run build` 测试
- [ ] 检查是否有 ESLint 错误
- [ ] 检查是否有语法错误
- [ ] 检查是否有导入错误
- [ ] 修复错误后重新推送

## 🆘 如果仍然失败

### 方法 1: 查看详细日志

在 Actions 日志中，查找：
- `Error:` 开头的错误
- `Failed to compile` 消息
- 具体的文件路径和行号

### 方法 2: 分步测试

在本地分步测试：

```bash
# 1. 测试架构生成
npm run generate-architecture

# 2. 测试构建
npm run build

# 3. 如果都成功，问题可能在 GitHub Actions 环境
```

### 方法 3: 临时禁用检查

如果确定是 ESLint 问题，可以临时修改：

在 `package.json` 中：
```json
{
  "eslintConfig": {
    "extends": ["react-app", "react-app/jest"],
    "rules": {
      "no-unused-vars": "warn"
    }
  }
}
```

---

**最后更新**: 2025-01-25  
**状态**: ✅ 构建错误故障排除指南完成
