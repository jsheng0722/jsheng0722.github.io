import React from 'react';
function formatTime(time){
    const timeString = `${time.getHours().toString().padStart(2, '0')}:
    ${time.getMinutes().toString().padStart(2, '0')}:
    ${time.getSeconds().toString().padStart(2, '0')}`
    return `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()} ${timeString}`
}

function CommentList(props) {
  const { list, setList, deleteComment } = props;

  if (!list || !Array.isArray(list)) {
    return null;
  }

  const handleDeleteComment = (commentId) => {
    console.log(commentId);
    deleteComment(commentId);
  };

  const toggleLike = (curItem) =>{
    console.log(curItem)
    const {attitude, id} = curItem
    const updateList = list.map(item =>{
      if(item.id === id){
        return {
          ...item,
          attitude: attitude === 1 ? 0 : 1
        }
      } else{
        return item
      }
    })
    setList(updateList)
  }

  const toggleUnLike = (curItem) =>{
    console.log(curItem)
    const {attitude, id} = curItem
    const updateList = list.map(item =>{
      if(item.id === id){
        return {
          ...item,
          attitude: attitude === -1 ? 0 : -1
        }
      } else{
        return item
      }
    })
    setList(updateList)
  }

  return (
    <div className="flex flex-col space-y-6">
    {list.map((item) => (
      <div className="flex first:pt-5 last:border-b border-gray-200" key={item.id}>
        <div className="w-12 h-12 mr-4">
          <img className="rounded-full" src={`${process.env.PUBLIC_URL +'/images/avatar.png'}`} alt="" />
        </div>
        <div className="flex-1 relative ml-8 border-t border-gray-200 pt-5 pb-3">
          <div className="text-gray-600 font-bold text-sm leading-5 pb-1">{item.author}</div>
          <p className="whitespace-pre-wrap break-words text-base leading-6">{item.comment}</p>
          <div className="text-gray-400 text-sm flex items-center space-x-5">
            <span>{formatTime(item.time)}</span>
            <button onClick={() => toggleLike(item)} className={`hover:text-blue-500 ${item.attitude === 1 ? 'text-blue-500' : 'text-gray-400'}`}>
              Like
            </button>
            <button onClick={() => toggleUnLike(item)} className={`hover:text-red-500 ${item.attitude === -1 ? 'text-red-500' : 'text-gray-400'}`}>
              Dislike
            </button>
            <button className="hover:text-red-500" onClick={() => handleDeleteComment(item.id)}>
              Delete
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
  );
}

export default CommentList;
