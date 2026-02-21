# 项目内存储的学习与笔记数据

本目录用于存放可从页面「同步到项目」写入或下载的 JSON，便于随项目 push 到 GitHub。

## 目录说明

- **`notes/`**  
  - 放入 **`userNotes.json`**：在「笔记」页面点击「同步到项目」会写入或下载该文件，放入此目录后 push，下次打开将优先从此加载。
  - 根目录的 `noteList_s.json` 仍为原有静态笔记列表，与 `notes/userNotes.json` 会合并显示。

- **`vocabulary/`**  
  - **`words.json`**：单词本词库。在「单词本」页面点击「同步到项目」会写入或下载 `words.json` 与 `rootsAffixes.json`，放入此目录后 push，下次打开将优先从此加载。
  - **`rootsAffixes.json`**：词根词缀词典（可选）。同上，由同步按钮写入或下载后放入此目录。

## 使用步骤

- **Chrome / Edge（推荐）**：点击「同步到项目」后，在弹窗中选择本项目的 `public/content/notes` 或 `public/content/vocabulary` 文件夹，文件会直接写入该目录，无需手动移动。
- **其他浏览器**：点击「同步到项目」会下载对应 JSON，请将下载的文件放入上面对应的子目录。
- 最后正常 `git add`、`commit`、`push` 到 GitHub 即可。
