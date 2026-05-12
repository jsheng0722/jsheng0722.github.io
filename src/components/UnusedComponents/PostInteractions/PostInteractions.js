/**
 * PostInteractions - 帖子互动组件
 * 
 * 注意：此组件目前未被使用，但保留用于未来扩展。
 * 请勿随意删除此文件。
 * 
 * 功能：
 * - 点赞按钮
 * - 评论按钮
 * - 分享按钮
 * - 浏览量显示
 * 
 * Props:
 * - likes: 点赞数（默认 0）
 * - comments: 评论数（默认 0）
 * - views: 浏览量（默认 0）
 * - onLike: 点赞回调函数
 * - onComment: 评论回调函数
 * - onShare: 分享回调函数
 * - showViews: 是否显示浏览量（默认 true）
 * - className: 自定义样式类
 */

import React from 'react';
import { FaHeart, FaComment, FaShare, FaEye } from 'react-icons/fa';

function PostInteractions({ 
  likes = 0, 
  comments = 0, 
  views = 0,
  onLike, 
  onComment, 
  onShare,
  showViews = true,
  className = ''
}) {
  return (
    <div className={`px-6 py-4 bg-gray-50 dark:bg-gray-700 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button 
            className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
            onClick={onLike}
          >
            <FaHeart className="w-4 h-4" />
            <span>{likes}</span>
          </button>
          <button 
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
            onClick={onComment}
          >
            <FaComment className="w-4 h-4" />
            <span>{comments}</span>
          </button>
          <button 
            className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors"
            onClick={onShare}
          >
            <FaShare className="w-4 h-4" />
            <span>分享</span>
          </button>
        </div>
        {showViews && (
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <FaEye className="w-3 h-3" />
              <span>{views}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostInteractions;
