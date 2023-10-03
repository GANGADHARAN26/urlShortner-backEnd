import express from 'express';
import { urlSchemaModel } from '../db-utils/model.js';
import { nanoid } from 'nanoid';
const  urlRouter=express.Router();
//post method to create original url
urlRouter.post('/create',async(req,res)=>{
    try{
        const payload=req.body.fullUrl;
       const checkUrl=await urlSchemaModel.findOne({fullUrl:payload},{urlId:1,shortUrl:1,clicks:1,date:1})
        if(checkUrl){
            res.send(checkUrl)
        }else{
            const urlid=nanoid();
            const shorturl=`http://localhost:5173/shortUrl/${urlid}`
            const url=new urlSchemaModel({fullUrl:payload,urlId:urlid,shortUrl:shorturl});
            await url.save().then(()=>{console.log('Url saved',payload)});
            try{
                const Url=await urlSchemaModel.findOne({fullUrl:payload},{urlId:1,shortUrl:1,clicks:1,date:1})
                res.send(Url);
            }catch(err){console.log(err.message)}
        }
        
    }
    catch(error)
    {
     console.log(error)
    }
})
//get mehtod finding original url using urlId
urlRouter.get('/:urlId',async(req,res) => {
    try{
        const {urlId}=req.params;
        try{
            const id=await urlSchemaModel.findOne({urlId:urlId},{fullUrl:1,_id:0});
            if(id){
                await urlSchemaModel.updateOne({urlId:urlId},{$inc:{'clicks':1}})
            }
                res.send(id);
                console.log(id)
        }catch(err){res.status(err.statusCode)}
        
    }catch(err){
        console.log(err.message);
    }
})
//get all urls
urlRouter.get('/allurls',async (req, res)=>{
    try{
        await urlSchemaModel.find({},{_id:0}).toArray((err, data)=>{
            if(err) throw err;
            console.log(result)
        });
       
    }catch(err){console.log(err.message)}
})
export default urlRouter;