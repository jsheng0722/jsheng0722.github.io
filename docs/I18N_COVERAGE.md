# 中英切换 (i18n) 覆盖说明

## 实现方式

- **Context**：`src/context/I18nContext.js` 提供 `useI18n()`，返回 `{ t, locale, switchLocale }`。
- **翻译表**：同一文件内 `translations.en` / `translations.zh`，通过 `t('Key')` 取当前语言文案。
- **持久化**：语言选择保存在 `localStorage` 的 `locale`（`zh` / `en`）。

## 已覆盖

- **顶部导航**（Header）：所有菜单项与语言下拉已用 `t()`。
- **博客页**（BlogHome）：标题艺术字、动态/副标题、搜索、发布/编辑、alert、删除确认框。
- **单词本**（VocabularyPage）：总词数/生词/熟词、标题与副标题、同步/管理词根词缀、词根词缀词典、表单标签与占位、所有 alert 与确认框。
- **笔记**（NoteHome / NoteEditor / NoteView）：分类标签、我的笔记本/副标题、搜索占位、布局切换、同步到项目、写笔记、空状态、保存/更新/放弃编辑/确认删除等 alert。
- **学习资料**（LearningMaterialsPage）：页面标题、请填写资料标题、确定删除等。
- **视频收藏**（VideoPlayer）：我的视频收藏/副标题、收藏视频、请填写标题和视频链接、视频收藏成功、确定删除等。
- **商品收藏**（ShopHome）：我的商品收藏、副标题。
- **文件管理**（FileManager）：无法找到对应的笔记、该文件类型暂不支持直接打开。
- **导出/打印**（DataExportImport）：暂无数据可导出、解析失败、暂无数据可打印，以及导出/导入/打印按钮默认文案（可被 props 覆盖）。
- **404**（NotFoundPage）：标题、说明、返回首页。
- **PDF 编辑**（PdfEditorPage）：请先输入文字。

## 未覆盖（可后续按需接入）

| 位置 | 说明 |
|------|------|
| **AccountingPage** | 列名（类型、金额、分类、日期、备注）与收支分类、星期等为中文，可按需加 Key |
| **Calendar / AdvancedCalendar / CompactCalendar** | 请填写必要信息、文件格式错误等 |
| **ConfirmDialog** | 默认 title/message 为中文，调用方传入 `t()` 即可（如 Blog 已做） |
| **AddProduct / 其他子页面** | 部分表单标签、占位、按钮仍为中文，可按需补充 Key 并替换 |

## 扩展步骤

1. 在 `I18nContext.js` 的 `translations.en` 和 `translations.zh` 中增加新键值，例如：  
   `NewKey: 'English text'` 与 `NewKey: '中文文案'`。
2. 在页面或组件中：  
   `const { t } = useI18n();`  
   将需切换的字符串改为 `t('NewKey')`。
3. 若文案含动态内容，可继续用模板字符串：  
   `` `${t('Prefix')} ${variable} ${t('Suffix')}` ``。
