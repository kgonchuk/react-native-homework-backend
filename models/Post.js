// models/Post.js
import mongoose from "mongoose";

//Схема для коментарів до постів
const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
 text: { type: String, required: true },
}, { timestamps: true });

const postSchema = new mongoose.Schema({
 author:{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
 title: { type: String, required: true },
 content: { type: String, required: true },
 image: { type: String, default: "" },
 comments: [commentSchema]
}, { timestamps: true   });

export default mongoose.model("Post", postSchema);