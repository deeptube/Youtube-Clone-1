import React,{useState} from 'react'
import {useSelector} from  'react-redux';
import Axios from 'axios';
import SingleComment from './SingleComment'
import ReplyComment from './ReplyComment'
import { Button, Input } from 'antd';
const { TextArea } = Input;
function Comment(props) {
    const videoId = props.postId //url 에서가져옴

    const [commmetValue, setcommmetValue] = useState("")
    const user = useSelector(state=> state.user); // redux store이용

    // textarea onchange 로 반영해줘야 타이핑 표기
    const handleClick = (event) => {
        setcommmetValue(event.currentTarget.value)
    }
     
    const onSubmit = ( event )=>{
        // 버튼누를때 refresh되지않도록 추가.
        event.preventDefault();

        const variables={
            content: commmetValue,
            writer: user.userData._id, //redux store 이용
            postId: videoId
        }
        Axios.post('/api/comment/saveComment',variables)
            .then(response=>{
                if(response.data.success){
                    console.log(response.data.result);
                    props.refreshFunc(response.data.result)
                    setcommmetValue("")
                }else{
                    alert('코멘트를 저장하지 못했습니다.')
                }
            })
    }

    return (
        <div>
            <br />
            <p> Replies</p>
            <hr />
            
            {/* Comment Lists */}
            {console.log(props.commentList)}
            {/* commentList가 있으면 =>  props.commentLists &&*/}
            {props.commentList && props.commentList.map((comment, index) => (
                (!comment.responseTo &&// jsx는 React.Fragment로 감싸줘야함
                    <React.Fragment>
                        <SingleComment refreshFunc={props.refreshFunc} comment={comment} postId={videoId}/>
                        <ReplyComment refreshFunc={props.refreshFunc} parentCommentId={comment._id} postId={videoId} commentList ={props.commentList}/>
                    </React.Fragment>
                )
            ))} 
            {/* Root Comment Form */}
            <form style={{ display: 'flex' }} onSubmit={onSubmit}>
                <TextArea 
                    style={{ width: '100%', borderRadius: '5px' }}
                    onChange={handleClick}
                    value={commmetValue}
                    placeholder="write some comments"
                />
                <br />
                <Button style={{ width: '20%', height: '52px' }} onClick ={onSubmit}>Submit</Button>
            </form>

        </div>
    )
}

export default Comment
