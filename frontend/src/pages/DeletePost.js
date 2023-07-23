import { useState } from "react";
import { Navigate, useParams } from "react-router-dom"

export default function DeletePost(){
    const {id} = useParams();
    const [redirect, setRedirect] = useState(false);

    async function deletePost(ev){
        ev.preventDefault();
        const response =  await fetch("http://localhost:4000/delete/"+id,{
            method:"DELETE",
            credentials:'include'
        });
        if (response.ok) {
            setRedirect(true);
            alert("Post deleted")
          }
    }
    function cancel(){
        setRedirect(true);
    }
    
    if (redirect) {
        return <Navigate to={'/'}></Navigate>
    }

    return (
        <div>
            <h5>Are you sure you want to delete your post?</h5>
        
            <button onClick={deletePost}  className="delete-btn">Delete</button>
            <br/>
            <button onClick={cancel} className="cancel-btn">cancel</button>
        </div>
    )
}