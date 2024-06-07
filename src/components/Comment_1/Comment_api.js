export const getComments = async () =>{
    return [
        {
            id: "1",
            userName: '刘德华',
            userId: "2",
            parentId: null,
            comment: '给我一杯忘情水',
            time: new Date('2021-10-10 09:09:00'),
            attitude: 1
        },
        {
            id: "2",
            userName: '周杰伦',
            userId: "3",
            parentId: "1",
            comment: '哎哟，不错哦',
            time: new Date('2021-10-11 09:09:00'),
            attitude: 0
        },
        {
            id: "3",
            userName: '五月天',
            userId: "4",
            parentId: null,
            comment: '不打扰，是我的温柔',
            time: new Date('2021-10-11 10:09:00'),
            attitude: -1
        }
    ]
}

export const createComment = async (text, parentId = null) =>{
    return {
        id: Math.random().toString(36).substr(2, 9),
        userName: 'Anonymous',
        userId: '1',
        parentId: parentId,
        comment: text,
        time: new Date(Date.now()),
        attitude: -1
    }
}

export const updateComment = async (id, text) =>{
    return true
}
export const deleteComment = async (id) =>{
    return true
}
