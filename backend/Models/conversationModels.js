const  mongoose=require("mongoose");
const { applyTimestamps } = require("./userModels");


const conversationSchema =mongoose.Schema({
    participants:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],

    messages:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Message",
            default:[]
        }
    ],
},{timestamps:true})

const Converstaion =mongoose.model('Conversation',conversationSchema)
module.exports=Converstaion;