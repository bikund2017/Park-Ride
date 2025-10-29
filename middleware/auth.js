import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'JWT_SECRET not configured' });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const userSnapshot = await User.collection.doc(decoded.id).get();

      if (!userSnapshot.exists) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = { id: userSnapshot.id, ...userSnapshot.data() };
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
