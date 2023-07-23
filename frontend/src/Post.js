import {formatISO9075} from "date-fns";
import { Link } from "react-router-dom";

export default function Post({_id, title,summary,content,cover,createdAt,author}) {
    return (
        <div className="post">
        <div className="image">
          <Link to={`/post/${_id}`}>
          <img  alt="coverImg" src={'http://localhost:4000/'+cover}/>
          </Link>
            
        </div>
        <div className="text">
        <Link to={`/post/${_id}`}>
        <h2>{title}</h2>
        </Link>

        <p className="info">
          <a className="author">{author.username}</a>
          <time>{formatISO9075(new Date(createdAt))}</time>
        </p>
        <p className="summary">{summary}</p>
           </div>    
      </div>
    );
}