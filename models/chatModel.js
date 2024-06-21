const mongoose = require("mongoose");

const chatModel = mongoose.Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    pic: {
      type: "String",
      required: true,
      default:
        "https://uploads-ssl.webflow.com/5d9d29efe6b3b4cae46b8e66/64aee0ea835b06888c110531_13%20(1)-p-500.png",
    },
    description: { type: String, trim: true },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatModel);

module.exports = Chat;