import express from 'express'; 
import multer from 'multer';
const router = express.Router();

import {register, login, logout, refreshToken, getCurrentUser,updateAvatar} from '../controllers/auth.js';
import authenticate from '../middleware/auth.js';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });
router.post('/register', upload.single('avatar'), register);
router.get('/current', authenticate, getCurrentUser);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.post('/refresh', refreshToken);
router.patch('/avatar', authenticate, upload.single('avatar'), updateAvatar);








export default router;