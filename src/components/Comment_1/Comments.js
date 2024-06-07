import { useEffect, useState } from "react";
import { getComments as getCommentsApi, createComment as createCommentApi, deleteComment as deleteCommentApi, updateComment as updateCommentApi } from "./Comment_api";
import SingleComment from "./SingleComment";
import CommentForm from "./CommentForm";

const Comments = ({ currentUserId }) =>{
    const [backendComments, setBackendComments] = useState([]);
    const [activeComment, setActiveComment] = useState(null);
    const rootComments = backendComments.filter((comment) => comment.parentId === null);
    const getReplies = (parentId) => {
        return backendComments.filter((comment) => comment.parentId === parentId).sort((a,b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    }

    const addComment = (text, parentId) => {
        console.log(text, parentId);
        createCommentApi(text, parentId).then((comment) => {
            setBackendComments([comment,...backendComments]);
            setActiveComment(null);
        });
    }
    const updateComment = (text, commentId) => {
        updateCommentApi(text, commentId).then(() => {
            const updatedBackendComments = backendComments.map((backendComment) => {
                if (backendComment.id === commentId) {
                    return { ...backendComment, comment: text }
                }
                return backendComment;
            });
            setBackendComments(updatedBackendComments);
            setActiveComment(null);
        });
    }

    const deleteComment = (id) => {
        if (window.confirm("Are you sure to delete this comment?")){
            deleteCommentApi(id).then(() => {
                const updatedBackendComments = backendComments.filter((comment) => comment.id !== id);
                setBackendComments(updatedBackendComments); 
            }); 
        }
    }
    useEffect(() => {
        getCommentsApi().then((data) => {
            setBackendComments(data);
        });
    }, [])
    return(
        <div>
            <div>
                <CommentForm submitLabel="Write" handleSubmit={addComment}/>
            </div>
            {rootComments.map((rootComment) => (
                <SingleComment 
                    key={rootComment.id} 
                    comment={rootComment} 
                    replies={getReplies(rootComment.id)} 
                    currentUserId={currentUserId}
                    updateComment={updateComment}
                    deleteComment={deleteComment}
                    activeComment={activeComment}
                    setActiveComment={setActiveComment}
                    addComment={addComment}
                    />
            ))}
        </div>
    )
}

export default Comments;