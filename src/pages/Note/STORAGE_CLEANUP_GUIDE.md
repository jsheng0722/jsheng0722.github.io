# 存储清理和立即转换使用指南

## 🎯 功能概述

这个增强版数据管理系统解决了您提出的关键问题：
- ✅ **定时清理存储**：自动清理已转换为文件的数据
- ✅ **立即转换**：无需等待下次登录，立即将数据转换为文件
- ✅ **智能清理**：根据数据重要性和时间自动决定清理策略
- ✅ **存储优化**：避免localStorage过度占用空间

## 🧹 存储清理机制

### **自动清理规则**

```javascript
// 默认清理规则
const cleanupRules = {
  notes: {
    keepDays: 7,        // 保留7天
    maxItems: 50,       // 最多保留50条
    autoCleanup: true    // 自动清理
  },
  music: {
    keepDays: 30,       // 保留30天
    maxItems: 100,      // 最多保留100条
    autoCleanup: true
  },
  weather: {
    keepDays: 3,        // 保留3天
    maxItems: 20,       // 最多保留20条
    autoCleanup: true
  },
  diagrams: {
    keepDays: 14,       // 保留14天
    maxItems: 30,       // 最多保留30条
    autoCleanup: true
  }
};
```

### **清理触发条件**

1. **已转换为文件**：数据已成功转换为文件，从localStorage删除
2. **数据过期**：超过保留天数的数据自动清理
3. **数量超限**：超过最大条数限制，清理最旧的数据
4. **手动清理**：用户主动清理已转换数据

## ⚡ 立即转换功能

### **基础使用**

```javascript
import { useNotes } from '../hooks/useDataManager';

function MyComponent() {
  const { convertAndCleanup, convertAllData } = useNotes();

  // 立即转换单条数据
  const handleConvertSingle = async (note) => {
    try {
      const result = await convertAndCleanup(note);
      if (result.success) {
        alert('数据已转换为文件并清理');
      }
    } catch (error) {
      alert('转换失败：' + error.message);
    }
  };

  // 转换所有数据
  const handleConvertAll = async () => {
    try {
      const result = await convertAllData();
      alert(`转换完成：${result.message}`);
    } catch (error) {
      alert('转换失败：' + error.message);
    }
  };

  return (
    <div>
      <button onClick={handleConvertAll}>转换所有数据</button>
    </div>
  );
}
```

### **智能转换**

```javascript
import immediateConverter from '../utils/ImmediateConverter';

// 智能转换（根据数据重要性决定）
const result = await immediateConverter.smartConvert('notes', noteData, {
  importanceThreshold: 3,  // 重要性阈值
  forceConvert: false      // 是否强制转换
});

// 批量转换
const batchResult = await immediateConverter.batchConvertImmediately('notes', notesList);
```

### **保存时立即转换**

```javascript
// 保存数据时启用立即转换
await saveData(noteData, {
  immediateConvert: true  // 保存后立即转换并清理
});
```

## 🔧 高级功能

### **1. 存储清理调度器**

```javascript
import StorageCleanupScheduler from '../components/StorageCleanupScheduler';

function App() {
  const [showScheduler, setShowScheduler] = useState(false);

  return (
    <div>
      <button onClick={() => setShowScheduler(true)}>
        打开存储调度器
      </button>
      
      {showScheduler && <StorageCleanupScheduler />}
    </div>
  );
}
```

### **2. 自动清理管理**

```javascript
import storageCleanupManager from '../utils/StorageCleanupManager';

// 启动自动清理
storageCleanupManager.startAutoCleanup();

// 停止自动清理
storageCleanupManager.stopAutoCleanup();

// 手动清理特定类型
await storageCleanupManager.manualCleanupType('notes');

// 清理所有数据
await storageCleanupManager.manualCleanupAll();
```

### **3. 存储统计监控**

```javascript
// 获取存储统计
const stats = dataManager.getStorageStats();
console.log('存储统计:', stats);

// 获取转换统计
const conversionStats = immediateConverter.getConversionStats();
console.log('转换统计:', conversionStats);
```

## 📊 使用场景

### **场景1：用户保存笔记后立即转换**

```javascript
function NoteEditor() {
  const { saveData } = useNotes();

  const handleSave = async (noteData) => {
    // 保存时启用立即转换
    await saveData(noteData, {
      immediateConvert: true  // 保存后立即转换为文件并清理localStorage
    });
    
    alert('笔记已保存并转换为文件');
  };
}
```

### **场景2：批量转换历史数据**

```javascript
function DataMigration() {
  const { convertAllData } = useNotes();

  const handleMigrateAll = async () => {
    if (confirm('确定要转换所有历史数据吗？')) {
      const result = await convertAllData();
      alert(`迁移完成：${result.message}`);
    }
  };
}
```

### **场景3：定期清理存储**

```javascript
function App() {
  useEffect(() => {
    // 启动自动清理
    storageCleanupManager.startAutoCleanup();
    
    // 设置清理规则
    storageCleanupManager.setCleanupRules('notes', {
      keepDays: 7,
      maxItems: 50,
      autoCleanup: true
    });
  }, []);
}
```

## 🎨 完整示例

### **智能笔记编辑器**

```javascript
import React, { useState } from 'react';
import { useNotes } from '../hooks/useDataManager';

function SmartNoteEditor() {
  const { saveData, convertAndCleanup, getStorageStats } = useNotes();
  const [note, setNote] = useState({ title: '', content: '' });
  const [autoConvert, setAutoConvert] = useState(true);

  const handleSave = async () => {
    try {
      if (autoConvert) {
        // 保存并立即转换
        await saveData(note, { immediateConvert: true });
        alert('笔记已保存并转换为文件');
      } else {
        // 只保存到localStorage
        await saveData(note);
        alert('笔记已保存到本地存储');
      }
    } catch (error) {
      alert('保存失败：' + error.message);
    }
  };

  const handleConvertNow = async () => {
    try {
      await convertAndCleanup(note);
      alert('笔记已转换为文件');
    } catch (error) {
      alert('转换失败：' + error.message);
    }
  };

  const stats = getStorageStats();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">智能笔记编辑器</h2>
      
      {/* 存储状态 */}
      <div className="mb-4 p-3 bg-gray-100 rounded-lg">
        <p>本地存储: {stats.notes?.localCount || 0} 条</p>
        <p>文件存储: {stats.notes?.fileCount || 0} 个</p>
      </div>

      {/* 编辑器 */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="笔记标题"
          value={note.title}
          onChange={(e) => setNote(prev => ({ ...prev, title: e.target.value }))}
          className="w-full p-2 border rounded mb-2"
        />
        <textarea
          placeholder="笔记内容"
          value={note.content}
          onChange={(e) => setNote(prev => ({ ...prev, content: e.target.value }))}
          className="w-full p-2 border rounded h-32"
        />
      </div>

      {/* 选项 */}
      <div className="mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoConvert}
            onChange={(e) => setAutoConvert(e.target.checked)}
          />
          保存时立即转换为文件
        </label>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          保存笔记
        </button>
        
        {!autoConvert && (
          <button
            onClick={handleConvertNow}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            立即转换
          </button>
        )}
      </div>
    </div>
  );
}
```

## 🚨 注意事项

### **1. 数据安全**
- 转换前确保数据已正确保存
- 重要数据建议先备份
- 转换失败时数据仍保留在localStorage中

### **2. 性能优化**
- 大量数据时使用批量转换
- 定期清理避免localStorage过大
- 合理设置清理规则

### **3. 用户体验**
- 提供转换进度提示
- 转换失败时给出明确错误信息
- 允许用户选择转换策略

## 🎉 总结

这个增强版存储管理系统完美解决了您的需求：

### **✅ 解决的问题**
1. **定时清理存储**：自动清理已转换的数据，避免localStorage过度占用
2. **立即转换**：无需等待下次登录，立即将数据转换为文件
3. **智能管理**：根据数据重要性和时间自动决定清理策略
4. **存储优化**：保持localStorage的合理大小

### **🚀 核心特性**
- **自动清理**：24小时自动检查并清理过期数据
- **立即转换**：保存时或手动触发立即转换
- **智能策略**：根据数据重要性决定转换时机
- **批量操作**：支持批量转换和清理
- **实时监控**：提供存储统计和转换日志

### **💡 使用建议**
1. **新数据**：启用`immediateConvert`选项，保存后立即转换
2. **历史数据**：使用批量转换功能一次性处理
3. **定期维护**：启用自动清理，定期检查存储状态
4. **重要数据**：设置较长的保留时间，避免误删

现在您的网站拥有了完整的存储管理解决方案，既能保持数据的持久化，又能保持存储的合理大小！
