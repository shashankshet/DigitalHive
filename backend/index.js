const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const bcryprt = require('bcryptjs'); 
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const fs = require('fs');
const uploadMiddleware = multer({dest:'uploads/'})

const salt = bcryprt.genSaltSync(10);
const secret = "edkn2ufu4b9b3irvn3ov";

app.use(cors({credentials:true,origin:"http://localhost:3000"}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads',express.static(__dirname+'/uploads'));

mongoose.connect('mongodb+srv://Mongo-demo:3nKAaI5rQrFtYZxQ@cluster0.eorfljg.mongodb.net/?retryWrites=true&w=majority');


app.get("/ping",(req,res)=>{
    res.json("ok");
});

app.post("/login", async(req,res)=>{
    const {username,password}=req.body;
    const userDoc = await User.findOne({username});
    const passOk = bcryprt.compareSync(password,userDoc.password);
    if(passOk){
        //login
        jwt.sign({username,id:userDoc._id},secret, {}, (err,token)=>{
            if(err) throw err;
            res.cookie('token',token).json({
                id:userDoc._id,
                username
            });
        });
    }
    else{
        res.status(400).json("invalid user credentials");
    }
});


app.post("/register",async (req,res)=>{
    const {username,password} =req.body;
    try{
        const UserDoc = await User.create({
            username,
            password:bcryprt.hashSync(password,salt),
        });
        res.json(UserDoc);
    }
    catch(e){
        res.status(400).json(e);
    }
    
});

app.get("/profile",(req,res)=>{
    const {token}=req.cookies;
    jwt.verify(token,secret,{},(err,info)=>{
        if(err) throw err;
        res.json(info);
    });
});

app.post('/logout', (req,res) => {
    res.cookie('token', '').json('ok');
  });

app.post("/post",uploadMiddleware.single('file'),async(req,res)=>{
    const {originalname,path} = req.file; 
    const parts = originalname.split('.');
    const ext  = parts[parts.length -1];
    const newPath = path+'.'+ext
    fs.renameSync(path,newPath); 
    const {token}=req.cookies;
    jwt.verify(token,secret,{}, async(err,info)=>{
        if(err) throw err;
        const {title,summary,content} = req.body;
        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover:newPath,
            author:info.id,
            
        });
        res.json(postDoc);
    });
})

app.put("/post", uploadMiddleware.single('file'),async(req,res)=>{
    let newPath = null;
    if(req.file){
        const {originalname,path} = req.file; 
        const parts = originalname.split('.');
        const ext  = parts[parts.length -1];
        newPath = path+'.'+ext
        fs.renameSync(path,newPath); 
    }
    const {token}=req.cookies;

    jwt.verify(token,secret,{}, async(err,info)=>{
        if(err) throw err;
        const {id, title,summary,content} = req.body;
        const postDoc = await Post.findById(id);
        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id)
        if(!isAuthor){
            return res.status(400).json({message:"you are not the author"});
        }
        await postDoc.updateOne({
            title,
            summary,
            content,
            cover: newPath ? newPath : postDoc.cover,
          });

        res.status(200).json({"message":postDoc});
    });
})

app.get("/post",async (req,res)=>{
    res.json(await Post.find());
});

app.get('/post/:id', async (req, res) => {
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
  })

app.delete('/delete/:id',async (req,res)=>{
    const {id} = req.params;
    Post.findByIdAndDelete(id)
    .then(() => {
      res.send(`Record with ID ${id} has been deleted.`);
    })
    .catch((error) => {
      res.status(500).send('Error deleting the record.');
    });
})

app.listen(4000,()=>{
console.log("backend server running at localhost:4000")});
