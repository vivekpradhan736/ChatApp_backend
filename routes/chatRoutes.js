const express = require("express");
const asyncHandler = require('express-async-handler');
const {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    changeGroupPic,
    removeContact,
    removeFromGroup,
    addToGroup,
  } = require("../controllers/chatControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Middleware to add CORS headers
const addCorsHeaders = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
};

router.use(addCorsHeaders); // Apply CORS headers to all routes

router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);
router.route("/group").post(protect, createGroupChat);
router.route("/rename").put(protect, renameGroup);
router.route("/changepic").put(protect, changeGroupPic);
router.route("/contactremove").delete(protect, removeContact);
router.route("/groupremove").put(protect, removeFromGroup);
router.route("/groupadd").put(protect, addToGroup);

module.exports = router;