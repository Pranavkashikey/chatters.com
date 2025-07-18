const mongoose=require("mongoose");

const messageSchema=mongoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    message:{
        type:String,
        required:null,
    },
    conversationId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Conversation",
        default:[]
    },
    type: { type: String, enum: ["text", "voice"], default: "text" },
    voiceUrl: { type: String },
    isSeen: {
         type: Boolean,
         default: false,
    },

    
},{timestamps:true})

const Message=mongoose.model("Message",messageSchema);

module.exports=Message;