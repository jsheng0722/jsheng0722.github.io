import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import PageLayout from '../../components/Layout/PageLayout';
import { FaArrowLeft, FaEdit, FaCalendar, FaUser, FaClock, FaTags, FaTrash, FaSearchPlus, FaSearchMinus, FaTextHeight, FaStickyNote } from 'react-icons/fa';
import { getDisplayCategory, getCategoryIcon } from '../../components/Note/noteCategoryUtils';
import ReactMarkdown from 'react-markdown';
import CodeBlock from '../../components/CodeBlock';
import DiagramViewer from '../../components/DiagramEditor/DiagramViewer';
import StayingFunVisualization from '../../components/StayingFunVisualization/StayingFunVisualization';
import { Button, Card, Badge, Dialog, Input } from '../../components/UI';
import { useI18n } from '../../context/I18nContext';
import { isApiConfigured } from '../../config/dataBackend';
import {
  getUserNotesFromLocalStorage,
  recordDeletedNoteId,
  deleteUserNoteRemote,
} from '../../services/noteRepository';

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
      const userNotes = getUserNotesFromLocalStorage();
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

  const performDelete = async () => {
    const expect = String(note?.title || '').trim();
    if (confirmTitle.trim() !== expect) {
      alert(t('NoteConfirmDeleteTitle'));
      return;
    }
    const idStr = String(note.id);
    recordDeletedNoteId(idStr);

    if (isApiConfigured()) {
      const remoteOk = await deleteUserNoteRemote(idStr);
      if (!remoteOk) alert(t('NoteRemoteSyncFailed'));
    }

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
      <PageLayout className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-4 py-1.5 border-b border-gray-200 dark:border-gray-700">
          <Button size="small" variant="ghost" onClick={() => navigate('/notes')} icon={<FaArrowLeft />} iconPosition="left">返回列表</Button>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-4xl mb-3">📝</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">笔记未找到</h2>
          <Button size="small" onClick={() => navigate('/notes')}>返回笔记列表</Button>
        </div>
      </PageLayout>
    );
  }

  const displayCategory = getDisplayCategory(note?.category);
  const categoryIcon = getCategoryIcon(note?.category, 'w-5 h-5');

  return (
    <>
    <PageLayout className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 工具栏：返回列表、缩放、编辑、删除 */}
      <div className="flex flex-wrap items-center gap-2 mb-4 py-1.5 border-b border-gray-200 dark:border-gray-700">
        <Button size="small" variant="ghost" onClick={() => navigate('/notes')} icon={<FaArrowLeft />} iconPosition="left">
          返回列表
        </Button>
        <span className="flex-1" />
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded p-0.5">
          <Button size="small" variant="ghost" onClick={decreaseContentZoom} disabled={contentZoom <= 50} icon={<FaSearchMinus />} title="缩小" />
          <Button size="small" variant="ghost" onClick={resetContentZoom} icon={<FaTextHeight />} iconPosition="left" title="重置">
            {contentZoom}%
          </Button>
          <Button size="small" variant="ghost" onClick={increaseContentZoom} disabled={contentZoom >= 200} icon={<FaSearchPlus />} title="放大" />
        </div>
        <Button size="small" variant="ghost" onClick={handleEdit} icon={<FaEdit />} iconPosition="left">编辑</Button>
        <Button size="small" variant="danger" onClick={openDeleteDialog} icon={<FaTrash />} iconPosition="left">删除</Button>
      </div>

      {/* 悬浮备注标签栏（不占布局流，浮在左侧） */}
      <div
        className="fixed left-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-r-lg border border-l-0 border-amber-200 dark:border-amber-700/50 bg-amber-50/95 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 shadow-md cursor-not-allowed opacity-90"
        title="备注（开发中）"
        aria-hidden
      >
        <FaStickyNote className="w-5 h-5 shrink-0 opacity-80" />
        <span className="text-xs font-medium">备注</span>
      </div>

      {/* 笔记正文 */}
      <main className="min-w-0">
          <Card>
          {/* 头部装饰条 */}
          <div className={`h-1 rounded-t-lg ${
            note.category === '学习笔记' ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
            note.category === '日常日记' || note.category === '生活' ? 'bg-gradient-to-r from-pink-500 to-pink-600' :
            note.category === '随笔写写' || note.category === '随笔' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
            (note.category === '算法' || note.category === 'LeetCode') ? 'bg-gradient-to-r from-green-500 to-green-600' :
            'bg-gradient-to-r from-blue-500 to-blue-600'
          }`}></div>

          <div className="p-4">
            {/* 分类标签 */}
            <div className="mb-2">
              <Badge
                variant={
                  note.category === '学习笔记' ? 'warning' :
                  note.category === '日常日记' || note.category === '生活' ? 'warning' :
                  note.category === '随笔写写' || note.category === '随笔' ? 'info' :
                  (note.category === '算法' || note.category === 'LeetCode') ? 'success' :
                  'primary'
                }
                size="small"
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs"
              >
                {categoryIcon}
                {displayCategory}
              </Badge>
            </div>

            {/* 标题 */}
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {note.title}
            </h1>

            {/* 元信息 */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
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
              <div className="flex items-center gap-1.5 flex-wrap mb-3">
                <FaTags className="w-3.5 h-3.5 text-gray-400" />
                {note.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 算法特殊信息 */}
            {(note.category === '算法' || note.category === 'LeetCode') && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 p-3 bg-green-50 dark:bg-green-900/10 rounded text-sm">
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

            {/* 笔记内容：紧凑字号以多展示内容 */}
            <div 
              className={`prose prose-sm dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-headings:mt-3 prose-headings:mb-1
                prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:my-1
                prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                prose-pre:bg-transparent prose-pre:p-0 prose-pre:my-1
                prose-ul:list-disc prose-ol:list-decimal prose-ul:my-1 prose-ol:my-1
                prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:my-0
                prose-blockquote:border-l-2 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:pl-3 prose-blockquote:py-0.5 prose-blockquote:my-1 prose-blockquote:text-sm`}
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
    </PageLayout>

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
    </>
  );
}

export default NoteView;
