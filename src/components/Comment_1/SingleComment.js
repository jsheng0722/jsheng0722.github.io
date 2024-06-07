import React from 'react';
import CommentForm from './CommentForm';

function formatTime(time){
    const timeString = `${time.getHours().toString().padStart(2, '0')}:
    ${time.getMinutes().toString().padStart(2, '0')}:
    ${time.getSeconds().toString().padStart(2, '0')}`
    return `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()} ${timeString}`
}

const SingleComment = ({ comment, replies, currentUserId, updateComment, deleteComment, activeComment, setActiveComment, parentId = null, addComment }) =>{
    const fiveMinutes =300000;
    const timePassed = new Date() - new Date(comment.time) > fiveMinutes;
    const canReply = Boolean(currentUserId);
    const canEdit = currentUserId === comment.userId && !timePassed;
    const canDelete = currentUserId === comment.userId && !timePassed;
    const isReplying = 
        activeComment &&
        activeComment.type === "replying" &&
        activeComment.id === comment.id;
    const isEditing = 
        activeComment &&
        activeComment.type === "editing" &&
        activeComment.id === comment.id;
    const replyId = parentId ? parentId : comment.id;

    return(
        <div className="flex flex-col space-y-6">
            <div className="flex first:pt-5 last:border-b border-gray-200">
                <div className="w-12 h-12 mr-4">
                    <img className="rounded-full" src={`${process.env.PUBLIC_URL +'/images/avatar.png'}`} alt="" />
                </div>
                <div className="flex-1 relative ml-8 border-t border-gray-200 pt-5 pb-3">
                <div className="text-gray-600 font-bold text-sm leading-5 pb-1">{comment.userName}</div>
                <div>{formatTime(comment.time)}</div>
                {!isEditing && <div className="whitespace-pre-wrap break-words text-base leading-6">{comment.comment}</div>}
                {isEditing && 
                    <CommentForm 
                        submitLabel="Update" 
                        hasCancelButton 
                        initialText={comment.comment} 
                        handleSubmit={(text) => updateComment(text, comment.id)} 
                        handleCancel={() => setActiveComment(null)} 
                    />
                }
                <div className="mt-2 flex space-x-2 text-xs">
                    {canReply && <div className="cursor-pointer text-blue-500 hover:text-blue-700 focus:outline-none focus:underline" 
                        onClick={() => setActiveComment({id:comment.id,type:"replying"})}
                        >
                        Reply
                    </div>}
                    {canEdit && <div className="cursor-pointer text-green-500 hover:text-green-700 focus:outline-none focus:underline" 
                        onClick={() => setActiveComment({id:comment.id,type:"editing"})}
                        >
                        Edit
                    </div>}
                    {canDelete && <div className="cursor-pointer text-red-500 hover:text-red-700 focus:outline-none focus:underline" 
                        onClick={() => deleteComment(comment.id)}
                        >
                        Delete
                    </div>}
                </div>
                {isReplying && (
                    <CommentForm submitLabel="Reply" handleSubmit={(text) => addComment(text, replyId)} />
                )}
                {replies.length > 0 && (
                    <div className="text-gray-600 text-sm leading-5 pt-3">
                        {replies.map(reply => (
                            <SingleComment 
                                key={reply.id} 
                                comment={reply} 
                                replies={[]} 
                                currentUserId={currentUserId}
                                updateComment={updateComment}
                                deleteComment={deleteComment}
                                activeComment={activeComment}
                                setActiveComment={setActiveComment}
                                parentId={comment.id}
                                addComment={addComment}
                            />
                        ))}
                    </div>)}
                </div>
            </div>
        </div>
    )
}

export default SingleComment;