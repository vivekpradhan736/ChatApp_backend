const express = require('express');
const connectDB = require('./config/db');
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware.js");
const { chats } = require('./data/data');
const path = require("path");
const cors = require('cors');
const cloudinary = require("cloudinary");
const {createServer} = require("http");
const bodyParser = require('body-parser');

dotenv.config({
  path: "./.env",
});
connectDB();
const app = express();
app.use(express.json({ limit: '10mb' })); // Increase the request size limit
app.use(bodyParser.json({ limit: '10mb' }));
// Configure CORS
const allowedOrigins = ['https://chat-app-frontend-liart.vercel.app'];
app.use(cors({
  origin: (origin, callback) => {
    // Check if the incoming origin is in the allowedOrigins array
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// routes
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

// --------------------------deployment------------------------------

const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "PRODUCTION") {
  app.use(express.static(path.join(__dirname1, "..", "frontend", "build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "..", "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// --------------------------deployment------------------------------

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`.yellow.bold)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: 'https://chat-app-frontend-liart.vercel.app',
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log("userData._id",userData._id)
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });
});