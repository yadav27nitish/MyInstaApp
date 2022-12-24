// to use import somthing from something syntex you must have add "type":"module", in package.json
import express from 'express';
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import { register } from './controllers/auth.js';
import { createPost } from './controllers/posts.js';  //this user post i.e like,feed,userpost etc
import { verifyToken } from './middleware/auth.js';
import User from './models/User.js';
import Post from './models/Post.js';
import { users, posts } from './data/index.js'



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express()
app.use(express.json);
app.use(helmet());   //helps you secure HTTP headers returned by your Express apps
app.use(helmet.crossOriginResourcePolicy({policy:"cross-origin"}));
app.use(morgan("common"));  //simplifies the process of logging requests to your application
app.use(bodyParser.json({limit:"30mb", extended:true})); //used to process data sent in an HTTP request body
app.use(bodyParser.urlencoded({limit:"30mb",extended:true}));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname,'public/assets')));  //we will store of data in this path (photos, video,etc)


/* FILE STORAGE*/ 
//Multer is a node. js middleware for handling multipart/form-data , which is primarily used for uploading files
//It will upload file/picture in local
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null, "public/assets");
    },
    filename:function(req,file,cb){
        cb(null, file.originalname);
    }
});
const upload  = multer({storage});


/* ROUTES WITH FILES */
app.post('/auth/register', upload.single('picture'), register);
app.post('/posts', verifyToken, upload.single('picture'), createPost);

/* ROUTES */
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/posts', postRoutes);


/*MONGOOSE SETUP*/
const PORT = process.env.PORT || 6001;
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser:true,
    useUnifiedTopology :true,
}).then(()=>{
    app.listen(PORT,()=>console.log(`Server Port ${PORT}`))
    //If Mongo connection will success then only our server will run on port 3001

    /* ADD DATA ONE TIME */
    // User.insertMany(users);
    // Post.insertMany(posts);
}).catch((err)=>{
    console.log(`${err} : didn't Connect`);
})
