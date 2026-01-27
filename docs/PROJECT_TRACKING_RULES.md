# 项目进度追踪规则

## 📋 规则目的

确保项目内容与文档保持一致，在每次更新后自动追踪进度，避免文档与代码不同步。

## 🔍 检查清单

### 1. 路由一致性检查

**检查时机**：每次添加/删除/修改路由后

**检查内容**：
- [ ] `src/App.js` 中的路由定义
- [ ] `README.md` 中的路由列表（第212行开始）
- [ ] `public/data/architecture.json` 中的路由数据
- [ ] `docs/README.md` 中的路由说明（如有）

**检查步骤**：
1. 统计 `src/App.js` 中的 `<Route>` 数量（不包括404）
2. 对比 `README.md` 中表格的路由数量
3. 运行 `npm run generate-architecture` 更新架构数据
4. 确认所有路由都有对应的页面组件文件

**记录位置**：更新 `README.md` 的"页面路由"部分

---

### 2. 组件一致性检查

**检查时机**：每次添加/删除/修改通用组件后

**检查内容**：
- [ ] `src/components/UI/` 中的组件列表
- [ ] `src/components/UI/index.js` 中的导出
- [ ] `README.md` 中的组件列表（第147行）
- [ ] `src/components/UI/README.md` 中的组件文档

**检查步骤**：
1. 列出 `src/components/UI/` 目录下的所有组件文件夹
2. 检查 `index.js` 是否导出所有组件
3. 对比 `README.md` 中的组件列表
4. 确认组件文档是否更新

**记录位置**：
- 更新 `README.md` 的"通用UI组件库"部分
- 更新 `src/components/UI/README.md`

---

### 3. 页面组件应用检查

**检查时机**：每次创建新的通用组件后

**检查内容**：
- [ ] `PageLayout` 是否应用到所有页面
- [ ] `SearchBox` 是否应用到所有搜索页面
- [ ] `FileViewer` 是否应用到所有文件查看页面
- [ ] 其他通用组件是否在合适的地方使用

**检查步骤**：
1. 搜索所有页面文件（`src/pages/**/*.js`）
2. 检查是否使用 `PageLayout` 而不是手动写 Header/Footer
3. 检查搜索功能是否使用 `SearchBox`
4. 检查文件查看是否使用统一的 `FileViewer`

**记录位置**：更新 `docs/PROJECT_REVIEW_COMPLETE.md` 的"待应用组件"部分

---

### 4. 文档链接有效性检查

**检查时机**：每次整理文档后

**检查内容**：
- [ ] `docs/README.md` 中的所有链接是否有效
- [ ] `README.md` 中引用的文档是否存在
- [ ] 文档之间的交叉引用是否有效

**检查步骤**：
1. 遍历 `docs/README.md` 中的所有 `[文本](./路径)` 链接
2. 检查目标文件是否存在
3. 检查路径是否正确（相对路径）
4. 检查文档中的交叉引用

**记录位置**：修复 `docs/README.md` 中的无效链接

---

### 5. 功能文档完整性检查

**检查时机**：每次添加新功能后

**检查内容**：
- [ ] 新功能是否有对应的文档
- [ ] 文档是否放在正确的位置
- [ ] 文档是否在 `docs/README.md` 中索引

**文档位置规则**：
- **部署相关** → `docs/deployment/`
- **功能指南** → `docs/features/`
- **音乐系统** → `docs/music/`
- **笔记系统** → `docs/pages/`
- **组件文档** → `docs/components/`
- **项目文档** → `docs/` 根目录

**检查步骤**：
1. 确认新功能有文档
2. 确认文档位置符合规则
3. 在 `docs/README.md` 中添加索引
4. 更新相关文档的交叉引用

---

### 6. 代码与文档同步检查

**检查时机**：每次更新代码后

**检查内容**：
- [ ] 代码中的功能是否在文档中说明
- [ ] 文档中描述的功能是否在代码中实现
- [ ] API/接口变更是否更新文档

**检查步骤**：
1. 检查新增功能是否有文档
2. 检查删除功能是否删除相关文档
3. 检查修改功能是否更新相关文档
4. 检查配置变更是否更新配置文档

---

## 📝 更新流程

### 添加新功能时

1. **开发功能**
   - 编写代码
   - 测试功能

2. **更新文档**
   - 创建功能文档（如需要）
   - 更新 `README.md` 的功能列表
   - 更新 `docs/README.md` 的索引

3. **更新架构数据**
   - 运行 `npm run generate-architecture`
   - 检查 `public/data/architecture.json` 是否更新

4. **检查一致性**
   - 按照上述检查清单逐项检查
   - 修复发现的不一致问题

5. **提交代码**
   - 提交代码和文档
   - 在提交信息中说明更新的内容

---

### 修改现有功能时

1. **修改代码**
   - 更新功能实现
   - 测试修改

2. **更新文档**
   - 更新相关功能文档
   - 更新 `README.md` 中的描述
   - 更新 `CHANGELOG.md`

3. **检查影响**
   - 检查是否有其他文档引用此功能
   - 更新交叉引用

4. **检查一致性**
   - 按照检查清单检查
   - 修复不一致问题

---

### 删除功能时

1. **删除代码**
   - 删除相关文件
   - 删除路由（如需要）
   - 删除导入引用

2. **删除文档**
   - 删除相关功能文档
   - 从 `docs/README.md` 中移除索引
   - 从 `README.md` 中移除描述

3. **更新架构**
   - 运行 `npm run generate-architecture`
   - 检查架构数据是否更新

4. **检查一致性**
   - 确认没有残留引用
   - 确认文档已清理

---

## 🎯 定期检查

### 每周检查（可选）

- [ ] 检查所有文档链接是否有效
- [ ] 检查路由数量是否一致
- [ ] 检查组件列表是否一致
- [ ] 检查是否有未文档化的功能

### 每次发布前检查（必须）

- [ ] 完整执行所有检查清单
- [ ] 更新 `CHANGELOG.md`
- [ ] 更新版本号（如需要）
- [ ] 运行 `npm run generate-architecture`
- [ ] 检查构建是否成功

---

## 📊 追踪记录

### 当前状态（2025-01-25）

#### 路由状态
- **总数**: 20个路由（包括404）
- **已文档化**: ✅ 全部在 README.md 中
- **架构数据**: ✅ 已生成

#### 组件状态
- **UI组件库**: 19个组件
  - Button, Card, Input, Textarea, Badge
  - Modal, Dialog, ConfirmDialog, Collapsible, Tooltip
  - Navigation, FileList, Form
  - FloatingButton, FloatingToolbar, FloatingCodeVisualizer
  - Loading, EmptyState
  - SearchBox, FileViewer
- **布局组件**: PageLayout, Header, Footer
- **已文档化**: ✅ 在 README.md 和 UI/README.md 中

#### 文档状态
- **文档总数**: 约33个
- **文档结构**: ✅ 已整理
- **文档链接**: ✅ 已检查

#### 组件应用状态
- **PageLayout**: 
  - ✅ 已应用: Music.js, NoteHome.js
  - ⚠️ 待应用: 其他15个页面
- **SearchBox**: 
  - ✅ 已应用: NoteHome.js
  - ⚠️ 待应用: BlogHome, VideoPlayer, ShopHome, Products
- **FileViewer**: 
  - ⚠️ 待应用: Products, Folder

---

## 🔧 自动化检查脚本（未来可扩展）

可以创建脚本自动检查：

```javascript
// scripts/check-consistency.js
// 1. 检查路由数量
// 2. 检查组件导出
// 3. 检查文档链接
// 4. 生成报告
```

---

## 📚 相关文档

- [项目检视完成报告](./PROJECT_REVIEW_COMPLETE.md)
- [文档清理总结](./DOCS_CLEANUP_SUMMARY.md)
- [项目总结](./PROJECT_SUMMARY.md)

---

**最后更新**: 2025-01-25  
**状态**: ✅ 规则已制定
