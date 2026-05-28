import express from 'express'; 
const router = express.Router();

import {register, login, logout, refreshToken, getCurrentUser} from '../controllers/auth.js';
import authenticate from '../middleware/auth.js';


router.post('/register',register);
router.get('/current', authenticate, getCurrentUser);
router.post('/login',login);
router.post('/logout', authenticate,logout);
router.post('/refresh', refreshToken);








export default router;