# 代码块功能说明

## ✨ 完整的代码高亮和复制功能

### 🎨 代码块渲染

#### 主题
- **oneDark** - Atom One Dark主题
- 深色背景，文字清晰可见
- 颜色对比度高，易于阅读

#### 样式特点
- 🎨 语法高亮（关键字、函数、字符串等不同颜色）
- 📋 圆角边框
- 🌈 支持100+种编程语言
- 🌙 暗黑模式友好

### 📋 复制功能

#### 使用方法
1. 将鼠标悬停在代码块上
2. 右上角出现"复制"按钮
3. 点击按钮
4. 代码复制到剪贴板
5. 按钮变为"已复制"（2秒后恢复）

#### 特点
- 🖱️ 悬停显示按钮
- ✅ 点击即可复制
- 💫 平滑过渡动画
- ⏱️ 2秒后自动恢复

## 💻 使用示例

### JavaScript代码
````markdown
```javascript
function twoSum(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
    
    return [];
}
```
````

## 🎯 支持的语言

### 常用语言
- JavaScript (javascript, js)
- TypeScript (typescript, ts)
- Python (python, py)
- Java (java)
- C++ (cpp, c++)
- C (c)
- C# (csharp, cs)
- Go (go)
- Rust (rust)
- PHP (php)

### Web技术
- HTML (html)
- CSS (css)
- SCSS (scss, sass)
- JSX (jsx)
- TSX (tsx)

### 数据格式
- JSON (json)
- YAML (yaml, yml)
- XML (xml)
- Markdown (markdown, md)

### 其他
- SQL (sql)
- Bash (bash, shell)
- PowerShell (powershell)
- 等100+种语言

## 💡 使用技巧

### 指定语言
````markdown
```javascript  ← 必须指定语言
代码内容
```
````

### 语言别名
```markdown
```js       ← javascript的简写
```py       ← python的简写
```cpp      ← c++的简写
```ts       ← typescript的简写
```

### 行内代码
```markdown
使用 `console.log()` 打印日志
```

效果：粉色背景的行内代码

## 📚 相关文档

- [笔记系统完整指南](../pages/FINAL_GUIDE.md)
- [Markdown 渲染](../pages/MARKDOWN_RENDERING.md)

---

**最后更新**: 2025-01-25  
**状态**: ✅ 功能完整可用
