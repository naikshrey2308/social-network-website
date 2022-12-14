// import Navbar from "../Components/Navbar";
import PostBlock from "../Components/PostBlock";

import { memo, useEffect,useState } from "react";
import ShowWholePost from "../Components/showWholePost";
import ShowTextPost from "../Components/showTextPost";
import { Link } from "react-router-dom";


function HomePage(props) {

    const [commonObject_, setCommonObject_]= useState([]);
    const [AllPosts, setAllPosts]= useState(null);
    const [modalShow , setmodalShow] = useState(false);
    const [textModalShow , setTextModalShow] = useState(false);

    useEffect(() => {
        props.setNavbar(true);

        (async function(){
            const req = await fetch('/user/getFollowing',{
                method : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({email: window.sessionStorage.getItem('email')}),
            });
            const res = await req.json();
            setCommonObject_(res.following);
            
            // console.log("inside function....");
            
            var posts = [];
            for(var i of res.following){
                const username = i.username;

                const req_ = await fetch(`/posts/imageForShow/${username}`,{
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                    },
                });
                
                const res_ = await req_.json();
                posts = posts.concat(res_.result);

                const req2 = await fetch(`posts/textForShow/${username}`,{
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                    },
                });
                const res2 = await req2.json();
                posts = posts.concat(res2.result);
            }

            posts.sort(() => (Math.random() - 0.5));
            
            if(posts){
                setAllPosts(posts);
            }
            
            console.log(posts);
        })();
    }, []);

    const [postForModal,setPostForModal]= useState({});

    function changeComment(newComment,flag){
        if(flag){
            let index = AllPosts.findIndex((val)=>val.id === postForModal.id);
            AllPosts[index].comments.push(newComment);
            postForModal.comments.push(newComment);
            flag = !flag;
        }
    }

    function modalShow_(post,type){
        console.log(type);

        if(type==='pic') setmodalShow(true);

        if(type==='text') setTextModalShow(true);


        setPostForModal(post);
    }

    return(
        <div style={{marginTop:4+'em'}} >
            {
                (!AllPosts || AllPosts.length == 0) && 
                <div className="position-absolute bg-transparent-circle top-50 start-50" style={{transform: "translate(-50%, -50%)"}}>
                    <img src={process.env.PUBLIC_URL + "/media/svgs/no-home.svg"} width="300" />
                    <h3 className="text-center my-3">Nothing to show</h3>
                    <p><Link style={{textDecoration: "none"}} to={"/discover"}>Follow</Link> people to see their updates here.</p>
                </div>
            }
            { AllPosts && <>


               { AllPosts.map(value => {
                //  console.log(value);
                return <PostBlock postObj={value} modalShow={modalShow_}/>
               }) }

                <ShowTextPost showLike={false} show={textModalShow} onHide={() => setTextModalShow(false)} post={postForModal} changecommentInUI={changeComment}/>
               
               <ShowWholePost showLike={false} show={modalShow} onHide={() => setmodalShow(false)} post={postForModal} changecommentInUI={changeComment}/>

            </>}
        </div>
    );
}
export default memo(HomePage);