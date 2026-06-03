export async function createPost(req, res) {
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);

  try {
    const { title, place, content, latitude, longitude } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: "Файл не передано" });
    }

    const imageUrl = req.file.path.replace(/\\/g, "/"); // Виправляємо шлях для Windows
    
    const post = new Post({ 
      author: req.user.id, 
      title, 
      place, 
      latitude, 
      longitude, 
      image: imageUrl 
    });

    const savedPost = await post.save();
    console.log("Пост успішно збережено:", savedPost);
    res.status(201).json(savedPost);
    
  } catch (err) {
    console.error("ПОМИЛКА ЗБЕРЕЖЕННЯ:", err); // ТУТ БУДЕ ПРИЧИНА
    res.status(500).json({ message: "Помилка сервера", error: err.message });
  }
}
export async function addComment(req, res) {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Пост не знайдений" });

    post.comments.push({ author: req.user.id, text });
    await post.save();
    const updatedPost = await Post.findById(postId).populate("author", "username avatar").populate("comments.author", "username avatar");
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: "Помилка сервера" });
  }
}       