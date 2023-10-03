import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const username=process.env.DB_USERNAME || '';
const password=process.env.DB_PASSWORD || '';
const clusterName=process.env.DB_CLUSTER || '';
const dbName=process.env.DB_NAME || '';
const cloudDbConnection=`mongodb+srv://${username}:${password}@${clusterName}/${dbName}?retryWrites=true&w=majority`
const dbConnection=async()=>{
 try{
    await mongoose.connect(cloudDbConnection,{useNewUrlParser:true});
    console.log("Db connection established")
 }catch(error){
    console.log(error.message);
    process.exit(1)
 }
}
export default dbConnection;