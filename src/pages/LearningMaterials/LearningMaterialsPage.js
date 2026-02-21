import React, { useEffect, useMemo, useState } from 'react';
import { FaBookOpen, FaPlus, FaEdit, FaTrash, FaExternalLinkAlt } from 'react-icons/fa';
import { Button, Card, EmptyState, Input, SearchBox, Textarea, Badge } from '../../components/UI';
import PageLayout from '../../components/Layout/PageLayout';

const STORAGE_KEY = 'learningMaterialsList';

const MATERIAL_TYPES = [
  { value: 'pdf', label: 'PDF' },
  { value: 'doc', label: '文档' },
  { value: 'video', label: '视频' },
  { value: 'course', label: '课程' },
  { value: 'code', label: '代码' },
  { value: 'link', label: '链接' },
  { value: 'other', label: '其他' }
];

function loadMaterials() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (_) {
    return [];
  }
}

function saveMaterials(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function LearningMaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    type: 'pdf',
    filePath: '',
    description: '',
    tags: ''
  });

  useEffect(() => {
    setMaterials(loadMaterials());
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return materials;
    return materials.filter((item) =>
      (item.title || '').toLowerCase().includes(q) ||
      (item.type || '').toLowerCase().includes(q) ||
      (item.filePath || '').toLowerCase().includes(q) ||
      (item.description || '').toLowerCase().includes(q) ||
      (item.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }, [materials, search]);

  const resetForm = () => {
    setForm({ title: '', type: 'pdf', filePath: '', description: '', tags: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) {
      alert('请填写资料标题');
      return;
    }
    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const item = {
      id: editingId ?? Date.now(),
      title,
      type: form.type,
      filePath: form.filePath.trim(),
      description: form.description.trim(),
      tags,
      updatedAt: new Date().toISOString()
    };

    const next = editingId != null
      ? materials.map((m) => (m.id === editingId ? item : m))
      : [...materials, item];

    setMaterials(next);
    saveMaterials(next);
    resetForm();
  };

  const handleEdit = (item) => {
    setForm({
      title: item.title || '',
      type: item.type || 'pdf',
      filePath: item.filePath || '',
      description: item.description || '',
      tags: (item.tags || []).join(', ')
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('确定删除这条学习资料？')) return;
    const next = materials.filter((m) => m.id !== id);
    setMaterials(next);
    saveMaterials(next);
    if (editingId === id) resetForm();
  };

  return (
    <PageLayout className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">学习资料</h1>
        <p className="text-gray-600 dark:text-gray-400">
          存储学习相关文件或链接（本地保存）。
        </p>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <SearchBox
            placeholder="搜索标题、类型、路径、描述、标签..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-0"
          />
          <Button
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
            icon={showForm ? <FaEdit /> : <FaPlus />}
            iconPosition="left"
          >
            {showForm ? '收起表单' : '添加资料'}
          </Button>
        </div>
      </Card>

      {showForm && (
        <Card className="mb-6 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {editingId ? '编辑学习资料' : '新增学习资料'}
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="标题 *"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="例如：英语语法总结 PDF"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">类型</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  {MATERIAL_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Input
              label="文件路径 / 链接"
              value={form.filePath}
              onChange={(e) => setForm((f) => ({ ...f, filePath: e.target.value }))}
              placeholder="例如：/docs/english/grammar.pdf 或 https://..."
            />
            <Textarea
              label="说明"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="记录这份资料的用途、重点等"
              rows={3}
            />
            <Input
              label="标签（逗号分隔）"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="英语, 语法, 期末复习"
            />
            <div className="flex gap-2">
              <Button type="submit" icon={<FaPlus />} iconPosition="left">
                {editingId ? '保存修改' : '添加资料'}
              </Button>
              <Button type="button" variant="ghost" onClick={resetForm}>
                取消
              </Button>
            </div>
          </form>
        </Card>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon="inbox"
          title={search ? '未找到匹配资料' : '还没有学习资料'}
          description={search ? '试试其他搜索关键词' : '点击“添加资料”开始整理学习文件'}
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filtered.map((item) => (
              <li key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <FaBookOpen className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</span>
                      <Badge variant="default" size="small">{item.type}</Badge>
                    </div>
                    {item.filePath && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                        {item.filePath}
                      </p>
                    )}
                    {item.description && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{item.description}</p>
                    )}
                    {item.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="default" size="small">#{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.filePath && (
                      <Button
                        size="small"
                        variant="ghost"
                        icon={<FaExternalLinkAlt />}
                        onClick={() => window.open(item.filePath, '_blank')}
                        title="打开文件/链接"
                      />
                    )}
                    <Button
                      size="small"
                      variant="ghost"
                      icon={<FaEdit />}
                      onClick={() => handleEdit(item)}
                      title="编辑"
                    />
                    <Button
                      size="small"
                      variant="danger"
                      icon={<FaTrash />}
                      onClick={() => handleDelete(item.id)}
                      title="删除"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </PageLayout>
  );
}

export default LearningMaterialsPage;
