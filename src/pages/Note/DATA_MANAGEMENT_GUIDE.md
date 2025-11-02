# 统一数据管理系统使用指南

## 🎯 系统概述

这个统一数据管理系统为您的网站提供了完整的数据存储解决方案，支持：
- ✅ 临时存储（localStorage）
- ✅ 自动文件生成
- ✅ 数据同步
- ✅ 离线支持
- ✅ 自动保存
- ✅ 数据导入/导出

## 📁 数据存储结构

```
public/
├── data/
│   ├── notes/                    # 笔记数据
│   │   ├── 2024-01-15-algorithm-notes.json
│   │   ├── 2024-01-16-life-notes.json
│   │   └── index.json            # 笔记索引
│   ├── music/                    # 音乐数据
│   │   ├── playlists/
│   │   │   ├── chill-playlist.json
│   │   │   └── workout-playlist.json
│   │   ├── tracks/
│   │   │   ├── track-001.json
│   │   │   └── track-002.json
│   │   └── index.json            # 音乐索引
│   ├── weather/                  # 天气数据
│   │   ├── locations/
│   │   │   ├── beijing.json
│   │   │   └── shanghai.json
│   │   └── history/
│   │       └── 2024-01-15.json
│   ├── diagrams/                 # 图形数据
│   │   ├── 2024-01-15-workflow.json
│   │   ├── 2024-01-16-mindmap.json
│   │   └── index.json
│   └── logs/                     # 变更日志
│       ├── 2024-01-15-changes.json
│       └── 2024-01-16-changes.json
```

## 🚀 快速开始

### 1. 基础使用

```javascript
import { useNotes, useMusic, useWeather, useDiagrams } from '../hooks/useDataManager';

function MyComponent() {
  const {
    data: notes,
    loading,
    error,
    saveData,
    deleteData,
    enableAutoSave,
    disableAutoSave
  } = useNotes();

  const handleSave = async () => {
    try {
      await saveData({
        title: '我的笔记',
        content: '这是笔记内容',
        category: '随笔',
        tags: ['学习', '笔记']
      });
      alert('保存成功！');
    } catch (error) {
      alert('保存失败：' + error.message);
    }
  };

  return (
    <div>
      {loading && <p>加载中...</p>}
      {error && <p>错误：{error}</p>}
      <button onClick={handleSave}>保存笔记</button>
    </div>
  );
}
```

### 2. 自动保存

```javascript
function NoteEditor() {
  const { saveData, enableAutoSave, disableAutoSave } = useNotes();
  const [note, setNote] = useState({ title: '', content: '' });
  const [autoSave, setAutoSave] = useState(false);

  useEffect(() => {
    if (autoSave) {
      enableAutoSave(note, {
        interval: 30000,  // 30秒自动保存
        debounce: 2000   // 2秒防抖
      });
    } else {
      disableAutoSave();
    }
  }, [autoSave, note]);

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={autoSave}
          onChange={(e) => setAutoSave(e.target.checked)}
        />
        启用自动保存
      </label>
    </div>
  );
}
```

### 3. 数据同步

```javascript
function DataSync() {
  const { syncData, saveStatus } = useNotes();

  const handleSync = async () => {
    try {
      await syncData();
      alert('数据同步成功！');
    } catch (error) {
      alert('同步失败：' + error.message);
    }
  };

  return (
    <div>
      <p>网络状态：{saveStatus.isOnline ? '在线' : '离线'}</p>
      <p>保存状态：{saveStatus.hasUnsavedChanges ? '有未保存更改' : '已保存'}</p>
      <button onClick={handleSync}>同步数据</button>
    </div>
  );
}
```

## 📝 详细功能说明

### 数据管理器 (DataManager)

#### 保存数据
```javascript
import dataManager from '../utils/DataManager';

// 保存笔记
const note = {
  title: '我的笔记',
  content: '笔记内容',
  category: '随笔',
  tags: ['学习']
};

await dataManager.saveData('notes', note, {
  fileName: 'custom-filename.json'  // 可选：自定义文件名
});
```

#### 加载数据
```javascript
// 从localStorage加载
const localData = dataManager.getLocalData('notes');

// 从文件加载
const fileData = await dataManager.loadFromFiles('notes');

// 合并数据（推荐）
const mergedData = await dataManager.getMergedData('notes');
```

#### 删除数据
```javascript
await dataManager.deleteData('notes', 'note-id');
```

### 自动保存管理器 (AutoSaveManager)

#### 启用自动保存
```javascript
import autoSaveManager from '../utils/AutoSaveManager';

autoSaveManager.enableAutoSave('notes', noteData, {
  interval: 30000,  // 30秒保存一次
  debounce: 2000    // 2秒防抖
});
```

#### 禁用自动保存
```javascript
autoSaveManager.disableAutoSave('notes');
```

#### 获取保存状态
```javascript
const status = autoSaveManager.getSaveStatus('notes');
console.log(status.lastSaved);        // 最后保存时间
console.log(status.hasUnsavedChanges); // 是否有未保存更改
console.log(status.isOnline);         // 是否在线
```

### 文件生成器 (FileGenerator)

#### 生成文件
```javascript
import fileGenerator from '../utils/FileGenerator';

const result = await fileGenerator.generateFile('notes', noteData, {
  fileName: 'custom-name.json'  // 可选：自定义文件名
});

if (result.success) {
  console.log('文件生成成功：', result.fileName);
} else {
  console.error('文件生成失败：', result.error);
}
```

#### 批量生成文件
```javascript
const results = await fileGenerator.batchGenerate('notes', notesList);
```

#### 生成备份
```javascript
const backup = await fileGenerator.generateBackup('notes');
```

## 🔧 高级功能

### 1. 自定义数据模板

```javascript
// 在 FileGenerator 中添加自定义模板
fileGenerator.templates.custom = (data) => {
  return {
    json: {
      id: data.id,
      customField: data.customField,
      // ... 其他字段
    }
  };
};
```

### 2. 数据验证

```javascript
const validateNote = (note) => {
  if (!note.title) {
    throw new Error('笔记标题不能为空');
  }
  if (!note.content) {
    throw new Error('笔记内容不能为空');
  }
  return true;
};

// 在保存前验证
const handleSave = async (note) => {
  try {
    validateNote(note);
    await saveData(note);
  } catch (error) {
    alert('验证失败：' + error.message);
  }
};
```

### 3. 数据过滤和搜索

```javascript
const { data: notes } = useNotes();

// 过滤笔记
const filteredNotes = notes.filter(note => 
  note.category === '算法' && 
  note.tags.includes('LeetCode')
);

// 搜索笔记
const searchNotes = (query) => {
  return notes.filter(note =>
    note.title.toLowerCase().includes(query.toLowerCase()) ||
    note.content.toLowerCase().includes(query.toLowerCase())
  );
};
```

### 4. 数据统计

```javascript
const getNotesStats = (notes) => {
  const stats = {
    total: notes.length,
    byCategory: {},
    byTag: {},
    recent: notes.filter(note => 
      new Date(note.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length
  };

  notes.forEach(note => {
    // 按分类统计
    stats.byCategory[note.category] = (stats.byCategory[note.category] || 0) + 1;
    
    // 按标签统计
    note.tags.forEach(tag => {
      stats.byTag[tag] = (stats.byTag[tag] || 0) + 1;
    });
  });

  return stats;
};
```

## 🎨 组件集成示例

### 笔记编辑器
```javascript
function NoteEditor() {
  const { saveData, enableAutoSave, disableAutoSave } = useNotes();
  const [note, setNote] = useState({ title: '', content: '' });
  const [autoSave, setAutoSave] = useState(false);

  useEffect(() => {
    if (autoSave) {
      enableAutoSave(note, { interval: 30000, debounce: 2000 });
    } else {
      disableAutoSave();
    }
  }, [autoSave, note]);

  const handleSave = async () => {
    try {
      await saveData(note);
      alert('保存成功！');
    } catch (error) {
      alert('保存失败：' + error.message);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={note.title}
        onChange={(e) => setNote(prev => ({ ...prev, title: e.target.value }))}
        placeholder="笔记标题"
      />
      <textarea
        value={note.content}
        onChange={(e) => setNote(prev => ({ ...prev, content: e.target.value }))}
        placeholder="笔记内容"
      />
      <label>
        <input
          type="checkbox"
          checked={autoSave}
          onChange={(e) => setAutoSave(e.target.checked)}
        />
        自动保存
      </label>
      <button onClick={handleSave}>保存</button>
    </div>
  );
}
```

### 音乐播放器
```javascript
function MusicPlayer() {
  const { data: music, saveData, deleteData } = useMusic();
  const [currentTrack, setCurrentTrack] = useState(null);

  const handleAddToPlaylist = async (track) => {
    try {
      await saveData({
        ...track,
        playlist: 'favorites'
      });
      alert('已添加到收藏');
    } catch (error) {
      alert('添加失败：' + error.message);
    }
  };

  return (
    <div>
      {music.map(track => (
        <div key={track.id}>
          <h3>{track.title}</h3>
          <p>{track.artist}</p>
          <button onClick={() => handleAddToPlaylist(track)}>
            添加到收藏
          </button>
        </div>
      ))}
    </div>
  );
}
```

## 🚨 注意事项

### 1. 数据备份
- 定期导出重要数据
- 使用 `generateBackup()` 创建备份
- 离线时数据会保存在localStorage中

### 2. 性能优化
- 大量数据时考虑分页加载
- 使用防抖避免频繁保存
- 定期清理过期数据

### 3. 错误处理
- 始终使用 try-catch 处理异步操作
- 提供用户友好的错误提示
- 实现重试机制

### 4. 数据一致性
- 使用唯一ID标识数据
- 实现乐观锁机制
- 处理并发修改冲突

## 📚 完整示例

查看 `src/examples/DataManagementExample.js` 获取完整的使用示例。

## 🎉 总结

这个统一数据管理系统为您的网站提供了：
- ✅ 完整的数据存储解决方案
- ✅ 自动保存和同步功能
- ✅ 离线支持
- ✅ 文件自动生成
- ✅ 数据导入/导出
- ✅ 简单易用的API

现在您可以轻松管理网站的所有数据，同时保持数据的持久化和可移植性！
