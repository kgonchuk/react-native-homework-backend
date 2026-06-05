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
  try {
    const { postId } = req.params;
    const { text, author } = req.body;


  if (!author) {
    return res.status(400).json({ message: "Автор не ідентифікований (userId відсутній)" });
  }
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { 
        $push: { 
          comments: { 
            text, 
            author, 
            postId 
          } 
        } 
      },
      { returnDocument: 'after' }
    ).populate("comments.author", "username"); 
    if (!updatedPost) {
      return res.status(404).json({ message: "Пост не знайдений" });
    }

   const newComment = updatedPost.comments[updatedPost.comments.length - 1];
await newComment.populate("author", "username"); 

res.status(201).json(newComment);
  } catch (err) {
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