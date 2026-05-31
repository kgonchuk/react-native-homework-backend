import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  image: { type: String, default: "" },
  location: {
    name: { type: String, default: "" },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  comments: [commentSchema]
}, { timestamps: true });

export default mongoose.model("Post", postSchema);