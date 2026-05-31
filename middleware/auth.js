

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const [bearer, token] = authHeader.split(' ', 2);
  if (bearer !== 'Bearer' || !token) {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).exec();
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = { id: user._id, username: user.username, email: user.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
export default authenticate;