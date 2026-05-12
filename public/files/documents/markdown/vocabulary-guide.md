# 📚 单词页面文件示例

这是一个演示如何在单词页面存储文件的示例。

## 📁 单词数据存储位置

```
public/files/data/json/
└── vocabulary/     # 单词数据
```

## ✅ 支持的文件类型

| 类型 | 扩展名 | 说明 |
|------|--------|------|
| JSON | .json | 单词数据 |

## 📌 单词数据格式

```json
{
  "id": "vocab-xxx",
  "word": "单词",
  "phonetic": "音标",
  "translation": "中文释义",
  "partOfSpeech": "词性",
  "level": "难度等级",
  "tags": ["标签1", "标签2"],
  "definition": "英文定义",
  "example": "例句",
  "exampleCN": "例句翻译",
  "synonyms": ["同义词"],
  "antonyms": ["反义词"],
  "mastery": 掌握程度(0-1)
}
```

## 📝 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | ✅ | 唯一标识 |
| word | string | ✅ | 单词 |
| phonetic | string | ✅ | 音标 |
| translation | string | ✅ | 中文释义 |
| partOfSpeech | string | ✅ | 词性 |
| level | string | | 难度等级 |
| tags | array | | 标签 |
| definition | string | | 英文定义 |
| example | string | | 例句 |
| exampleCN | string | | 例句翻译 |
| mastery | number | | 掌握程度 |

---

**提示**: 单词数据应使用 `.json` 扩展名，存储在 `/files/data/json/` 目录下。
