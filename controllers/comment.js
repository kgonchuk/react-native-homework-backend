export async function addComment(req, res) {
  try {
    const { postId } = req.params;
    const { text, author } = req.body;

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: { text, author } } },
      { new: true } 
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Пост не знайдений" });
    }

    res.status(201).json(updatedPost.comments[updatedPost.comments.length - 1]);
  } catch (err) {
    console.error("Помилка:", err);
    res.status(500).json({ message: "Помилка сервера" });
  }
}