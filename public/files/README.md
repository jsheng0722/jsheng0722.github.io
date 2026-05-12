# 统一文件存储目录

本目录用于存储所有用户文件，支持多种文件类型的直接浏览器预览。

## 目录结构

```
files/
├── documents/              # 文档类文件
│   ├── markdown/          # Markdown 文件 (.md)
│   │   └── notes/        # 笔记文章
│   ├── word/             # Word 文档 (.docx, .doc)
│   ├── pdf/              # PDF 文件 (.pdf)
│   ├── excel/            # Excel 表格 (.xlsx, .xls, .csv)
│   └── code/             # 代码文件 (.js, .py, .java 等)
│
├── media/                 # 媒体类文件
│   ├── images/           # 图片 (.jpg, .png, .gif, .svg, .webp)
│   ├── audio/            # 音频 (.mp3, .wav, .ogg, .flac)
│   └── video/            # 视频 (.mp4, .webm, .avi)
│
└── archives/              # 压缩包 (.zip, .rar, .7z)

metadata/                  # 元数据目录
├── file-index.json       # 全局文件索引
└── categories.json       # 分类配置
```

## 支持的文件类型

### 文档类
| 类型 | 扩展名 | 渲染方式 |
|------|--------|----------|
| Markdown | .md | react-markdown 解析为 HTML |
| Word | .docx, .doc | mammoth.js 转换为 HTML |
| PDF | .pdf | pdfjs-dist 渲染 |
| Excel | .xlsx, .xls, .csv | xlsx 表格展示 |
| 纯文本 | .txt, .rtf | 直接显示 |
| 代码 | .js, .ts, .py, .java 等 | 语法高亮 |

### 媒体类
| 类型 | 扩展名 | 渲染方式 |
|------|--------|----------|
| 图片 | .jpg, .png, .gif, .svg, .webp | `<img>` 显示 |
| 音频 | .mp3, .wav, .ogg, .flac | HTML5 `<audio>` |
| 视频 | .mp4, .webm, .avi | HTML5 `<video>` |

### 其他
| 类型 | 扩展名 | 处理方式 |
|------|--------|----------|
| 压缩包 | .zip, .rar, .7z | 提供下载链接 |
| 其他 | * | 提供下载链接 |

## 使用方式

1. 将文件放入对应类型的子目录
2. 系统会自动检测并添加到文件索引
3. 通过文件管理器 (`/files`) 浏览和预览

## 文件命名规范

- 使用英文或拼音命名，避免特殊字符
- 扩展名使用小写
- 示例：`my-note.md`, `report-2024.docx`, `photo.jpg`
