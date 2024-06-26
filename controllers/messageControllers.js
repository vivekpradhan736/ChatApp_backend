const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

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
    const { public_id, url, content, chatId } = req.body;
    console.log("public_id",public_id)
    console.log("url",url)
    console.log("content",content)
    console.log("chatId",chatId)

    if (!public_id || !url || !chatId) {
      console.log("Invalid data passed into request");
      return res.sendStatus(400);
    }
    if(content === " "){
      var newMessage = {
        sender: req.user._id,
        chat: chatId,
        attachments: [{ public_id, url }],
      };
    }
    else {
      var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
        attachments: [{ public_id, url }],
      };
    }

    try {
      try {
        var message = await Message.create(newMessage);
    } catch (creationError) {
        console.error("Error during message creation:", creationError);
        res.status(400).send({ message: "Message creation failed", error: creationError.message });
        return;
    }

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
  
  module.exports = { allMessages, sendMessage, sendAttachments };