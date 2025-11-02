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

### Python代码
````markdown
```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(fibonacci(i))
```
````

### Java代码
````markdown
```java
public class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        
        return new int[0];
    }
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

## 🎨 颜色方案

### oneDark主题
- **背景**: 深色（#282c34）
- **文字**: 浅色（清晰可见）
- **关键字**: 紫色
- **字符串**: 绿色
- **函数**: 蓝色
- **注释**: 灰色
- **数字**: 橙色

### 对比度
- ✅ 高对比度，易于阅读
- ✅ 颜色丰富，语法清晰
- ✅ 暗色背景，护眼舒适

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

### 多行代码块
````markdown
```javascript
// 第一行
// 第二行
// 第三行
```
````

## 🎯 复制按钮详解

### 位置
- 代码块右上角
- 悬停时显示
- Z-index层级确保可点击

### 状态
- **默认**: 显示复制图标 + "复制"文字
- **复制后**: 显示对勾图标 + "已复制"文字
- **2秒后**: 自动恢复默认状态

### 样式
- 深灰色背景
- 浅灰色文字
- 圆角边框
- 悬停变色

## 🎊 完整效果

### 代码块功能
- ✅ 语法高亮
- ✅ 一键复制
- ✅ 深色主题
- ✅ 圆角边框
- ✅ 悬停按钮
- ✅ 复制反馈

### Markdown完整支持
- ✅ 标题（h1-h6）
- ✅ 粗体、斜体
- ✅ 代码块（语法高亮）
- ✅ 行内代码（粉色高亮）
- ✅ 列表（有序、无序）
- ✅ 引用块
- ✅ 表格
- ✅ 链接和图片

现在您的笔记可以完美显示代码了！💻✨
