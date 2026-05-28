import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"; 


const ACCESS_EXPIRES = "1h";
const REFRESH_EXPIRES = "7d";

export function generateToken(user) {
  const accessToken = jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );

  const refreshToken = jwt.sign(
    {
      id: user._id,

    },
    process.env.JWT_SECRET,
    { expiresIn: REFRESH_EXPIRES }
  );

  return { accessToken, refreshToken };
}



//Реєстрація користувача
export async function register(req, res) {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Користувач з таким email вже існує" });
    }
    const hashedPassword= await bcrypt.hash(password,10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    const { accessToken, refreshToken } = generateToken(newUser);
    await User.findByIdAndUpdate(newUser._id, { token: refreshToken });
    res.status(201).json({ accessToken, refreshToken, user: { id: newUser._id, username: newUser.username, email: newUser.email } });

  } catch (err) {
     console.log("реальна помилка",err);
    res.status(500).json({ message: "Помилка сервера" });
   
  }
}
//Логін користувача
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });             
    if (!user) {
      return res.status(400).json({ message: "Невірний email або пароль" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Невірний email або пароль" });
    }
    const { accessToken, refreshToken } = generateToken(user);
    await User.findByIdAndUpdate(user._id, { token: refreshToken });
    res.json({ accessToken, refreshToken, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Помилка сервера" });
  }
}   

//Logout користувача
export async function logout(req, res) {
  try {
    const userId = req.user.id;
    await User.findByIdAndUpdate(userId, { token: null });
    res.json({ message: "User logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Помилка сервера" });
  }
}     
//Оновлення користувача
export async function getCurrentUser(req, res) {
  try {
    const { id, username, email } = req.user;
    
    res.status(200).json({ username, email });
  } catch (err) {
    res.status(500).json({ message: "Помилка сервера" });
  }
}
//Оновлення токена
export async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }
const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
const user = await User.findById(decoded.id);
if (!user || user.token !== refreshToken)
  return res.status(403).json({ message: "Invalid refresh token" });
const { accessToken, refreshToken: newRefreshToken } = generateToken(user);
user.token = newRefreshToken;
await user.save();
res.json([{ accessToken, refreshToken: newRefreshToken }]);
  } catch (err) {
    if(err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Refresh token expired or invalid, please log in again" });
    }
    res.status(500).json({ message: "Помилка сервера" });
  }
}   

