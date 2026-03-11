/**
 * 简单文本记录组件
 * 将所有灵感记录到一个txt文件中
 */

import React, { useState, useEffect } from 'react';
import { FaPlus, FaSave, FaDownload, FaTrash, FaEdit } from 'react-icons/fa';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import { Button, Card, Collapsible, Textarea, EmptyState } from '../../components/UI';
import { useI18n } from '../../context/I18nContext';

const STORAGE_KEY = 'musicInspirations';

function SimpleTextRecorder() {
  const { t } = useI18n();
  // 从localStorage加载灵感数据
  const loadInspirations = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('加载灵感数据失败:', error);
    }
    return [];
  };

  const [inspirations, setInspirations] = useState(loadInspirations);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  
  const [formData, setFormData] = useState({
    content: '',
    timestamp: ''
  });

  // 当灵感数据变化时，保存到localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inspirations));
    } catch (error) {
      console.error('保存灵感数据失败:', error);
    }
  }, [inspirations]);

  // 添加或编辑灵感
  const saveInspiration = () => {
    if (!formData.content.trim()) {
      alert(t('MusicInspirationInput'));
      return;
    }

    const now = new Date();
    const inspiration = {
      id: editingIndex >= 0 ? inspirations[editingIndex].id : Date.now(), // 使用ID而不是索引
      content: formData.content.trim(),
      timestamp: now.toLocaleString('zh-CN'),
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0]
    };

    if (editingIndex >= 0) {
      // 编辑现有灵感
      const updatedInspirations = inspirations.map((item, index) => 
        index === editingIndex ? inspiration : item
      );
      setInspirations(updatedInspirations);
    } else {
      // 添加新灵感
      setInspirations(prev => [inspiration, ...prev]);
    }

    // 重置表单
    setFormData({ content: '', timestamp: '' });
    setShowAddForm(false);
    setEditingIndex(-1);
  };

  // 编辑灵感
  const editInspiration = (index) => {
    const inspiration = inspirations[index];
    setFormData({
      content: inspiration.content,
      timestamp: inspiration.timestamp
    });
    setEditingIndex(index);
    setShowAddForm(true);
  };

  // 删除灵感
  const deleteInspiration = (index) => {
    if (window.confirm(t('MusicInspirationConfirmDelete'))) {
      const updatedInspirations = inspirations.filter((_, i) => i !== index);
      setInspirations(updatedInspirations);
      // localStorage会在useEffect中自动更新
    }
  };

  // 生成txt文件内容
  const generateTxtContent = () => {
    let content = '创作灵感记录\n';
    content += '='.repeat(50) + '\n';
    content += `记录时间: ${new Date().toLocaleString('zh-CN')}\n`;
    content += `总计灵感: ${inspirations.length} 条\n\n`;

    inspirations.forEach((inspiration, index) => {
      content += `灵感 ${index + 1}:\n`;
      content += `时间: ${inspiration.timestamp}\n`;
      content += `内容: ${inspiration.content}\n`;
      content += '-'.repeat(30) + '\n\n';
    });

    return content;
  };

  // 下载txt文件
  const downloadTxtFile = () => {
    const content = generateTxtContent();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `创作灵感_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 清空所有记录
  const clearAllInspirations = () => {
    if (window.confirm(t('MusicInspirationConfirmClear'))) {
      setInspirations([]);
    }
  };

  // 取消编辑
  const cancelEdit = () => {
    setFormData({ content: '', timestamp: '' });
    setShowAddForm(false);
    setEditingIndex(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-3">
            <FaPlus className="text-blue-500" />
            {t('MusicSimpleRecord')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('MusicSubtitle')}
          </p>
        </div>

        {/* 操作按钮 */}
        <Card className="mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <Button
                onClick={() => setShowAddForm(true)}
                icon={<FaPlus />}
                iconPosition="left"
              >
                {t('MusicAddInspiration')}
              </Button>
              
              <Button
                onClick={downloadTxtFile}
                disabled={inspirations.length === 0}
                variant="success"
                icon={<FaDownload />}
                iconPosition="left"
              >
                {t('MusicDownloadTxt')}
              </Button>
              
              <Button
                onClick={clearAllInspirations}
                disabled={inspirations.length === 0}
                variant="danger"
                icon={<FaTrash />}
                iconPosition="left"
              >
                {t('MusicClearAll')}
              </Button>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('MusicInspirationCount').replace('{count}', String(inspirations.length))}
            </div>
          </div>
        </Card>

        {/* 添加/编辑表单 */}
        {showAddForm && (
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {editingIndex >= 0 ? t('MusicEditInspiration') : t('MusicAddNewInspiration')}
            </h2>
            
            <div className="space-y-4">
              <Textarea
                label={t('MusicInspirationContent')}
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={6}
                placeholder={t('MusicInspirationPlaceholder')}
                autoResize={true}
                minRows={3}
                maxRows={10}
                required
              />
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                onClick={saveInspiration}
                icon={<FaSave />}
                iconPosition="left"
              >
                {t('Save')}
              </Button>
              <Button
                onClick={cancelEdit}
                variant="secondary"
              >
                {t('Cancel')}
              </Button>
            </div>
          </Card>
        )}

        {/* 灵感列表 */}
        <div className="space-y-4">
          {inspirations.length === 0 ? (
            <EmptyState
              icon="inbox"
              title={t('MusicNoInspiration')}
              description={t('MusicNoInspirationDesc')}
              action={
                <Button
                  onClick={() => setShowAddForm(true)}
                  icon={<FaPlus />}
                  iconPosition="left"
                >
                  {t('MusicAddFirstInspiration')}
                </Button>
              }
            />
          ) : (
            inspirations.map((inspiration, index) => (
              <Card key={inspiration.id || index} hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                        {t('MusicInspirationContent')} {index + 1}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {inspiration.timestamp}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => editInspiration(index)}
                      variant="ghost"
                      size="small"
                      icon={<FaEdit />}
                    />
                    <Button
                      onClick={() => deleteInspiration(index)}
                      variant="ghost"
                      size="small"
                      icon={<FaTrash />}
                    />
                  </div>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-white-900 dark:text-white font-mono text-sm leading-relaxed">
                    {inspiration.content}
                  </pre>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* 预览txt内容 */}
        {inspirations.length > 0 && (
          <div className="mt-8">
            <Collapsible
              title={t('MusicTxtPreview')}
              defaultExpanded={false}
              variant="card"
            >
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                  {generateTxtContent()}
                </pre>
              </div>
            </Collapsible>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default SimpleTextRecorder;
