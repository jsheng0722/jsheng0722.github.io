# 静态网页日历事件管理实现方案

## 📋 概述

静态网页可以通过多种方式实现日历事件管理，包括数据存储、事件提醒和外部服务集成。本文档详细介绍了各种实现方案。

## 🗄️ 数据存储方案

### 1. localStorage（已实现）
```javascript
// 存储事件
localStorage.setItem('calendarEvents', JSON.stringify(events));

// 读取事件
const events = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
```

**优点：**
- 简单易用，无需服务器
- 数据持久化在浏览器中
- 响应速度快

**缺点：**
- 数据仅限当前浏览器
- 无法跨设备同步
- 存储容量有限（通常5-10MB）

### 2. IndexedDB（推荐用于复杂应用）
```javascript
// 打开数据库
const request = indexedDB.open('CalendarDB', 1);

// 存储事件
const transaction = db.transaction(['events'], 'readwrite');
const store = transaction.objectStore('events');
store.add(event);
```

**优点：**
- 存储容量大（通常几百MB到几GB）
- 支持复杂查询
- 异步操作，不阻塞UI

**缺点：**
- 实现相对复杂
- 浏览器兼容性需要考虑

### 3. JSON文件 + 静态托管
```javascript
// 从JSON文件加载事件
fetch('/data/events.json')
  .then(response => response.json())
  .then(events => setEvents(events));
```

**优点：**
- 数据可跨设备访问
- 易于备份和版本控制
- 支持多人协作

**缺点：**
- 需要手动更新文件
- 无法实时同步

## 🔔 事件提醒实现

### 1. 浏览器原生通知（已实现）
```javascript
// 请求通知权限
Notification.requestPermission();

// 发送通知
new Notification('事件提醒', {
  body: '您有一个重要会议即将开始',
  icon: '/icon.png'
});
```

### 2. 定时器检查
```javascript
// 每分钟检查即将到来的事件
setInterval(() => {
  checkUpcomingEvents();
}, 60000);
```

### 3. Service Worker（高级）
```javascript
// 注册Service Worker
navigator.serviceWorker.register('/sw.js');

// 在Service Worker中处理通知
self.addEventListener('message', event => {
  if (event.data.type === 'SCHEDULE_NOTIFICATION') {
    self.registration.showNotification(event.data.title, event.data.options);
  }
});
```

## 🔗 外部服务集成

### 1. Google Calendar API
```javascript
// 需要OAuth2认证
const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

**实现步骤：**
1. 在Google Cloud Console创建项目
2. 启用Calendar API
3. 创建OAuth2凭据
4. 实现认证流程
5. 调用API获取/创建事件

### 2. Notion API
```javascript
// 查询Notion数据库
const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${notionToken}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28'
  },
  body: JSON.stringify({
    filter: {
      property: 'Date',
      date: {
        equals: '2024-01-15'
      }
    }
  })
});
```

### 3. Airtable API
```javascript
// 获取Airtable记录
const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
  headers: {
    'Authorization': `Bearer ${airtableToken}`
  }
});
```

## 📱 移动端适配

### 1. PWA支持
```json
// manifest.json
{
  "name": "个人日历",
  "short_name": "日历",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### 2. 触摸手势
```javascript
// 支持滑动切换月份
let startX = 0;
let startY = 0;

element.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});

element.addEventListener('touchend', (e) => {
  const endX = e.changedTouches[0].clientX;
  const deltaX = endX - startX;
  
  if (Math.abs(deltaX) > 50) {
    if (deltaX > 0) {
      // 向右滑动，显示上个月
      showPreviousMonth();
    } else {
      // 向左滑动，显示下个月
      showNextMonth();
    }
  }
});
```

## 🔧 高级功能

### 1. 事件重复
```javascript
const repeatPatterns = {
  daily: (startDate, endDate) => {
    // 生成每日重复事件
  },
  weekly: (startDate, endDate, weekdays) => {
    // 生成每周重复事件
  },
  monthly: (startDate, endDate) => {
    // 生成每月重复事件
  }
};
```

### 2. 事件分类和标签
```javascript
const eventCategories = {
  work: { color: '#3B82F6', icon: '💼' },
  personal: { color: '#10B981', icon: '🏠' },
  health: { color: '#F59E0B', icon: '🏥' },
  social: { color: '#EF4444', icon: '👥' }
};
```

### 3. 事件搜索和筛选
```javascript
const filterEvents = (events, filters) => {
  return events.filter(event => {
    if (filters.category && event.category !== filters.category) return false;
    if (filters.dateRange) {
      const eventDate = new Date(event.date);
      if (eventDate < filters.dateRange.start || eventDate > filters.dateRange.end) return false;
    }
    if (filters.search && !event.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
};
```

## 🚀 部署和优化

### 1. 静态文件部署
- **GitHub Pages**: 免费，支持自定义域名
- **Netlify**: 自动部署，支持表单处理
- **Vercel**: 快速部署，支持边缘函数

### 2. 性能优化
```javascript
// 虚拟滚动（大量事件时）
const VirtualizedEventList = ({ events, height }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  
  // 只渲染可见的事件
  const visibleEvents = events.slice(visibleRange.start, visibleRange.end);
  
  return (
    <div style={{ height }} onScroll={handleScroll}>
      {visibleEvents.map(event => <EventItem key={event.id} event={event} />)}
    </div>
  );
};
```

### 3. 离线支持
```javascript
// 使用Service Worker缓存
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/events')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});
```

## 📊 数据同步策略

### 1. 冲突解决
```javascript
const resolveConflicts = (localEvents, remoteEvents) => {
  const merged = [...localEvents];
  
  remoteEvents.forEach(remoteEvent => {
    const localIndex = merged.findIndex(e => e.id === remoteEvent.id);
    if (localIndex >= 0) {
      // 使用最后修改时间决定保留哪个版本
      if (remoteEvent.lastModified > merged[localIndex].lastModified) {
        merged[localIndex] = remoteEvent;
      }
    } else {
      merged.push(remoteEvent);
    }
  });
  
  return merged;
};
```

### 2. 增量同步
```javascript
const syncIncremental = async (lastSyncTime) => {
  const response = await fetch(`/api/events?since=${lastSyncTime}`);
  const changes = await response.json();
  
  // 应用增量更改
  changes.forEach(change => {
    if (change.type === 'create' || change.type === 'update') {
      updateEvent(change.event);
    } else if (change.type === 'delete') {
      deleteEvent(change.eventId);
    }
  });
  
  localStorage.setItem('lastSyncTime', new Date().toISOString());
};
```

## 🎯 最佳实践

1. **数据备份**: 定期导出事件数据
2. **错误处理**: 优雅处理网络错误和权限问题
3. **用户体验**: 提供加载状态和错误提示
4. **安全性**: 验证用户输入，防止XSS攻击
5. **可访问性**: 支持键盘导航和屏幕阅读器

## 🔮 未来扩展

1. **AI集成**: 使用AI分析事件模式，提供智能建议
2. **语音输入**: 支持语音创建事件
3. **地理位置**: 基于位置的事件提醒
4. **团队协作**: 多人共享日历
5. **数据分析**: 事件统计和趋势分析
