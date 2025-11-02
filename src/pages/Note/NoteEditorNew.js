import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import { FaSave, FaTimes, FaBook, FaHeart, FaPencilAlt, FaCode, FaTags, FaPlus, FaProjectDiagram, FaTextHeight, FaSearchPlus, FaSearchMinus, FaCloud, FaCloudUpload } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import CodeBlock from '../../components/CodeBlock';
import DiagramEditor from '../../components/DiagramEditor/DiagramEditor';
import FloatingActionButton from '../../components/FloatingActionButton';
import FloatingToolbar from '../../components/FloatingToolbar';
import { useNotes } from '../../hooks/useDataManager';

function NoteEditorNew() {
  const navigate = useNavigate();
  const location = useLocation();
  const editNote = location.state?.editNote;
  const isEditing = !!editNote;

  // 使用新的数据管理Hook
  const {
    data: notes,
    loading,
    error,
    saveStatus,
    saveData,
    enableAutoSave,
    disableAutoSave,
    generateFile
  } = useNotes();

  const [note, setNote] = useState(editNote || {
    title: '',
    author: 'Jihui',
    date: new Date().toISOString().split('T')[0],
    category: '随笔',
    tags: [],
    content: '',
    excerpt: '',
    readTime: '1分钟',
    difficulty: '',
    problemNumber: '',
    timeComplexity: '',
    spaceComplexity: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDiagramEditor, setShowDiagramEditor] = useState(false);
  const [diagramData, setDiagramData] = useState(editNote?.diagram || null);
  const [contentZoom, setContentZoom] = useState(100);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);

  const categories = [
    { id: 'life', name: '生活', icon: <FaHeart />, color: 'pink' },
    { id: 'essay', name: '随笔', icon: <FaPencilAlt />, color: 'purple' },
    { id: '算法', name: '算法', icon: <FaCode />, color: 'green' }
  ];

  // 启用自动保存
  useEffect(() => {
    if (autoSaveEnabled) {
      enableAutoSave(note, {
        interval: 30000, // 30秒自动保存
        debounce: 2000   // 2秒防抖
      });
    } else {
      disableAutoSave();
    }

    return () => {
      disableAutoSave();
    };
  }, [autoSaveEnabled, note, enableAutoSave, disableAutoSave]);

  const handleAddTag = () => {
    if (tagInput.trim() && !note.tags.includes(tagInput.trim())) {
      setNote(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNote(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = async () => {
    if (!note.title.trim()) {
      alert('请输入笔记标题');
      return;
    }

    setSaving(true);
    try {
      // 计算阅读时间
      const wordCount = note.content.split(/\s+/).length;
      const readTime = Math.max(1, Math.ceil(wordCount / 200));
      
      const noteData = {
        ...note,
        id: note.id || Date.now().toString(),
        readTime: `${readTime}分钟`,
        excerpt: note.content.substring(0, 150) + (note.content.length > 150 ? '...' : ''),
        updatedAt: new Date().toISOString()
      };

      // 保存到数据管理器
      const savedNote = await saveData(noteData);
      
      // 生成文件
      await generateFile(savedNote);
      
      alert('笔记保存成功！');
      navigate('/notes');
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (newContent) => {
    setNote(prev => ({
      ...prev,
      content: newContent
    }));
  };

  const handleDiagramSave = (diagramData) => {
    setDiagramData(diagramData);
    setNote(prev => ({
      ...prev,
      diagram: diagramData
    }));
    setShowDiagramEditor(false);
  };

  const handleZoomIn = () => {
    setContentZoom(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setContentZoom(prev => Math.max(prev - 10, 50));
  };

  const handleResetZoom = () => {
    setContentZoom(100);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 保存状态指示器 */}
        <div className="mb-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            {saveStatus.hasUnsavedChanges ? (
              <FaCloud className="text-yellow-500" />
            ) : (
              <FaCloudUpload className="text-green-500" />
            )}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {saveStatus.hasUnsavedChanges ? '有未保存的更改' : '已保存'}
            </span>
          </div>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              自动保存
            </span>
          </label>
        </div>

        {/* 编辑器头部 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 左侧：基本信息 */}
            <div className="flex-1 space-y-4">
              {/* 标题 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  笔记标题 *
                </label>
                <input
                  type="text"
                  value={note.title}
                  onChange={(e) => setNote(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="输入笔记标题..."
                />
              </div>

              {/* 分类选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  分类
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setNote(prev => ({ ...prev, category: category.name }))}
                      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                        note.category === category.name
                          ? `bg-${category.color}-100 text-${category.color}-700 dark:bg-${category.color}-900/30 dark:text-${category.color}-400`
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span className="text-lg">{category.icon}</span>
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 标签 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  标签
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {note.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm flex items-center gap-2"
                    >
                      #{tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="输入标签..."
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 右侧：算法相关字段 */}
            {note.category === '算法' && (
              <div className="lg:w-80 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  算法信息
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    题目编号
                  </label>
                  <input
                    type="text"
                    value={note.problemNumber}
                    onChange={(e) => setNote(prev => ({ ...prev, problemNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="如：LeetCode 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    难度
                  </label>
                  <select
                    value={note.difficulty}
                    onChange={(e) => setNote(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">选择难度</option>
                    <option value="简单">简单</option>
                    <option value="中等">中等</option>
                    <option value="困难">困难</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    时间复杂度
                  </label>
                  <input
                    type="text"
                    value={note.timeComplexity}
                    onChange={(e) => setNote(prev => ({ ...prev, timeComplexity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="如：O(n)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    空间复杂度
                  </label>
                  <input
                    type="text"
                    value={note.spaceComplexity}
                    onChange={(e) => setNote(prev => ({ ...prev, spaceComplexity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="如：O(1)"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 编辑器主体 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {/* 工具栏 */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    showPreview
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {showPreview ? '编辑' : '预览'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FaSearchMinus />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {contentZoom}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FaSearchPlus />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FaTextHeight />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDiagramEditor(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <FaProjectDiagram className="w-4 h-4" />
                  图形编辑器
                </button>
              </div>
            </div>
          </div>

          {/* 编辑器内容 */}
          <div className="flex">
            {!showPreview && (
              <div className="flex-1">
                <textarea
                  value={note.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="w-full h-96 p-4 border-0 resize-none focus:ring-0 bg-transparent text-gray-900 dark:text-gray-100"
                  style={{ fontSize: `${contentZoom}%` }}
                  placeholder="开始编写您的笔记内容...&#10;&#10;支持Markdown语法：&#10;# 标题&#10;**粗体** *斜体*&#10;```代码块```&#10;> 引用"
                />
              </div>
            )}

            {showPreview && (
              <div className="flex-1 p-4">
                <div 
                  className="prose prose-lg max-w-none dark:prose-invert"
                  style={{ fontSize: `${contentZoom}%` }}
                >
                  <ReactMarkdown
                    components={{
                      code: CodeBlock
                    }}
                  >
                    {note.content || '*暂无内容*'}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => navigate('/notes')}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <FaTimes className="w-4 h-4" />
            取消
          </button>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <FaSave className="w-4 h-4" />
              {saving ? '保存中...' : '保存笔记'}
            </button>
          </div>
        </div>
      </main>

      {/* 图形编辑器模态框 */}
      {showDiagramEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full h-full max-w-7xl max-h-[90vh] m-4">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                图形编辑器
              </h3>
              <button
                onClick={() => setShowDiagramEditor(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="h-full">
              <DiagramEditor
                isOpen={showDiagramEditor}
                onClose={() => setShowDiagramEditor(false)}
                onSave={handleDiagramSave}
                initialData={diagramData}
              />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default NoteEditorNew;
