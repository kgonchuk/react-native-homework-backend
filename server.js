import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
 console.log(`отримано запит: ${req.method} ${req.url}`);
  next();
});
app.use((req, res, next) => {
  console.log('--- Запит отримано ---');
  console.log('Content-Type:', req.headers['content-type']);
  next();
});




app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/uploads", express.static("uploads"));


app.use((req, res) => {
console.log("ЗАПИТ НЕ ЗНАЙДЕНО ДЛЯ:", req.method, req.url);
  res.status(404).json({ message: "Not found" });
});

console.log("наша база даних:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI, { dbName: "db_users" })
  .then((conn) => console.log("DB connected to", conn.connection.name))
  .catch(err => console.log(err));

app.listen(3000, '0.0.0.0', () => { 
  console.log('Server is running on 0.0.0.0:3000'); 
});