
import express from "express"; 
import multer from "multer";
import Post from "../models/Post.js";
import authenticate from "../middleware/auth.js";
import { addComment, toggleLike } from "../controllers/post.js";

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.post("/:postId/comments", authenticate, addComment);

router.post("/", authenticate, upload.single("photo"), async (req, res) => {
  try {
    if (!req.user) {
        return res.status(401).json({ message: "Користувач не знайдений" });
    }

    const { title, place, latitude, longitude } = req.body;
    
    if (!req.file) {
        return res.status(400).json({ message: "Фото не отримано" });
    }

    const postData = {
      title,
      image: `/uploads/${req.file.filename}`, 
      location: {
        name: place || "",
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
      },
      author: req.user._id, 
    };

    console.log("ДАНІ ДЛЯ СТВОРЕННЯ ПОСТА:", postData);

    const post = await Post.create(postData);

    res.status(201).json(post);
  } catch (err) {
    console.error("Помилка:", err);
    res.status(500).json({ message: err.message });
  }
});


router.get("/", authenticate, async (req, res) => {
  
  try {
   const posts = await Post.find()
      .populate("author", "username avatar")
      .populate("comments.author", "username avatar");
      console.log("POST COMMENTS:", posts.comments);
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/:postId/toggleLike", authenticate, toggleLike)



export default router;