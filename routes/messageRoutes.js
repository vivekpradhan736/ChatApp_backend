const express = require("express");
const {
  allMessages,
  sendMessage,
  sendAttachments,
  chatDelete,
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Middleware to add CORS headers
// const addCorsHeaders = (req, res, next) => {
//   res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//   next();
// };

// router.use(addCorsHeaders); // Apply CORS headers to all routes

router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);
router.route("/attachment").post(protect, sendAttachments);
router.route("/attachmentcancel").post(protect, chatDelete);

module.exports = router;
