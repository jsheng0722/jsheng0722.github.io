import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import { FaArrowLeft, FaEdit, FaCalendar, FaUser, FaClock, FaTags, FaTrash, FaSearchPlus, FaSearchMinus, FaTextHeight } from 'react-icons/fa';
import { getDisplayCategory, getCategoryIcon } from '../../components/Note/noteCategoryUtils';
import ReactMarkdown from 'react-markdown';
import CodeBlock from '../../components/CodeBlock';
import DiagramViewer from '../../components/DiagramEditor/DiagramViewer';
import StayingFunVisualization from '../../components/StayingFunVisualization/StayingFunVisualization';
import { Button, Card, Badge, Dialog, Input } from '../../components/UI';
import { useI18n } from '../../context/I18nContext';

function NoteView() {
  const { t } = useI18n();
  const { id: noteId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [note, setNote] = useState(() => {
    const fromState = location.state?.note;
    if (fromState != null) return fromState;
    if (!noteId) return null;
    try {
      const userNotes = JSON.parse(localStorage.getItem('userNotes') || '[]');
      const found = userNotes.find((n) => String(n.id) === String(noteId));
      return found || null;
    } catch (_) {
      return null;
    }
  });

  // 当通过 state 传入笔记时（例如从列表或可视化返回），同步到本地 state
  useEffect(() => {
    if (location.state?.note != null) setNote(location.state.note);
  }, [location.state?.note]);
  
  // 内容缩放状态
  const [contentZoom, setContentZoom] = useState(100); // 默认100%
  
  const handleEdit = () => {
    navigate('/notes/editor', { state: { editNote: note } });
  };
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');

  const openDeleteDialog = () => {
    setConfirmTitle('');
    setShowDeleteDialog(true);
  };

  const performDelete = () => {
    const expect = String(note?.title || '').trim();
    if (confirmTitle.trim() !== expect) {
      alert(t('NoteConfirmDeleteTitle'));
      return;
    }
    const idStr = String(note.id);
    // 从 userNotes 中移除（统一用字符串比较，避免类型不一致删不掉）
    const userNotes = JSON.parse(localStorage.getItem('userNotes') || '[]');
    const updatedNotes = userNotes.filter(n => String(n.id) !== idStr);
    localStorage.setItem('userNotes', JSON.stringify(updatedNotes));
    // 记录“已删除 id”，列表页会过滤掉（包括来自 JSON 的笔记）
    try {
      const deletedIds = JSON.parse(localStorage.getItem('notesDeletedIds') || '[]');
      if (!deletedIds.includes(idStr)) deletedIds.push(idStr);
      localStorage.setItem('notesDeletedIds', JSON.stringify(deletedIds));
    } catch (_) {}
    setShowDeleteDialog(false);
    navigate('/notes');
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


  if (!note) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            笔记未找到
          </h2>
          <Button
            onClick={() => navigate('/notes')}
          >
            返回笔记列表
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const displayCategory = getDisplayCategory(note?.category);
  const categoryIcon = getCategoryIcon(note?.category, 'w-5 h-5');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 操作栏 */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/notes')}
              variant="ghost"
              icon={<FaArrowLeft />}
              iconPosition="left"
            >
              返回笔记列表
            </Button>
            
            {/* 缩放提示 */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>💡 使用缩放按钮调整笔记内容大小，不影响页面布局</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 内容缩放控制 */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <Button
                onClick={decreaseContentZoom}
                disabled={contentZoom <= 50}
                variant="ghost"
                size="small"
                icon={<FaSearchMinus />}
                title="缩小内容"
              />
              <Button
                onClick={resetContentZoom}
                variant="ghost"
                size="small"
                icon={<FaTextHeight />}
                iconPosition="left"
                title="重置缩放"
              >
                {contentZoom}%
              </Button>
              <Button
                onClick={increaseContentZoom}
                disabled={contentZoom >= 200}
                variant="ghost"
                size="small"
                icon={<FaSearchPlus />}
                title="放大内容"
              />
            </div>

            <Button
              onClick={handleEdit}
              icon={<FaEdit />}
              iconPosition="left"
            >
              编辑
            </Button>
            <Button
              onClick={openDeleteDialog}
              variant="danger"
              icon={<FaTrash />}
              iconPosition="left"
            >
              删除
            </Button>
          </div>
        </div>

        {/* 笔记内容 */}
        <Card>
          {/* 头部装饰条 */}
          <div className={`h-2 rounded-t-xl ${
            note.category === '学习笔记' ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
            note.category === '日常日记' || note.category === '生活' ? 'bg-gradient-to-r from-pink-500 to-pink-600' :
            note.category === '随笔写写' || note.category === '随笔' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
            (note.category === '算法' || note.category === 'LeetCode') ? 'bg-gradient-to-r from-green-500 to-green-600' :
            'bg-gradient-to-r from-blue-500 to-blue-600'
          }`}></div>

          <div className="p-8">
            {/* 分类标签 */}
            <div className="mb-6">
              <Badge
                variant={
                  note.category === '学习笔记' ? 'warning' :
                  note.category === '日常日记' || note.category === '生活' ? 'warning' :
                  note.category === '随笔写写' || note.category === '随笔' ? 'info' :
                  (note.category === '算法' || note.category === 'LeetCode') ? 'success' :
                  'primary'
                }
                size="medium"
                className="inline-flex items-center gap-2 px-4 py-2"
              >
                {categoryIcon}
                {displayCategory}
              </Badge>
            </div>

            {/* 标题 */}
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {note.title}
            </h1>

            {/* 元信息 */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <FaUser className="w-4 h-4" />
                <span>{note.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCalendar className="w-4 h-4" />
                <span>{note.date}</span>
              </div>
              {note.readTime && (
                <div className="flex items-center gap-2">
                  <FaClock className="w-4 h-4" />
                  <span>{note.readTime}</span>
                </div>
              )}
            </div>

            {/* 标签 */}
            {note.tags && note.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-6">
                <FaTags className="w-4 h-4 text-gray-400" />
                {note.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 算法特殊信息 */}
            {(note.category === '算法' || note.category === 'LeetCode') && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
                {note.problemNumber && (
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">题号</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">#{note.problemNumber}</div>
                  </div>
                )}
                {note.difficulty && (
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">难度</div>
                    <div className={`font-semibold ${
                      note.difficulty === '简单' ? 'text-green-600' :
                      note.difficulty === '中等' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {note.difficulty}
                    </div>
                  </div>
                )}
                {note.timeComplexity && (
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">时间复杂度</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100 font-mono text-sm">{note.timeComplexity}</div>
                  </div>
                )}
                {note.spaceComplexity && (
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">空间复杂度</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100 font-mono text-sm">{note.spaceComplexity}</div>
                  </div>
                )}
              </div>
            )}

            {/* 流程图/思维导图 */}
            {note.diagram && <DiagramViewer diagramData={note.diagram} />}

            {/* 笔记内容 */}
            <div 
              className={`prose prose-lg dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100
                prose-p:text-gray-700 dark:prose-p:text-gray-300
                prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-transparent prose-pre:p-0
                prose-ul:list-disc prose-ol:list-decimal
                prose-li:text-gray-700 dark:prose-li:text-gray-300
                prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:pl-4`}
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
                    const isAlgorithmNote = note.category === '算法' || note.category === 'LeetCode';
                    return !inline && match ? (
                      <CodeBlock 
                        language={match[1]}
                        isAlgorithmNote={isAlgorithmNote}
                        note={note}
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
                    // 检查是否是 staying.fun 链接
                    if (href && href.includes('staying.fun')) {
                      return (
                        <StayingFunVisualization 
                          url={href} 
                          title={typeof children === 'string' ? children : '算法可视化'}
                        />
                      );
                    }
                    // 普通链接正常渲染
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
        </Card>
      </main>

      <Footer />

      {/* 删除确认对话框 */}
      <Dialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="确认删除"
        message="确定要删除这篇笔记吗？此操作不可恢复。请在下方输入笔记标题进行确认。"
      >
        <Input
          type="text"
          placeholder="请输入笔记标题"
          value={confirmTitle}
          onChange={(e) => setConfirmTitle(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              performDelete();
            }
          }}
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={() => setShowDeleteDialog(false)}>取消</Button>
          <Button variant="danger" onClick={performDelete}>确认删除</Button>
        </div>
      </Dialog>
    </div>
  );
}

export default NoteView;
