import dbConnection from "./db-utils/mongodbConnection.js";
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import urlRouter from "./routes/urlRoute.js";
import userRouter from "./routes/userRoute.js";
const app = express();
const port=process.env.PORT;
app.use(express.json());
//dbconnection
await dbConnection();
app.use(cors());
//urlRouter
app.use('/url',urlRouter)
//userRouter
app.use('/user',userRouter)
//default route
app.get('/',(req,res)=>{
   res.send("working well");
})
//port
app.listen(port,()=>{console.log("listening on port " +port)});