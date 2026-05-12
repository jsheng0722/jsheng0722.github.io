# Giscus 评论区配置说明

Portfolio 页底部已集成 Giscus，访客可用 **GitHub 账号**在「留言 / Comments」区评论，评论保存在你仓库的 **GitHub Discussions** 中。

## 一次性配置（约 3 分钟）

### 1. 在 GitHub 仓库开启 Discussions

1. 打开你的项目仓库（例如 `你的用户名/react-basic`）
2. 点击 **Settings** → 左侧 **General**
3. 在 **Features** 里勾选 **Discussions**
4. 可选：在仓库里 **Discussions** 标签下新建一个分类（如「留言」），类型选 **Announcements** 或 **General**

### 2. 安装 Giscus 应用

1. 打开：<https://github.com/apps/giscus>
2. 点击 **Install**，选择「只授权给当前这个仓库」或「All repositories」
3. 完成授权

### 3. 获取配置并填入项目

1. 打开：<https://giscus.app/zh-CN>
2. **Repository**：选择 `你的用户名/仓库名`（即本项目所在仓库）
3. **Page ↔️ Discussions 映射**：选「Discussion title contains page pathname」
4. **Discussion 分类**：选你在第 1 步里用的分类（或默认的 Announcements）
5. 页面会生成一段配置，记下其中的：
   - **data-repo**（如 `username/react-basic`）
   - **data-repo-id**（一串 `R_kgDO...`）
   - **data-category**（分类名称）
   - **data-category-id**（一串 `DIC_kwDO...`）

6. 在项目里二选一：

**方式 A：改配置文件（推荐）**

编辑 `src/config/giscus.js`，在 `giscusConfig` 里填：

```js
repo: '你的用户名/仓库名',
repoId: 'R_kgDO...',        // 从 giscus.app 复制
category: 'Announcements',  // 或你的分类名
categoryId: 'DIC_kwDO...',  // 从 giscus.app 复制
```

**方式 B：用环境变量**

在项目根目录建 `.env`（不要提交到 Git 可建 `.env.local`）：

```
REACT_APP_GISCUS_REPO=你的用户名/仓库名
REACT_APP_GISCUS_REPO_ID=R_kgDO...
REACT_APP_GISCUS_CATEGORY=Announcements
REACT_APP_GISCUS_CATEGORY_ID=DIC_kwDO...
```

### 4. 重新构建并部署

- 本地：`npm run build` 或 `npm start` 查看效果
- GitHub Pages：推送代码后等待部署，打开站点进入 **Portfolio** 页，滚动到底部即可看到评论区

## 未配置时

若未填写 `repoId` 和 `categoryId`，页面不会报错，只是不显示评论区（「留言 / Comments」标题和说明仍会显示）。

## 可选设置

在 `src/config/giscus.js` 中可改：

- **theme**：`light` / `dark` / `preferred_color_scheme`（跟随系统）
- **lang**：`zh-CN` / `en` 等
- **inputPosition**：`top`（输入框在上）或 `bottom`（在下）
