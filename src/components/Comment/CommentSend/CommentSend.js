import React from 'react';

function CommentSend(props) {
  const { comment, setComment, handleAddComment } = props;

  const customIconStyle = {
    backgroundImage: `url('images/faceIcon.dataurl')`,
    backgroundSize: 'cover', // Cover the entire area of the icon
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  const textareaChange = (e) => {
    setComment(e.target.value);
  };

  const submitComment = ()=>{
    console.log('Add comment:', comment);
    handleAddComment();
    setComment('');
  }

  return (
    <div className="my-2.5 w-[90%]">  
      <div className="float-left relative m-1.5 ml-1">
        <img className="w-12 h-12 rounded-full" src={`${process.env.PUBLIC_URL +'/images/avatar.png'}`} alt="User Avatar" />
      </div>
      <div className="flex w-full relative ml-20 mr-20">
        <textarea
          cols="80"
          rows="5"
          className="flex-grow bg-gray-100 border border-gray-200 rounded text-sm p-2 resize-none outline-none transition-colors hover:border-blue-400"
          placeholder="发条友善的评论"
          value={comment}
          onChange={textareaChange}
        />
        <button className="mx-2 px-2 py-4 bg-blue-500 text-white rounded transition-colors hover:bg-blue-600 border border-blue-500"
                onClick={submitComment}>
          Add Comment
        </button>
      </div>
      <div className="inline-block ml-20 mt-0.75 cursor-pointer border border-gray-200 rounded text-center text-gray-400 hover:text-gray-600 p-0 w-16 h-6 leading-6">
        <i className="inline-block align-middle bg-no-repeat w-4 h-4 mr-1.5" style={customIconStyle}></i>
        <span className="inline-block align-middle">Emoji</span>
      </div>
    </div>
  );
}

export default CommentSend;

