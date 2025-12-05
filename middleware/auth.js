// middleware/auth.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

export default function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(' ')[1];
    if(!token) return res.status(401).json({ message: "Invalid token" });

    // verify
    const decoded = jwt.verify(token, JWT_SECRET);
    // attach user payload and token to request
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    req.token = token;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ message: "Unauthorized - invalid token" });
  }
}
