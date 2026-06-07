import Post from "../models/Post.js";

export async function createPost(req, res) {
  try {
    const { title, place, content, latitude, longitude } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: "Файл не передано" });
    }

    const imageUrl = req.file.path.replace(/\\/g, "/"); 
    const post = new Post({ 
      author: req.user.id, 
      title, 
      place, 
      latitude, 
      longitude, 
      image: imageUrl 
    });

    const savedPost = await post.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(500).json({ message: "Помилка сервера", error: err.message });
  }
}


export async function addComment(req, res) {
    console.log("CONTROLLER RUNNING")
  try {
    const { postId } = req.params;
    const { text } = req.body; 
    const authorId = req.user._id; 

    if (!authorId) {
      return res.status(401).json({ message: "Автор не ідентифікований (відсутній токен)" });
    }
const newCommentData = { text, author: authorId, postId };
  const updatedPost = await Post.findByIdAndUpdate(
  postId,
  { $push: { comments: newCommentData } },
  { new: true }
);

    if (!updatedPost) {
      return res.status(404).json({ message: "Пост не знайдений" });
    }
//     const populatedPost = await Post.findById(postId).populate({
//   path: "comments.author",
//   select: "username avatar email" // ДОДАЙТЕ email, щоб побачити, чи взагалі працює select
// });

const populatedPost = await Post.findById(postId).populate({
  path: "comments.author",
  select: "username avatar email", // Явно запитуємо аватар
  model: "User"                    // Явно вказуємо модель
});

const validComments = populatedPost.comments.filter(c => c && c.author);
const newComment = validComments[validComments.length - 1];

// Перевірка: чи прийшов аватар у новому коментарі?
console.log("DEBUG POPULATED COMMENT:", newComment.author); 

res.status(201).json(newComment);
  } catch (err) {
    console.error("Помилка:", err);
    res.status(500).json({ message: "Помилка сервера" });
  }
}

export async function toggleLike(req, res) {
  try {
    const { postId } = req.params;
    const userId = req.user.id; 
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Пост не знайдено" });

    const isLiked = post.likes.includes(userId);
    const updateQuery = isLiked 
      ? { $pull: { likes: userId } } 
      : { $addToSet: { likes: userId } };

    const updatedPost = await Post.findByIdAndUpdate(postId, updateQuery, { new: true });
    res.status(200).json({ likes: updatedPost.likes });
  } catch (err) {
    console.log("ПОМИЛКА:", err); 
    res.status(500).json({ message: "Помилка сервера" });
  }
}