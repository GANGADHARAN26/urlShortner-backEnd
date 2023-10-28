import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv .config(); 
import { userSchemaModel } from '../db-utils/model.js';
import { transport,mailOptions } from './../mail/mail.js';
const userRouter=express.Router();
//post method to register user details with email verification service
userRouter.post('/create',async function(req, res){
    const payload=req.body;
    const checkUser=await userSchemaModel.findOne({email:payload.email})
    if(checkUser){
        res.status(409).send({message:"user already exists please login"});
        console.log("user already exists so login   ")
        return;
    }
    const password=await bcrypt.hash(payload.password,10)
    const user=await userSchemaModel({...payload,password:password})
    await user.save(); 
    const verifyToken=jwt.sign({email:payload.email},process.env.JWT_SECRET,{expiresIn:'1d'})
    const link=`${process.env.FRONTEND_URL}/verify?token=${verifyToken}`
    await transport.sendMail({...mailOptions,subject:"Account verification link",to:payload.email,text:`please verify your email by clicking the verification link ${link}`})
    res.status(200).send("user created successfully"+"data -> "+JSON.stringify(payload))
    console.log("user created successfully")
}) 
//post method for login
userRouter.post('/login',async function(req,res){
    const payload=req.body;
    const user=await userSchemaModel.findOne({email: payload.email},{email:1,firstname:1,lastname:1,password:1,isVerified:1})
   if(user.isVerified===false){
    res.status(402).send({message:"user  is not verified"})
    return
   }
    else if(user){
        bcrypt.compare(payload.password,user.password,(_err,result)=>{
        if(!result){
            res.status(401).send({message:"Invalid credentials"})
            return
        }
        else{ 
            const response =user.toObject();
            delete response.password
            console.log(response)
             res.send(response)  
        }
     }) 
   }
   else{
    res.status(404).send({code:-1,message:"User not found please try to create a new user"})
   }
})
//verification method
userRouter.post('/verify',async (req, res)=>{
    const payload=req.body;
    try{
        jwt.verify(payload.token,process.env.JWT_SECRET,async(err,result)=>{
            await userSchemaModel.updateOne({email:result.email},{'$set':{isVerified:true}}) 
        })
        res.send({message:"user Verified"})
    }catch(err){
        console.log(err.message)
        res.status(500).send({message:"error in verification"})
    }
})
//forgotpassword
userRouter.post('/forgotPassword',async(req,res)=>{
    const email=req.body.email;
    const emailIsThere=await userSchemaModel.findOne({email: email},{email: email});
     console.log(emailIsThere)
    try{ 
        if(emailIsThere){
            const token=jwt.sign({email:email},process.env.JWT_SECRET,{expiresIn:'1d'});
            const link=`${process.env.FRONTEND_URL}/verifyPassword?token=${token}`
            await userSchemaModel.updateOne({email:email},{'$set':{token:token}})
            await transport.sendMail({...mailOptions,to:email,
                subject:"Forgot password  verification link",to:email,
                text:`Please verify your e-mail address to change the password using these link ${link} `})
            res.status(200).send({message:"email successfully"}) 
            console.log("email successfully"+link)
        }
        else{
            res.status(401).send({message:"invalid credentials"}); 
        } 
    }
   catch(error){
    console.log(error)
    res.status(500).send({msg:"error occured in forgot "})
   }  
})
//password verifying token
userRouter.post('/password-verify-token',async(req,res)=>{
 
    try{ 
        const token = req.body.token;
        jwt.verify(token,process.env.JWT_SECRET,async(err,result)=>{
           console.log(result,err)
            await userSchemaModel.updateOne({email:result.email},{'$set':{passwordreset:true}})
            res.send({msg:"user verifed for password reset"})
        });
       
    }
   catch{
    res.status(500).send({msg:"verfication failed"}) 
   }  
})
//updating password
userRouter.post('/updatePassword',async (req,res)=>{
    try{
        const payload=req.body;
        console.log(payload)
        const decodedtoken=jwt.verify(payload.token,process.env.JWT_SECRET)
        const hashedPassword=await bcrypt.hash(payload.password,10)
        console.log(decodedtoken.email,hashedPassword,payload.password)
        const verified=await userSchemaModel.findOne({email:decodedtoken.email},{passwordreset:1})
        console.log("verified"+verified)
        if(verified.passwordreset==true){
            await userSchemaModel.updateOne({email:decodedtoken.email},{'$set':{password:hashedPassword,token:'',passwordreset:false}});
            res.send({msg:"updated password"})
        }
        else{
            res.status(401).send({msg:"still password reset validation is not done"})
        }
       
        
    
    }catch{
        res.status(500).send({msg:"passwords updation failed"})  
    }
})
export default userRouter 