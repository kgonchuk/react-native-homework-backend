
import express from "express"; // Обов'язково імпортуйте express
import multer from "multer";
import Post from "../models/Post.js";
import authenticate from "../middleware/auth.js";

const router = express.Router(); // <--- ЦЕЙ РЯДОК ПРОПУЩЕНО!
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
  console.log("ХТО КОРИСТУВАЧ?", req.user);
  try {

    const { title, place, latitude, longitude } = req.body;
    console.log("Чи є файл?", req.file);
    if (!title || !req.file) {
       return res.status(400).json({ message: "Заголовок та фото є обов'язковими" });
    }

    const post = await Post.create({
      title,
      image: `/uploads/${req.file.filename}`, 
      location: {
        name: place,
        latitude: parseFloat(latitude) || 0, // Якщо latitude не передано, встановлюємо 0
        longitude: parseFloat(longitude) || 0, // Якщо longitude не передано, встановлюємо 0
      },
     author: "6a1ad4615c3ab598d630789c",
    });

    res.status(201).json(post);
  } catch (err) {
    console.error("Помилка при збереженні:", err);
    res.status(500).json({ message: err.message });
  }
});
export default router;