// routes/posts.js
import express from "express";
import multer from "multer";
import Post from "../models/Post.js";
import auth from "../middleware/auth.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// create post
router.post("/", auth, upload.single("photo"), async (req, res) => {
  const { name, place, latitude, longitude } = req.body;

  const post = await Post.create({
    name,
    place,
    photo: `/uploads/${req.file.filename}`,
    location: {
      latitude,
      longitude,
    },
    user: req.userId,
  });

  res.json(post);
});

// get posts
router.get("/", auth, async (req, res) => {
  const posts = await Post.find().populate("user");
  res.json(posts);
});

export default router;