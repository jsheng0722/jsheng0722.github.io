import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import { FaSave, FaTimes, FaHeart, FaPencilAlt, FaCode, FaGraduationCap, FaTags, FaPlus, FaProjectDiagram, FaTextHeight, FaSearchPlus, FaSearchMinus, FaTable, FaListUl, FaQuoteRight } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import CodeBlock from '../../components/CodeBlock';
import DiagramEditor from '../../components/DiagramEditor/DiagramEditor';
import StayingFunVisualization from '../../components/StayingFunVisualization/StayingFunVisualization';
import { FloatingToolbar } from '../../components/UI';
import { useI18n } from '../../context/I18nContext';

function NoteEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const editNote = location.state?.editNote; // 获取要编辑的笔记
  const isEditing = !!editNote;

  const mapLegacyCategory = (cat) => {
    if (cat === '生活') return '日常日记';
    if (cat === '随笔') return '随笔写写';
    return cat || '随笔写写';
  };

  const [note, setNote] = useState(() => {
    if (editNote) return { ...editNote, category: mapLegacyCategory(editNote.category) };
    return {
      title: '',
      author: 'Jihui',
      date: new Date().toISOString().split('T')[0],
      category: '随笔写写',
      tags: [],
      content: '',
      excerpt: '',
      readTime: '1分钟',
      difficulty: '',
      problemNumber: '',
      timeComplexity: '',
      spaceComplexity: ''
    };
  });
  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDiagramEditor, setShowDiagramEditor] = useState(false);
  const [diagramData, setDiagramData] = useState(editNote?.diagram || null);
  const [contentZoom, setContentZoom] = useState(100); // 内容缩放，默认100%

  const categories = [
    { id: 'study', name: '学习笔记', icon: <FaGraduationCap />, color: 'amber' },
    { id: 'daily', name: '日常日记', icon: <FaHeart />, color: 'pink' },
    { id: 'essay', name: '随笔写写', icon: <FaPencilAlt />, color: 'purple' },
    { id: '算法', name: '算法', icon: <FaCode />, color: 'green' }
  ];

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

  // 内容缩放功能
  const increaseContentZoom = () => {
    setContentZoom(prev => Math.min(prev + 10, 200)); // 最大200%
  };

  const decreaseContentZoom = () => {
    setContentZoom(prev => Math.max(prev - 10, 50)); // 最小50%
  };

  const resetContentZoom = () => {
    setContentZoom(100);
  };

  const handleSave = () => {
    if (!note.title || !note.content) {
      alert(t('RequiredTitleAndContent'));
      return;
    }

    setSaving(true);

    try {
      // 准备笔记数据
      const noteData = {
        id: isEditing ? note.id : Date.now(), // 编辑时保持原ID
        title: note.title,
        author: note.author,
        date: note.date,
        category: note.category,
        tags: note.tags,
        excerpt: note.excerpt,
        readTime: note.readTime,
        content: note.content,
        diagram: diagramData, // 保存流程图数据
        ...(note.category === '算法' && {
          difficulty: note.difficulty,
          problemNumber: note.problemNumber,
          timeComplexity: note.timeComplexity,
          spaceComplexity: note.spaceComplexity
        })
      };

      // 保存到localStorage
      const existingNotes = JSON.parse(localStorage.getItem('userNotes') || '[]');
      
      if (isEditing) {
        // 编辑模式：更新现有笔记
        const index = existingNotes.findIndex(n => n.id === note.id);
        if (index !== -1) {
          existingNotes[index] = noteData;
        } else {
          existingNotes.push(noteData);
        }
        alert(t('NoteUpdated'));
      } else {
        // 新建模式：添加新笔记
        existingNotes.push(noteData);
        alert(t('NoteSaved') + '\n\n' + JSON.stringify(noteData, null, 2));
      }
      
      localStorage.setItem('userNotes', JSON.stringify(existingNotes));

      setSaving(false);
      navigate('/notes');
    } catch (error) {
      console.error('保存失败:', error);
      alert(t('NoteSaveFailed'));
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm(t('NoteConfirmDiscard'))) {
      navigate('/notes');
    }
  };



  // 快捷插入函数
  const insertCodeBlock = () => {
    const codeTemplate = '\n```javascript\n// 在这里输入代码\nconsole.log("Hello World");\n```\n';
    setNote(prev => ({
      ...prev,
      content: prev.content + codeTemplate
    }));
  };

  const insertTable = () => {
    const tableTemplate = '\n| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 数据1 | 数据2 | 数据3 |\n| 数据4 | 数据5 | 数据6 |\n';
    setNote(prev => ({
      ...prev,
      content: prev.content + tableTemplate
    }));
  };

  const insertList = () => {
    const listTemplate = '\n- 项目1\n- 项目2\n- 项目3\n';
    setNote(prev => ({
      ...prev,
      content: prev.content + listTemplate
    }));
  };

  const insertQuote = () => {
    const quoteTemplate = '\n> 这是一段引用文字\n> 可以跨越多行\n';
    setNote(prev => ({
      ...prev,
      content: prev.content + quoteTemplate
    }));
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {showPreview ? '预览笔记' : (isEditing ? '编辑笔记' : '写笔记')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {showPreview ? '查看笔记效果' : (isEditing ? '修改您的笔记' : '记录您的想法和灵感')}
          </p>
        </div>

        {/* 操作栏 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  !showPreview
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                编辑
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  showPreview
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                预览
              </button>
              <button
                onClick={() => setShowDiagramEditor(true)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  diagramData
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                }`}
                title="添加流程图/思维导图"
              >
                <FaProjectDiagram className="w-4 h-4" />
                {diagramData ? '编辑图表' : '添加图表'}
              </button>

              {/* 内容缩放控制（仅预览模式） */}
              {showPreview && (
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={decreaseContentZoom}
                    disabled={contentZoom <= 50}
                    className={`p-2 rounded transition-colors ${
                      contentZoom <= 50
                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    title="缩小内容"
                  >
                    <FaSearchMinus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={resetContentZoom}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="重置缩放"
                  >
                    <FaTextHeight className="w-3 h-3 inline-block mr-1" />
                    {contentZoom}%
                  </button>
                  <button
                    onClick={increaseContentZoom}
                    disabled={contentZoom >= 200}
                    className={`p-2 rounded transition-colors ${
                      contentZoom >= 200
                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    title="放大内容"
                  >
                    <FaSearchPlus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <FaTimes className="w-4 h-4" />
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                <FaSave className="w-4 h-4" />
                {saving ? '保存中...' : (isEditing ? '更新笔记' : '保存笔记')}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧：笔记设置 */}
          <div className="lg:col-span-1 space-y-4">
            {/* 基本信息 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">基本信息</h3>
              
              <div className="space-y-4">
                {/* 分类 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    笔记分类
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setNote(prev => ({ ...prev, category: cat.name }))}
                        className={`p-3 rounded-lg transition-all flex items-center gap-2 ${
                          note.category === cat.name
                            ? `bg-${cat.color}-100 dark:bg-${cat.color}-900/30 text-${cat.color}-700 dark:text-${cat.color}-400 border-2 border-${cat.color}-500`
                            : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-300'
                        }`}
                      >
                        {cat.icon}
                        <span className="font-medium">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 作者 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    作者
                  </label>
                  <input
                    type="text"
                    value={note.author}
                    onChange={(e) => setNote(prev => ({ ...prev, author: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* 日期 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    日期
                  </label>
                  <input
                    type="date"
                    value={note.date}
                    onChange={(e) => setNote(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* 标签管理 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                <FaTags className="w-4 h-4" />
                标签
              </h3>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="输入标签..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddTag}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaPlus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {note.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm flex items-center gap-1"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-blue-900 dark:hover:text-blue-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* 算法额外字段 */}
            {note.category === '算法' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">算法信息</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      题号
                    </label>
                    <input
                      type="text"
                      value={note.problemNumber}
                      onChange={(e) => setNote(prev => ({ ...prev, problemNumber: e.target.value }))}
                      placeholder="如: 1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      难度
                    </label>
                    <select
                      value={note.difficulty}
                      onChange={(e) => setNote(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    >
                      <option value="">选择难度</option>
                      <option value="简单">简单</option>
                      <option value="中等">中等</option>
                      <option value="困难">困难</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      时间复杂度
                    </label>
                    <input
                      type="text"
                      value={note.timeComplexity}
                      onChange={(e) => setNote(prev => ({ ...prev, timeComplexity: e.target.value }))}
                      placeholder="如: O(n)"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      空间复杂度
                    </label>
                    <input
                      type="text"
                      value={note.spaceComplexity}
                      onChange={(e) => setNote(prev => ({ ...prev, spaceComplexity: e.target.value }))}
                      placeholder="如: O(1)"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 右侧：内容编辑 */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              {showPreview ? (
                // 预览模式
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    {note.title || '未命名笔记'}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <span>{note.author}</span>
                    <span>•</span>
                    <span>{note.date}</span>
                    <span>•</span>
                    <span className={`px-3 py-1 rounded-full font-medium ${
                      note.category === '学习笔记' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      note.category === '日常日记' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' :
                      note.category === '随笔写写' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                      note.category === '算法' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {note.category}
                    </span>
                  </div>
                  <div 
                    className={`prose prose-lg dark:prose-invert max-w-none`}
                    style={{
                      transform: `scale(${contentZoom / 100})`,
                      transformOrigin: 'top left',
                      width: `${100 / (contentZoom / 100)}%`,
                      transition: 'transform 0.2s ease-in-out'
                    }}
                  >
                    <ReactMarkdown
                      components={{
                        code({node, inline, className, children, ...props}) {
                          const match = /language-(\w+)/.exec(className || '');
                          const isAlgorithmNote = note.category === '算法';
                          return !inline && match ? (
                            <CodeBlock 
                              language={match[1]}
                              isAlgorithmNote={isAlgorithmNote}
                            >
                              {String(children).replace(/\n$/, '')}
                            </CodeBlock>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                        // 处理链接，如果是 staying.fun 链接，渲染为可视化组件
                        a({node, href, children, ...props}) {
                          if (href && href.includes('staying.fun')) {
                            return (
                              <StayingFunVisualization 
                                url={href} 
                                title={typeof children === 'string' ? children : '算法可视化'}
                              />
                            );
                          }
                          return (
                            <a href={href} {...props} target="_blank" rel="noopener noreferrer">
                              {children}
                            </a>
                          );
                        },
                        // 处理图片，如果是 staying.fun 链接，也渲染为可视化组件
                        img({node, src, alt, ...props}) {
                          if (src && src.includes('staying.fun')) {
                            return (
                              <StayingFunVisualization 
                                url={src} 
                                title={alt || '算法可视化'}
                              />
                            );
                          }
                          return <img src={src} alt={alt} {...props} />;
                        }
                      }}
                    >
                      {note.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                // 编辑模式
                <div className="space-y-4">
                  {/* 标题 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      笔记标题 *
                    </label>
                    <input
                      type="text"
                      value={note.title}
                      onChange={(e) => setNote(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="输入笔记标题..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* 摘要 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      摘要（可选）
                    </label>
                    <input
                      type="text"
                      value={note.excerpt}
                      onChange={(e) => setNote(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="简短描述笔记内容..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* 内容 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      笔记内容 * (支持Markdown)
                    </label>
                    <textarea
                      value={note.content}
                      onChange={(e) => setNote(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="在这里写下您的想法...&#10;&#10;支持Markdown格式：&#10;# 一级标题&#10;## 二级标题&#10;**粗体** *斜体*&#10;- 列表项&#10;```代码块```&#10;&#10;算法笔记中，代码块上会显示可视化按钮，可以添加 staying.fun 可视化"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      rows="20"
                    />
                  </div>

                  {/* Markdown提示 */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="font-medium mb-1">Markdown快捷语法：</p>
                    <p>• # 标题1   ## 标题2   ### 标题3</p>
                    <p>• **粗体**   *斜体*   ~~删除线~~</p>
                    <p>• [链接](URL)   ![图片](URL)</p>
                    <p>• ```代码块```   `行内代码`</p>
                    {note.category === '算法' && (
                      <p className="mt-2 text-green-600 dark:text-green-400">
                        • 🎯 算法可视化：将鼠标悬停在代码块上，点击"可视化"按钮可添加 staying.fun 可视化
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 保存提示 */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
            <strong>💡 保存说明：</strong> 笔记会保存到浏览器本地存储（localStorage），立即可在首页查看。
          </p>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
            <p><strong>✅ 即时保存：</strong></p>
            <ul className="ml-6 space-y-1 list-disc">
              <li>点击"保存笔记"后立即生效</li>
              <li>笔记会自动显示在笔记首页</li>
              <li>支持完整的Markdown渲染（标题、代码块、列表等）</li>
              <li>数据保存在浏览器localStorage中</li>
            </ul>
            
            <p className="pt-2"><strong>💾 永久保存（可选）：</strong></p>
            <ul className="ml-6 space-y-1 list-disc">
              <li>如需永久保存，可复制弹窗中的JSON数据</li>
              <li>添加到 <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">public/content/notes/noteList_s.json</code> 文件中</li>
              <li>这样即使清除浏览器缓存，笔记也不会丢失</li>
            </ul>
          </div>
        </div>
      </main>

      {/* 流程图编辑器 */}
      <DiagramEditor
        isOpen={showDiagramEditor}
        onClose={() => setShowDiagramEditor(false)}
        onSave={(data) => {
          setDiagramData(data);
          setShowDiagramEditor(false);
        }}
        initialData={diagramData}
      />

      {/* 浮动工具栏 */}
      <FloatingToolbar 
        tools={[
          {
            id: 'diagram',
            icon: <FaProjectDiagram className="w-5 h-5" />,
            label: diagramData ? '编辑图表' : '添加图表',
            onClick: () => setShowDiagramEditor(true),
            color: diagramData ? 'from-purple-500 to-purple-700' : 'from-blue-500 to-blue-700',
            badge: !!diagramData
          },
          {
            id: 'code',
            icon: <FaCode className="w-5 h-5" />,
            label: '插入代码块',
            onClick: insertCodeBlock,
            color: 'from-gray-600 to-gray-800'
          },
          {
            id: 'table',
            icon: <FaTable className="w-5 h-5" />,
            label: '插入表格',
            onClick: insertTable,
            color: 'from-green-500 to-green-700'
          },
          {
            id: 'list',
            icon: <FaListUl className="w-5 h-5" />,
            label: '插入列表',
            onClick: insertList,
            color: 'from-orange-500 to-orange-700'
          },
          {
            id: 'quote',
            icon: <FaQuoteRight className="w-5 h-5" />,
            label: '插入引用',
            onClick: insertQuote,
            color: 'from-indigo-500 to-indigo-700'
          }
        ]}
        position="right"
        showSettings={true}
        settingsContent={
          <div>
            <h4 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">工具栏位置</h4>
            <div className="space-y-2">
              {['left', 'right', 'bottom'].map(pos => (
                <button
                  key={pos}
                  onClick={() => {}}
                  className="w-full px-3 py-2 text-sm rounded transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  {pos === 'left' && '左侧'}
                  {pos === 'right' && '右侧'}
                  {pos === 'bottom' && '底部'}
                </button>
              ))}
            </div>
          </div>
        }
      />

      <Footer />
    </div>
  );
}

export default NoteEditor;