# 通用UI组件库使用指南

## 📚 概述

本项目已创建了统一的UI组件库，位于 `src/components/UI/` 目录下。所有组件都支持明暗主题切换，具有一致的样式和交互效果。

## 🎯 组件列表

### 1. Button - 按钮组件
```jsx
import { Button } from '../../components/UI';

// 基础使用
<Button onClick={handleClick}>点击我</Button>

// 带图标
<Button icon={<FaPlus />} iconPosition="left">添加</Button>

// 不同变体
<Button variant="primary">主要按钮</Button>
<Button variant="success">成功按钮</Button>
<Button variant="danger">危险按钮</Button>
<Button variant="ghost">幽灵按钮</Button>

// 不同尺寸
<Button size="small">小按钮</Button>
<Button size="medium">中按钮</Button>
<Button size="large">大按钮</Button>

// 加载状态
<Button loading>加载中...</Button>
```

### 2. Card - 卡片组件
```jsx
import { Card } from '../../components/UI';

// 基础卡片
<Card>
  <h3>卡片标题</h3>
  <p>卡片内容</p>
</Card>

// 不同变体
<Card variant="elevated">阴影卡片</Card>
<Card variant="outlined">边框卡片</Card>
<Card variant="filled">填充卡片</Card>

// 不同内边距
<Card padding="small">小内边距</Card>
<Card padding="large">大内边距</Card>

// 悬停效果
<Card hover>悬停卡片</Card>

// 可点击
<Card clickable onClick={handleClick}>可点击卡片</Card>
```

### 3. Collapsible - 伸缩组件
```jsx
import { Collapsible } from '../../components/UI';

// 基础伸缩
<Collapsible title="点击展开">
  <p>这里是展开的内容</p>
</Collapsible>

// 不同变体
<Collapsible variant="card" title="卡片样式">内容</Collapsible>
<Collapsible variant="minimal" title="简约样式">内容</Collapsible>

// 不同方向
<Collapsible direction="up" title="向上展开">内容</Collapsible>
<Collapsible direction="right" title="向右展开">内容</Collapsible>

// 默认展开
<Collapsible defaultExpanded title="默认展开">内容</Collapsible>

// 自定义图标位置
<Collapsible iconPosition="left" title="图标在左">内容</Collapsible>
```

### 4. Dialog - 对话框组件
```jsx
import { Dialog } from '../../components/UI';

// 基础对话框
<Dialog isOpen={isOpen} onClose={handleClose} title="确认">
  <p>确定要执行此操作吗？</p>
</Dialog>

// 不同类型
<Dialog type="info" title="信息">这是信息对话框</Dialog>
<Dialog type="success" title="成功">操作成功！</Dialog>
<Dialog type="warning" title="警告">请注意！</Dialog>
<Dialog type="danger" title="危险">危险操作！</Dialog>

// 不同尺寸
<Dialog size="small" title="小对话框">内容</Dialog>
<Dialog size="large" title="大对话框">内容</Dialog>
```

### 5. FloatingButton - 浮动按钮
```jsx
import { FloatingButton } from '../../components/UI';

// 基础浮动按钮
<FloatingButton onClick={handleClick}>
  <FaPlus />
</FloatingButton>

// 不同位置
<FloatingButton position="bottom-left">左下</FloatingButton>
<FloatingButton position="top-right">右上</FloatingButton>

// 不同变体
<FloatingButton variant="success">成功</FloatingButton>
<FloatingButton variant="danger">危险</FloatingButton>

// 带工具提示
<FloatingButton tooltip="添加新项目">添加</FloatingButton>
```

### 6. FloatingToolbar - 浮动工具栏
```jsx
import { FloatingToolbar } from '../../components/UI';

const tools = [
  {
    id: 'add',
    icon: <FaPlus />,
    label: '添加',
    onClick: handleAdd,
    color: 'from-blue-500 to-blue-700'
  },
  {
    id: 'edit',
    icon: <FaEdit />,
    label: '编辑',
    onClick: handleEdit,
    color: 'from-green-500 to-green-700'
  }
];

<FloatingToolbar tools={tools} position="right" />
```

### 7. Input - 输入框组件
```jsx
import { Input } from '../../components/UI';

// 基础输入框
<Input
  label="用户名"
  placeholder="请输入用户名"
  value={value}
  onChange={handleChange}
/>

// 不同变体
<Input variant="filled" label="填充样式" />
<Input variant="outlined" label="边框样式" />

// 不同尺寸
<Input size="small" label="小输入框" />
<Input size="large" label="大输入框" />

// 带图标
<Input icon={<FaUser />} iconPosition="left" label="用户名" />

// 密码输入框
<Input type="password" showPasswordToggle label="密码" />

// 错误状态
<Input error="用户名不能为空" label="用户名" />
```

### 8. Textarea - 文本域组件
```jsx
import { Textarea } from '../../components/UI';

// 基础文本域
<Textarea
  label="描述"
  placeholder="请输入描述"
  value={value}
  onChange={handleChange}
/>

// 自动调整高度
<Textarea
  autoResize
  minRows={3}
  maxRows={10}
  label="自动调整"
/>

// 不同变体
<Textarea variant="filled" label="填充样式" />
<Textarea variant="outlined" label="边框样式" />
```

### 9. Modal - 模态框组件
```jsx
import { Modal } from '../../components/UI';

// 基础模态框
<Modal isOpen={isOpen} onClose={handleClose} title="标题">
  <p>模态框内容</p>
</Modal>

// 不同尺寸
<Modal size="small" title="小模态框">内容</Modal>
<Modal size="large" title="大模态框">内容</Modal>

// 自定义样式
<Modal className="custom-modal" title="自定义">内容</Modal>
```

### 10. Badge - 徽章组件
```jsx
import { Badge } from '../../components/UI';

// 基础徽章
<Badge>新</Badge>

// 不同变体
<Badge variant="primary">主要</Badge>
<Badge variant="success">成功</Badge>
<Badge variant="warning">警告</Badge>
<Badge variant="danger">危险</Badge>

// 不同尺寸
<Badge size="small">小</Badge>
<Badge size="large">大</Badge>

// 方形徽章
<Badge rounded={false}>方形</Badge>
```

### 11. Tooltip - 工具提示组件
```jsx
import { Tooltip } from '../../components/UI';

// 基础工具提示
<Tooltip content="这是提示信息">
  <button>悬停我</button>
</Tooltip>

// 不同位置
<Tooltip position="top" content="顶部提示">
  <button>顶部</button>
</Tooltip>
<Tooltip position="bottom" content="底部提示">
  <button>底部</button>
</Tooltip>

// 自定义延迟
<Tooltip delay={500} content="延迟提示">
  <button>延迟</button>
</Tooltip>
```

### 12. Loading - 加载组件
```jsx
import { Loading } from '../../components/UI';

// 基础加载
<Loading />

// 不同变体
<Loading variant="spinner" />
<Loading variant="dots" />
<Loading variant="pulse" />

// 带文字
<Loading text="加载中..." />

// 不同尺寸
<Loading size="small" />
<Loading size="large" />
```

### 13. EmptyState - 空状态组件
```jsx
import { EmptyState } from '../../components/UI';

// 基础空状态
<EmptyState title="暂无数据" />

// 不同图标
<EmptyState icon="inbox" title="收件箱为空" />
<EmptyState icon="search" title="未找到结果" />
<EmptyState icon="warning" title="出现错误" />

// 带描述和操作
<EmptyState
  title="暂无数据"
  description="点击下方按钮添加第一个项目"
  action={<Button>添加项目</Button>}
/>

// 不同尺寸
<EmptyState size="small" title="小空状态" />
<EmptyState size="large" title="大空状态" />
```

## 🎨 主题支持

所有组件都支持明暗主题切换：

```jsx
// 组件会自动适应当前主题
<Button>自动主题</Button>
<Card>自动主题</Card>
```

## 📦 导入方式

### 方式1：按需导入（推荐）
```jsx
import { Button, Card, Collapsible } from '../../components/UI';
```

### 方式2：单独导入
```jsx
import Button from '../../components/UI/Button/Button';
import Card from '../../components/UI/Card/Card';
```

## 🔧 自定义样式

所有组件都支持通过 `className` 属性添加自定义样式：

```jsx
<Button className="my-custom-button">自定义按钮</Button>
<Card className="my-custom-card">自定义卡片</Card>
```

## 📝 最佳实践

1. **统一使用组件库**：优先使用通用组件，避免重复造轮子
2. **保持一致性**：使用相同的变体和尺寸保持界面一致性
3. **响应式设计**：组件已内置响应式支持
4. **无障碍访问**：组件已考虑键盘导航和屏幕阅读器支持
5. **性能优化**：组件使用React.memo和useMemo优化性能

## 🚀 示例项目

查看 `src/pages/Music/SimpleTextRecorder.js` 了解如何使用这些组件构建完整的页面。
