const express = require("express");
const {
  allMessages,
  sendMessage,
  sendAttachments,
  attachmentsCancel,
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);
router.route("/attachment").post(protect, sendAttachments);
router.route("/attachmentcancel").post(protect, attachmentsCancel);

module.exports = router;