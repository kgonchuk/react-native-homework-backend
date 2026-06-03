
import express from "express"; 
import multer from "multer";
import Post from "../models/Post.js";
import authenticate from "../middleware/auth.js";

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

router.post("/", authenticate, upload.single("photo"), async (req, res) => {
  try {
    // ВАЖЛИВО: Перевірте, що req.user існує
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
      // Використовуємо _id з документа користувача
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

// router.post("/", authenticate, upload.single("photo"), async (req, res) => {

//   console.log("ХТО КОРИСТУВАЧ ПЕРЕД СТВОРЕННЯМ:", req.user?._id);
//   try {
//     const { title, place, latitude, longitude } = req.body;
//     if (!title || !req.file) {
//        return res.status(400).json({ message: "Заголовок та фото є обов'язковими" });
//     }
//     if (!req.user) return res.status(401).json({ message: "Unauthorized" });

//     const authorId = req.user?._id || req.user?.id; 

//     if (!authorId) {
//       return res.status(401).json({ message: "Автор не ідентифікований" });
//     }
//     const post = await Post.create({
//       title,
//       image: `/uploads/${req.file.filename}`, 
//       location: {
//         name: place,
//         latitude: parseFloat(latitude) || 0,
//         longitude: parseFloat(longitude) || 0,
//       },
//     //  author: req.user._id,
//     author: "6a201a432b5b21118bfa7429",
//     });

//     res.status(201).json(post);
//   } catch (err) {
//     console.error("Помилка при збереженні:", err);
//     res.status(500).json({ message: err.message });
//   }
// });

router.get("/", authenticate, async (req, res) => {
  console.log("ЗАПИТ ДО ПОСТІВ ОТРИМАНО, КОРИСТУВАЧ:", req.user);
  try {
    const posts = await Post.find().populate("author", "username email avatar");
    console.log(JSON.stringify(posts, null, 2));
    res.status(200).json(posts);
  } catch (err) {
   console.log("ПОМИЛКА В РОУТІ:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;