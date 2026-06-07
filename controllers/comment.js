export async function addComment(req, res) {
  try {
    const { postId } = req.params;
    const { text } = req.body; // Беремо тільки текст
    
    // Тепер беремо ID автора з req.user (це результат роботи middleware authenticate)
    const authorId = req.user._id; 

    if (!authorId) {
      return res.status(401).json({ message: "Автор не ідентифікований (відсутній токен)" });
    }

    // Додаємо коментар у масив
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { 
        $push: { 
          comments: { 
            text, 
            author: authorId, 
            postId 
          } 
        } 
      },
      { returnDocument: 'after' }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Пост не знайдений" });
    }

    // Після додавання завантажуємо дані автора для цього коментаря
    const populatedPost = await Post.findById(postId).populate({
      path: "comments.author",
      select: "username avatar"
    });

    // Беремо останній коментар з оновленого списку
    const newComment = populatedPost.comments[populatedPost.comments.length - 1];

    res.status(201).json(newComment);
  } catch (err) {
    console.error("Помилка:", err);
    res.status(500).json({ message: "Помилка сервера" });
  }
}