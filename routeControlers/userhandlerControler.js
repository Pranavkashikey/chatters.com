const mongoose = require("mongoose");
const Conversation=require("../Models/conversationModels")

const User = require("../Models/userModels");

const getUserBySearch=async(req,res)=>{
    try{
        const search=req.query.search || '';
        const currentUserId=req.user._id;

        const user=await User.find({
            $and:[
                {
                    $or:[
                        {username:{$regex:'.*'+search+'.*',$options:'i'}},

                        {fullname:{$regex:'.*'+search+'.*',$options:'i'}}
                    ]
                },{
                    _id:{$ne:currentUserId}
                }
            ]
        }).select("-password").select("email")
        res.status(200).send(user)
    }catch(error){
        res.status(500).send({
            success:false,
            message:error
        })

        console.log(error);

    }
}



const getCurrentChatters = async (req, res) => {
  try {
    const currentUserId = new mongoose.Types.ObjectId(req.user._id);

    console.log("Fetching conversations for user:", currentUserId);

    // Fetch conversations involving the current user
    const currentChatters = await Conversation.find({
      participants: currentUserId,
    }).sort({ updatedAt: -1 });

    console.log("Fetched conversations:", currentChatters);

    if (!currentChatters || currentChatters.length === 0) {
      return res.status(200).send([]);
    }

    // Extract all other participants' IDs
    const participantsIDS = currentChatters.reduce((ids, conversation) => {
      const otherParticipants = conversation.participants.filter(
        (id) => id.toString() !== currentUserId.toString()
      );
      return [...ids, ...otherParticipants];
    }, []);

    const uniqueParticipantsIDS = [...new Set(participantsIDS)]; // Remove duplicates

    // Fetch user details for the other participants
    const users = await User.find({ _id: { $in: uniqueParticipantsIDS } })
      .select("-password -email");

    res.status(200).send(users);
  } catch (error) {
    console.error("Error in getCurrentChatters:", error);
    res.status(500).send({
      success: false,
      message: "An error occurred while fetching current chatters",
    });
  }
};

// Controller for fetching users not in conversation



module.exports={getUserBySearch,getCurrentChatters};
