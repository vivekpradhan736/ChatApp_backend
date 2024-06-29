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
    console.log("req.body", req.body)
    console.log("req.body.chatId", req.body.chat)
    const { attachments, content, chat } = req.body;
    if (!attachments || !chat) {
      console.log("Invalid data passed into request");
      return res.sendStatus(400);
    }
    const myCloud = await cloudinary.v2.uploader.upload(attachments, {
      folder: "chatImages",
      width: 150,
      crop: "scale",
    });
    console.log("myCloud", myCloud)

    var newMessage = {
      sender: req.user._id,
      chat: chat,
      attachments: [{
        public_id: result.public_id,
        url: result.secure_url,
      }],
    };

    if (content !== " ") {
      newMessage.content = content;
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

  const attachmentsCancel = asyncHandler(async (req, res) => {
    console.log("Request received to cancel attachment:", req.body);

    const { public_id } = req.body;

    if (!public_id) {
      console.log("Invalid data passed into request");
      return res.sendStatus(400);
    }

    try {
      console.log("Calling Cloudinary API to delete attachment...");
      cloudinary.v2.uploader.destroy(public_id, function (error, result) {
        if (error) {
          console.error("Error during deletion of attachment:", error);
          return res.status(400).json({ message: "Attachment deletion failed", error: error.message });
        }
        console.log("Result of deletion:", result);
        res.json(result);
      });
    } catch (error) {
      console.error("Error in attachmentsCancel route:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  });
  
  module.exports = { allMessages, sendMessage, sendAttachments, attachmentsCancel };