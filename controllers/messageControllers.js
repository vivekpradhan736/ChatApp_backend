const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const cloudinary = require("cloudinary");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
    try {
      const messages = await Message.find({ chat: req.params.chatId })
        .populate("sender", "name pic email")
        .populate("chat");
      res.json(messages);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  });

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;
  
    if (!content || !chatId) {
      console.log("Invalid data passed into request");
      return res.sendStatus(400);
    }
  
    var newMessage = {
      sender: req.user._id,
      content: content,
      chat: chatId,
    };
  
    try {
      var message = await Message.create(newMessage);
  
      message = await message.populate("sender", "name pic");
      message = await message.populate("chat");
      message = await User.populate(message, {
        path: "chat.users",
        select: "name pic email",
      });
  
      await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
  
      res.json(message);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  });

  const sendAttachments = asyncHandler(async (req, res) => {
    console.log("Received data:", req.body);
    const { attachments, content, chat } = req.body;
  
    if (!attachments || !chat) {
      console.log("Invalid data passed into request");
      return res.sendStatus(400);
    }
  
    try {
      const myCloud = await cloudinary.v2.uploader.upload(attachments, {
        folder: "chatImages",
        quality: "auto:good", // Use "auto:best" for the highest quality
        fetch_format: "auto"
      });
      console.log("Cloudinary response:", myCloud);
  
      var newMessage = {
        sender: req.user._id,
        chat: chat,
        attachments: [{
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        }],
      };
  
      if (content !== " ") {
        newMessage.content = content;
      }
  
      try {
        var message = await Message.create(newMessage);
      } catch (error) {
        console.error("Error during message creation:", error);
        res.status(400).send({ message: "Message creation failed", error: error.message });
        return;
      }
  
      message = await message.populate("sender", "name pic");
      message = await message.populate("chat");
      message = await User.populate(message, {
          path: "chat.users",
          select: "name pic email",
      });
  
      await Chat.findByIdAndUpdate(req.body.chat, { latestMessage: message });
  
      res.json(message);
    } catch (error) {
      console.error("Error in sendAttachments:", error);
      res.status(400).send({ message: "Attachment processing failed", error: error.message });
    }
  });

  const chatDelete = asyncHandler(async (req, res) => {
    console.log("Request received to delete chat:", req.body);
  
    const { chatId, attachments } = req.body;
  
    if (!chatId) {
      console.log("Invalid data passed into request");
      return res.sendStatus(400);
    }
  
    try {
      const chat = await Message.findById(chatId);
      console.log("chat", chat);
  
      if (!chat) {
        return res.status(404).json({ message: "Chat Not Found" });
      }
  
      if (attachments && attachments.public_id) {
        console.log("Calling Cloudinary API to delete attachment...");
        await cloudinary.v2.uploader.destroy(attachments.public_id);
      }

      if(chat?.isDeletedChat === true){
        await chat.deleteOne();
      }
      else{
        console.log("Updating chat content to indicate deletion...");
        chat.content = "You deleted the message";
        chat.isDeletedChat = true;
        chat.attachments = []; // Remove attachments
        await chat.save();
      }
      res.status(200).json({
        success: true,
        message: "Chat successfully deletion",
      });
    } catch (error) {
      console.error("Error during chat deleted:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  });
  
  module.exports = { allMessages, sendMessage, sendAttachments, chatDelete };