import mongoose from "mongoose";
//schema model for the url
const urlSchema=new mongoose.Schema({
    fullUrl:{
        type:String,
        require:true
    },
    shortUrl:{
        type:String
    },
    urlId:{
        type:String
    },
    date:{
        type:Date,
        default:Date.now()
    },
    clicks:{
        type:Number,
        default:0
    }
})

const urlSchemaModel=mongoose.model('url',urlSchema)
//schema model for the user
const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    firstname:{
        type:String,
        required:true,
    },
    lastname:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    passwordreset:{
        type:Boolean,
        default:false
    }
})
const userSchemaModel=mongoose.model('User',userSchema)
export {urlSchemaModel,userSchemaModel} 