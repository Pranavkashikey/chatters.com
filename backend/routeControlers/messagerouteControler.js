const Conversation = require("../Models/conversationModels"); // Fix spelling
const Message = require("../Models/messageSchema");
const { getReceiverSocketID , io} = require("../Socket/socket");

const sendMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Voice message file path
    const voiceFilePath = req.file ? `/uploads/voice/${req.file.filename}` : null;
    const textMessage = req.body.message || null;

    if (!textMessage && !voiceFilePath) {
      return res.status(400).json({ success: false, message: "Message or voice file is required" });
    }

    let chats = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!chats) {
      chats = await Conversation.create({
        participants: [senderId, receiverId],
        messages: [],
      });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message: textMessage,
      voice: voiceFilePath,
      conversationId: chats._id,
    });

    chats.messages.push(newMessage._id);
    await Promise.all([chats.save(), newMessage.save()]);

    const receiverSocketId = getReceiverSocketID(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).send({ success: true, message: newMessage });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).send({ success: false, message: "Failed to send message" });
  }
};


const getMessages = async (req, res) => {
  try {
    const { id: receiverId } = req.params;

    if (!req.user || !req.user._id) {
      return res.status(401).send({ success: false, message: "Unauthorized. User not found." });
    }

        if (req.user.isBlocked) {
      return res.status(403).send({ success: false, message: "You are blocked from viewing messages." });
    }

    const senderId = req.user._id;

    // Find the conversation between the two participants
    const chats = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate({
      path: "messages",
      populate: {
        path: "senderId receiverId conversationId",
        select: "name email",
      },
    });

    if (!chats) {
      return res.status(200).send([]); // No conversation found
    }

    res.status(200).send(chats.messages);
  } catch (error) {
    console.error("Error in getMessages:", error.message);
    res.status(500).send({
      success: false,
      message: "Failed to retrieve messages. Please try again later.",
      error: error.message,
    });
  }
};



// Add this in the same controller file

const markAsSeen = async (req, res) => {
  try {
    const { id: senderId } = req.params; // sender of the messages

    if (!req.user || !req.user._id) {
      return res.status(401).send({ success: false, message: "Unauthorized" });
    }

    const receiverId = req.user._id;

    // Update all unseen messages sent by senderId to receiverId
    await Message.updateMany(
      {
        senderId,
        receiverId,
        isSeen: false,
      },
      { $set: { isSeen: true } }
    );

    res.status(200).send({ success: true, message: "Marked as seen" });
  } catch (error) {
    console.error("Error in markAsSeen:", error);
    res.status(500).send({ success: false, message: "Failed to mark as seen" });
  }
};


//edit messages
const editMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const { message } = req.body;

    // Ensure the user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const existingMessage = await Message.findById(messageId);

    if (!existingMessage) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    // Only sender can edit the message
    if (existingMessage.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You can only edit your own messages" });
    }

    existingMessage.message = message;
    const updatedMessage = await existingMessage.save();

    return res.status(200).json({ success: true, message: updatedMessage });
  } catch (err) {
    console.error("Error editing message:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//delete message
const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    // Only sender can delete the message
    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You can only delete your own messages" });
    }

    await Message.findByIdAndDelete(messageId);

    // Also remove the message from the corresponding conversation
    await Conversation.findByIdAndUpdate(message.conversationId, {
      $pull: { messages: message._id }
    });

    return res.status(200).json({ success: true, message: "Message deleted successfully" });
  } catch (err) {
    console.error("Error deleting message:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


module.exports = { sendMessage, getMessages, markAsSeen, editMessage, deleteMessage};



