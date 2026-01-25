import React, { useState } from 'react';
import CommentList from './CommentList/CommentList';
import TabsOrder from '../TabsOrder/TabsOrder';
import CommentSend from './CommentSend/CommentSend';
import { ConfirmDialog } from '../UI';
import { v4 as uuid } from 'uuid';

// related data
const state = {
  tabs: [
    {
      id: 1,
      name: 'hot',
      type: 'hot'
    },
    { 
      id: 2,
      name: 'time',
      type: 'time'
    }
  ],
  active: 'time',
  list: [
    {
      id: 1,
      author: '刘德华',
      comment: '给我一杯忘情水',
      time: new Date('2021-10-10 09:09:00'),
      attitude: 1
    },
    {
      id: 2,
      author: '周杰伦',
      comment: '哎哟，不错哦',
      time: new Date('2021-10-11 09:09:00'),
      attitude: 0
    },
    {
      id: 3,
      author: '五月天',
      comment: '不打扰，是我的温柔',
      time: new Date('2021-10-11 10:09:00'),
      attitude: -1
    }
  ]
}

function Comment () {
  const [activeTab, setActiveTab] = useState(state.active);
  const [comment, setComment] = useState('');
  const [list, setList] = useState(state.list);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const switchTab = (type) => {
    console.log('change to', type);
    setActiveTab(type);
  };  

  const handleAddComment = () => {
    const newComment = {
      id: uuid(),
      author: 'cp',
      comment: comment,
      time: new Date(),
      attitude: 0
  };
    setList([...list, newComment]);
  };

  const showConfirmationDialog = (commentId) => {
    setCommentToDelete(commentId);
    handleShowConfirmation();
  };

  const handleDeleteConfirmation = () => {
    // Perform delete operation
    if (commentToDelete) {
      const updatedList = list.filter((item) => item.id !== commentToDelete);
      setList(updatedList);
    }

    handleCancelConfirmation();
    setCommentToDelete(null);
  };

  const handleShowConfirmation = () => {
    setShowConfirmation(true);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="w-[90%] mx-auto mt-12 mb-12">
    {/* Comments header */}
    <div className="mb-5 text-lg leading-6 font-normal text-gray-900">
      <span>5 comments</span>
    </div>

    {/* Sorted by tabs */}
    <TabsOrder tabs={state.tabs} active={activeTab} switchTab={switchTab} />

    {/* Add comment */}
    <CommentSend comment={comment} setComment={setComment} handleAddComment={handleAddComment} />

    {/* Comment list */}
    <CommentList list={list} setList={setList} deleteComment={showConfirmationDialog} />

    {/* Confirmation dialog */}
    <ConfirmDialog
      isOpen={showConfirmation}
      onConfirm={handleDeleteConfirmation}
      onCancel={handleCancelConfirmation}
      title='Confirm Deletion'
      message='Are you sure you want to delete this item?'
      confirmText='Delete'
      cancelText='Cancel'
      type='danger'
    />
  </div>

  )
}

export default Comment
