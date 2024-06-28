const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  public_id: { type: String, required: true },
  url: { type: String, required: true }
});

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    attachments: [attachmentSchema], // Define attachments as an array of attachmentSchema
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
